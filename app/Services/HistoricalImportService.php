<?php

namespace App\Services;

use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Sale;
use Carbon\Carbon;
use Exception;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class HistoricalImportService
{
    public function analyzeFile(UploadedFile $file): array
    {
        $data = $this->extractDataFromExcel($file);

        $excelProducts = $data->pluck('producto')
            ->filter()
            ->map(fn($item) => trim($item))
            ->unique()
            ->values();

        $dbProducts = Product::pluck('name')
            ->map(fn($name) => mb_strtolower(trim($name)))
            ->toArray();

        $matched = [];
        $missing = [];

        foreach ($excelProducts as $excelProduct) {
            if (in_array(mb_strtolower($excelProduct), $dbProducts)) {
                $matched[] = $excelProduct;
            } else {
                $missing[] = $excelProduct;
            }
        }

        return [
            'total_unique'  => $excelProducts->count(),
            'matched_count' => count($matched),
            'missing_count' => count($missing),
            'matched'       => $matched,
            'missing'       => $missing,
        ];
    }

    public function importData(UploadedFile $file): array
    {
        $data = $this->extractDataFromExcel($file);
        $groupedOrders = $this->groupOrders($data);

        $userId = Auth::id() ?? 1;
        $ordersImported = 0;

        DB::beginTransaction();
        try {
            foreach ($groupedOrders as $orderData) {
                $this->processSingleOrder($orderData, $userId);
                $ordersImported++;
            }

            DB::commit();
            return [
                'success' => true,
                'message' => "Se importaron {$ordersImported} comandas exitosamente."
            ];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function processSingleOrder(array $orderData, int $userId): void
    {
        $customer = Customer::firstOrCreate([
            'name' => $orderData['customer_name'] ?? 'Cliente General'
        ]);

        $order = new Order();
        $order->timestamps  = false;
        $order->user_id     = $userId;
        $order->customer_id = $customer->id;
        $order->table_id    = null;
        $order->total       = $orderData['total'];
        $order->status      = $orderData['status'];
        $order->created_at  = $orderData['date'];
        $order->updated_at  = $orderData['date'];
        $order->save();

        $this->createOrderDetails($order->id, $orderData['items'], $orderData['date']);

        if ($orderData['status'] === 'closed') {
            $this->createSaleRecord($order->id, $userId, $orderData);
        }
    }

    private function createOrderDetails(int $orderId, array $items, Carbon $date): void
    {
        foreach ($items as $item) {
            if (!empty($item['product_id'])) {
                $detail = new OrderDetail();
                $detail->timestamps = false;
                $detail->order_id   = $orderId;
                $detail->product_id = $item['product_id'];
                $detail->quantity   = $item['quantity'];
                $detail->unit_price = $item['unit_price'];
                $detail->subtotal   = $item['subtotal'];
                $detail->created_at = $date;
                $detail->updated_at = $date;
                $detail->save();
            }
        }
    }

    private function createSaleRecord(int $orderId, int $userId, array $orderData): void
    {
        $sale = new Sale();
        $sale->timestamps     = false;
        $sale->order_id       = $orderId;
        $sale->user_id        = $userId;
        $sale->total          = $orderData['total'];
        $sale->payment_method = $orderData['payment_method'];
        $sale->created_at     = $orderData['date'];
        $sale->updated_at     = $orderData['date'];
        $sale->save();
    }

    private function groupOrders(Collection $data): array
    {
        $groupedOrders = [];

        $currentDate = null;
        $currentHour = null;
        $currentState = null;
        $currentPayment = null;

        $currentOrderIdentifier = null;
        $currentName = 'Cliente General';

        $dbProducts = Product::select('id', 'name')->get();

        $fallbackId = 0;

        foreach ($data as $row) {
            $rowArray = $row->toArray();

            $productoCelda = trim((string)($rowArray['producto'] ?? ''));
            if ($productoCelda === '') continue;

            if (!empty(trim($rowArray['fecha'] ?? ''))) $currentDate = trim($rowArray['fecha']);
            if (!empty(trim($rowArray['hora'] ?? ''))) $currentHour = trim($rowArray['hora']);
            if (!empty(trim($rowArray['estado'] ?? ''))) $currentState = trim($rowArray['estado']);
            if (!empty(trim($rowArray['medio_pago'] ?? ''))) $currentPayment = trim($rowArray['medio_pago']);

            $idKey = collect(array_keys($rowArray))->first(fn($k) => str_contains(mb_strtolower($k), 'comanda'));
            $idCelda = $idKey ? trim((string)($rowArray[$idKey] ?? '')) : '';

            if (str_ends_with($idCelda, '.0')) {
                $idCelda = substr($idCelda, 0, -2);
            }

            $nombreCelda = trim((string)($rowArray['nombre'] ?? ''));

            if ($idCelda !== '') {
                $currentOrderIdentifier = 'ID_' . $idCelda;
                $currentName = $nombreCelda !== '' ? $nombreCelda : 'Cliente General';
            } elseif ($nombreCelda !== '') {
                $currentOrderIdentifier = 'NAME_' . $nombreCelda;
                $currentName = $nombreCelda;
            } elseif (empty($currentOrderIdentifier)) {
                $fallbackId++;
                $currentOrderIdentifier = 'AUTO_' . $fallbackId;
                $currentName = 'Cliente General';
            }

            // CORRECCIÓN CLAVE: Agrupamos SOLO por la fecha sin la hora
            $dateOnly = $currentDate ? explode(' ', trim($currentDate))[0] : '1899-12-30';
            $orderKey = $dateOnly . '_' . $currentOrderIdentifier;

            if (!isset($groupedOrders[$orderKey])) {
                $groupedOrders[$orderKey] = [
                    'date'           => $this->parseDate($currentDate, $currentHour),
                    'customer_name'  => $currentName,
                    'status'         => mb_strtolower($currentState) === 'cerrada' ? 'closed' : 'open',
                    'payment_method' => $this->normalizePaymentMethod($currentPayment),
                    'total'          => 0,
                    'items'          => []
                ];
            }

            $qty = (float) ($rowArray['q'] ?? 1);
            $rawPx = trim((string) ($rowArray['px'] ?? '0'));
            $rawPx = preg_replace('/[,.]00$/', '', $rawPx);
            $price = (float) preg_replace('/[^\d]/', '', $rawPx);

            $subtotal = $qty * $price;

            $productNameLower = mb_strtolower($productoCelda);
            $matchedProduct = $dbProducts->first(function ($p) use ($productNameLower) {
                return str_contains(mb_strtolower($p->name), $productNameLower);
            });

            $groupedOrders[$orderKey]['items'][] = [
                'product_id' => $matchedProduct ? $matchedProduct->id : null,
                'quantity'   => $qty,
                'unit_price' => $price,
                'subtotal'   => $subtotal
            ];

            $groupedOrders[$orderKey]['total'] += $subtotal;
        }

        return $groupedOrders;
    }

    private function extractDataFromExcel(UploadedFile $file): Collection
    {
        // Volvemos a la extracción normal, sin la pesada carga de las fórmulas
        return Excel::toCollection(new class implements ToCollection, WithHeadingRow {
            public function collection(Collection $collection): Collection
            {
                return $collection;
            }
        }, $file)->first();
    }

    private function parseDate(mixed $date, mixed $hour): Carbon
    {
        try {
            $dateValue = trim((string)$date);
            $carbonDate = null;

            if (is_numeric($dateValue)) {
                $numericDate = (float) $dateValue;
                $days = (int) $numericDate;
                $fraction = $numericDate - $days;

                $carbonDate = Carbon::create(1899, 12, 30, 0, 0, 0)->addDays($days);

                if ($fraction > 0) {
                    $carbonDate->addSeconds((int)round($fraction * 86400));
                }
            } else {
                $parts = explode(' ', $dateValue);
                $dateStr = str_replace('/', '-', $parts[0]);
                $carbonDate = Carbon::parse($dateStr);

                if (isset($parts[1])) {
                    $carbonDate = $this->applyTimeToCarbon($carbonDate, $parts[1]);
                }
            }

            if (!empty($hour)) {
                $carbonDate = $this->applyTimeToCarbon($carbonDate, $hour);
            }

            return $carbonDate;
        } catch (\Throwable $e) {
            Log::error("Fallo crítico en parseDate. Valor: [{$date}]. Razón: " . $e->getMessage());
            throw new Exception("Error interpretando la fecha: {$date}");
        }
    }

    private function applyTimeToCarbon(Carbon $date, mixed $hour): Carbon
    {
        $hourValue = trim((string)$hour);

        if (empty($hourValue)) return $date;

        if (is_numeric($hourValue)) {
            $seconds = (int)round(((float)$hourValue) * 86400);
            return $date->startOfDay()->addSeconds($seconds);
        }

        try {
            $hourStr = mb_strtolower($hourValue);
            $hourStr = str_replace(['a.m.', 'p.m.', 'a.m', 'p.m', 'am', 'pm'], [' am', ' pm', ' am', ' pm', ' am', ' pm'], $hourStr);

            $hourStr = preg_replace('/(\d{1,2})\.(\d{2})/', '$1:$2', $hourStr);

            if (preg_match('/^(\d{1,2})(\d{2})\s*(am|pm)$/i', trim($hourStr), $matches)) {
                $hourStr = $matches[1] . ':' . $matches[2] . ' ' . $matches[3];
            }

            $hourStr = trim(preg_replace('/\s+/', ' ', $hourStr));

            return Carbon::parse($date->format('Y-m-d') . ' ' . $hourStr);
        } catch (\Throwable $e) {
            Log::warning("Hora descartada por formato erróneo [{$hourValue}]. Se usará 00:00. " . $e->getMessage());
            return $date->startOfDay();
        }
    }

    private function normalizePaymentMethod(mixed $method): string
    {
        $method = mb_strtolower(trim((string)$method));

        return match (true) {
            str_contains($method, 'nequ')      => 'nequi',
            str_contains($method, 'daviplata') => 'daviplata',
            default                            => 'efectivo',
        };
    }
}
