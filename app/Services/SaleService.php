<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Exception;

class SaleService
{
    protected $stockService;

    public function __construct(StockMovementService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function processSale(array $data, int $userId): Sale
    {
        try {
            DB::beginTransaction();

            // A. Registrar la cabecera de la venta
            $sale = Sale::create([
                'user_id' => $userId,
                // Si la venta viene del POS, no hay orden ni cliente, así que guardamos null
                'customer_id' => $data['customer_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'total' => $data['total'],
                'payment_method' => $data['payment_method'],
                'status' => 'completed',
            ]);

            // B. Recorrer el carrito de compras
            foreach ($data['items'] as $item) {

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                ]);

                // B.2 Descontar el inventario aplicando fraccionamiento
                // Cambiamos 'recipes.ingredient' por 'ingredients'
                $product = Product::with('ingredients')->find($item['product_id']);

                if ($product && $product->ingredients->isNotEmpty()) {
                    foreach ($product->ingredients as $ingredient) {
                        
                        // 1. Obtenemos el factor de conversión (evitamos división por cero)
                        $factor = ($ingredient->conversion_factor > 0) 
                                    ? $ingredient->conversion_factor 
                                    : 1;

                        // 2. Calculamos la fracción exacta usando pivot->quantity
                        // Ej: (30ml de Ron * 2 Mojitos vendidos) / 750ml = 0.08 Botellas
                        $fractionToDeduct = ($ingredient->pivot->quantity * $item['quantity']) / $factor;

                        // 3. Lo convertimos a negativo para el servicio de stock
                        $totalIngredientToDeduct = -($fractionToDeduct);

                        $this->stockService->recordMovement(
                            $ingredient,
                            $totalIngredientToDeduct,
                            'sale',
                            "Venta POS #{$sale->id} - {$product->name}",
                            $userId
                        );
                        
                        // Opcional: También descontar directamente de la tabla ingredients si no usas solo el stockService
                        // $ingredient->decrement('current_stock', $fractionToDeduct);
                    
                    }
                }
            }

            DB::commit();

            return $sale;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}