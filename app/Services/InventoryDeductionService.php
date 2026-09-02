<?php

namespace App\Services;

use App\Models\Product;

class InventoryDeductionService
{
    protected $stockService;

    public function __construct(StockMovementService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Calcula y deduce los insumos basados en la receta y la conversión de unidades.
     */
    public function deductFromRecipe(Product $product, int $quantitySold, int $userId, string $reference = 'Venta POS'): void
    {
        $product->loadMissing('recipes.ingredient');

        foreach ($product->recipes as $recipe) {
            $ingredient = $recipe->ingredient;
            
            // LA MAGIA: Si no hay factor de conversión definido, asumimos 1 para evitar errores matemáticos.
            $factor = $ingredient->conversion_factor > 0 ? $ingredient->conversion_factor : 1;

            // Cantidad total fraccionada (Ej: (30ml * 2 mojitos) / 750ml de la botella = 0.08 botellas)
            $fractionToDeduct = ($recipe->quantity * $quantitySold) / $factor;
            
            $totalToDeduct = -($fractionToDeduct); // Negativo porque es salida

            $this->stockService->recordMovement(
                $ingredient,
                $totalToDeduct,
                'sale',
                "Descargo por venta de: {$product->name} (Ref: {$reference})",
                $userId
            );
        }
    }
}