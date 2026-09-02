<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Table;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderDraftingService
{
    protected $tableService;

    public function __construct(TableManagementService $tableService)
    {
        $this->tableService = $tableService;
    }

    public function openOrder(int $userId, ?Table $table = null, ?int $customerId = null): Order
    {
        return DB::transaction(function () use ($userId, $table, $customerId) {
            if ($table) {
                $this->tableService->markAsOccupied($table);
            }

            return Order::create([
                'table_id' => $table ? $table->id : null,
                'user_id' => $userId,
                'customer_id' => $customerId,
                'status' => 'open',
                'total' => 0
            ]);
        });
    }

    public function addItem(Order $order, Product $product, int $quantity, ?string $notes = null): OrderDetail
    {
        if ($order->status !== 'open') {
            throw new Exception("No se puede modificar una comanda cerrada o cancelada.");
        }

        $subtotal = $product->sale_price * $quantity;

        return DB::transaction(function () use ($order, $product, $quantity, $subtotal, $notes) {
            $detail = OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $product->sale_price,
                'subtotal' => $subtotal,
                'notes' => $notes,
                'status' => 'pending'
            ]);

            $order->increment('total', $subtotal);

            return $detail;
        });
    }
}
