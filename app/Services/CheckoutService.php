<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Exception;

class CheckoutService
{
    protected $inventoryDeductionService;
    protected $tableService;

    public function __construct(
        InventoryDeductionService $inventoryDeductionService,
        TableManagementService $tableService
    ) {
        $this->inventoryDeductionService = $inventoryDeductionService;
        $this->tableService = $tableService;
    }

    public function processPayment(Order $order, string $paymentMethod, int $cashierId): Sale
    {
        if ($order->status !== 'open') {
            throw new Exception("Esta comanda ya fue cobrada o cancelada.");
        }

        return DB::transaction(function () use ($order, $paymentMethod, $cashierId) {
            // 1. Crear Venta
            $sale = Sale::create([
                'order_id' => $order->id,
                'user_id' => $cashierId,
                'customer_id' => $order->customer_id,
                'total' => $order->total,
                'payment_method' => $paymentMethod,
            ]);

            // 2. Descontar Inventario por cada producto (SRP en acción)
            $order->load('details.product');
            foreach ($order->details as $detail) {
                $this->inventoryDeductionService->deductFromRecipe(
                    $detail->product,
                    $detail->quantity,
                    $cashierId,
                    "Venta Ticket #{$sale->id}"
                );
            }

            // 3. Cerrar Orden y Liberar Mesa
            $order->update(['status' => 'closed']); // <-- Esta es la pieza faltante

            $tableModel = $order->table()->first();
            if ($tableModel) {
                $this->tableService->releaseTable($tableModel);
            }

            return $sale;
        });
    }
}
