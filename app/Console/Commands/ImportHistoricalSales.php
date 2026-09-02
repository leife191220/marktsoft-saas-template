<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Sale;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ImportHistoricalSales extends Command
{
    protected $signature = 'import:sales {filepath}';
    protected $description = 'Importa el control diario de ventas desde un archivo Excel';

    public function handle()
    {
        $filePath = $this->argument('filepath');

        if (!file_exists($filePath)) {
            $this->error("El archivo no existe en la ruta: {$filePath}");
            return;
        }

        $this->info("Iniciando importación desde: {$filePath}");

        // Leemos la primera hoja del Excel como una colección
        // Nota: Asegúrate de configurar Maatwebsite para que lea la primera fila como encabezados (heading row)
        $data = Excel::toCollection(new class implements \Maatwebsite\Excel\Concerns\ToCollection, \Maatwebsite\Excel\Concerns\WithHeadingRow {
            public function collection(\Illuminate\Support\Collection $collection) { return $collection; }
        }, $filePath)->first();

        // Variables para rellenar los datos "en blanco" hacia abajo (Forward Fill)
        $currentDate = null;
        $currentHour = null;
        $currentName = null;
        $currentTable = null;
        $currentState = null;
        $currentPayment = null;

        $groupedOrders = [];

        foreach ($data as $index => $row) {
            // Ignoramos filas totalmente vacías
            if (empty($row['producto'])) continue;

            // Forward Fill: Si la celda tiene dato, lo guardamos. Si no, usamos el anterior.
            $currentDate = $row['fecha'] ?? $currentDate;
            $currentHour = $row['hora'] ?? $currentHour;
            $currentName = $row['nombre'] ?? $currentName;
            $currentTable = $row['mesa_barra'] ?? $currentTable;
            $currentState = $row['estado'] ?? $currentState;
            $currentPayment = $row['medio_pago'] ?? $currentPayment;

            // Clave única para agrupar la comanda (Fecha + Hora + Nombre)
            $orderKey = $currentDate . '_' . $currentHour . '_' . $currentName;

            if (!isset($groupedOrders[$orderKey])) {
                $groupedOrders[$orderKey] = [
                    'date' => $this->parseDate($currentDate, $currentHour),
                    'customer_name' => $currentName,
                    'table_name' => $currentTable,
                    'status' => strtolower($currentState) === 'cerrada' ? 'closed' : 'open',
                    'payment_method' => strtolower(trim($currentPayment)),
                    'total' => 0,
                    'items' => []
                ];
            }

            // Mapear el nombre del producto del Excel a un ID real de la BD
            $productName = trim($row['producto']);
            $product = Product::where('name', 'LIKE', "%{$productName}%")->first();
            $productId = $product ? $product->id : null; // Idealmente, todos deberían existir

            $qty = (float) $row['q'];
            $price = (float) $row['px'];
            $subtotal = $qty * $price;

            $groupedOrders[$orderKey]['items'][] = [
                'product_id' => $productId,
                'product_name_fallback' => $productName, // Por si no existe en BD
                'quantity' => $qty,
                'unit_price' => $price,
                'subtotal' => $subtotal
            ];

            $groupedOrders[$orderKey]['total'] += $subtotal;
        }

        $this->info("Se encontraron " . count($groupedOrders) . " comandas para importar.");

        // --- Fase de Inserción en Base de Datos ---
        DB::beginTransaction();
        try {
            $barProgress = $this->output->createProgressBar(count($groupedOrders));

            foreach ($groupedOrders as $orderData) {
                // 1. Crear la Orden (Histórica)
                $order = Order::create([
                    'customer_name' => $orderData['customer_name'],
                    // Si 'table_name' no existe en tu BD actual, podrías asignarle una mesa temporal o null
                    'table_id' => null,
                    'total' => $orderData['total'],
                    'status' => $orderData['status'],
                    'created_at' => $orderData['date'],
                    'updated_at' => $orderData['date'],
                ]);

                // 2. Crear los Detalles
                foreach ($orderData['items'] as $item) {
                    if ($item['product_id']) {
                        OrderDetail::create([
                            'order_id' => $order->id,
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'unit_price' => $item['unit_price'],
                            'subtotal' => $item['subtotal'],
                        ]);
                    } else {
                        $this->warn("\nProducto no encontrado en BD: '{$item['product_name_fallback']}'. No se importó este ítem.");
                    }
                }

                // 3. Crear la Venta si está cerrada
                if ($orderData['status'] === 'closed') {
                    // Limpieza del método de pago (Nequí -> nequi, etc)
                    $pm = $this->normalizePaymentMethod($orderData['payment_method']);

                    Sale::create([
                        'order_id' => $order->id,
                        // Asignamos a tu usuario o al primer admin
                        'user_id' => 1,
                        'total' => $orderData['total'],
                        'payment_method' => $pm,
                        'created_at' => $orderData['date'],
                        'updated_at' => $orderData['date'],
                    ]);
                }

                $barProgress->advance();
            }

            DB::commit();
            $barProgress->finish();
            $this->info("\n¡Importación finalizada con éxito!");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("\nError durante la importación: " . $e->getMessage());
        }
    }

    private function parseDate($date, $hour)
    {
        // Esta función debe limpiar el formato de fecha de Excel (generalmente un número serial o Y-m-d)
        // y concatenarle la hora (ej. '6:00:00 p.m').
        // Implementación simplificada:
        try {
            // Si $date es un objeto de Carbon o un formato Y-m-d desde Excel
            $dateStr = $date instanceof Carbon ? $date->format('Y-m-d') : Carbon::parse($date)->format('Y-m-d');

            // Limpiar la hora si viene con p.m / a.m raro
            $hourStr = str_replace(['a.m', 'p.m', '.'], ['AM', 'PM', ''], $hour);

            return Carbon::parse($dateStr . ' ' . trim($hourStr));
        } catch (\Exception $e) {
            return Carbon::now(); // Fallback si el formato es muy extraño
        }
    }

    private function normalizePaymentMethod($method)
    {
        $method = strtolower(trim($method));
        if (str_contains($method, 'nequ')) return 'nequi';
        if (str_contains($method, 'daviplata')) return 'daviplata';
        if (str_contains($method, 'efectivo')) return 'efectivo';
        return 'efectivo'; // Default
    }
}
