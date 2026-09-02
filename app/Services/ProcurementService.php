<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Expense;
use App\Models\Ingredient;
use App\Models\Category; // IMPORTANTE: Agregado para buscar el ID
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class ProcurementService
{
    protected $stockService;

    public function __construct(StockMovementService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function recordPurchase(array $data)
    {
        return DB::transaction(function () use ($data) {
            
            $userId = Auth::id() ?? 1;

            // 1. Creamos la compra
            $purchase = Purchase::create([
                'supplier_id'    => $data['supplier_id'],
                'invoice_number' => $data['invoice_number'] ?? null,
                'total_amount'   => $data['total_amount'],
                'purchase_date'  => $data['purchase_date'] ?? now(),
                'status'         => 'completed',
                'payment_method' => $data['payment_method'] ?? 'transferencia'
            ]);

            foreach ($data['items'] as $item) {
                PurchaseItem::create([
                    'purchase_id'   => $purchase->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity'      => $item['quantity'],
                    'unit_price'    => $item['unit_price'],
                    'subtotal'      => $item['quantity'] * $item['unit_price'],
                ]);

                $ingredient = Ingredient::find($item['ingredient_id']);

                if ($ingredient) {
                    // A. Ingresamos la mercancía a bodega
                    $this->stockService->recordMovement(
                        $ingredient,
                        $item['quantity'],
                        'purchase',
                        "Compra a proveedor. Factura/Ref: " . ($purchase->invoice_number ?? 'S/N'),
                        $userId
                    );

                    // B. Actualizamos el costo del insumo para que los reportes de ganancia sean exactos
                    $ingredient->update(['cost_per_unit' => $item['unit_price']]);

                    // C. TU LÓGICA DE BAR: Desechables y operativos se consumen al instante
                    // (Asegúrate de que 'is_operative_expense' exista en tu base de datos)
                    if (isset($ingredient->is_operative_expense) && $ingredient->is_operative_expense) {
                        $this->stockService->recordMovement(
                            $ingredient,
                            -($item['quantity']), // Salida automática
                            'waste',
                            "Salida automática: Insumo operativo/desechable consumido al ingreso.",
                            $userId
                        );
                    }
                }
            }

            // 2. Buscamos o creamos la Categoría para obtener su ID real
            $category = Category::firstOrCreate(
                ['name' => 'Compras de Inventario', 'type' => 'expense'],
                ['is_personal' => false, 'is_active' => true]
            );

            // 3. Registramos el Gasto con los campos correctos de tu modelo Expense
            Expense::create([
                'user_id'      => $userId,
                'category_id'  => $category->id,
                'supplier_id'  => $purchase->supplier_id, // Enlazamos el proveedor al gasto
                'expense_date' => $purchase->purchase_date,
                'description'  => "Compra de insumos. Factura: " . ($purchase->invoice_number ?? 'S/N'),
                'amount'       => $purchase->total_amount,
            ]);

            return $purchase;
        });
    }
}