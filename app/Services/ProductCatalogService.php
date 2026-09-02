<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Recipe;
use Illuminate\Support\Facades\DB;

class ProductCatalogService
{
    /**
     * Crea un producto nuevo y le asigna su receta en la misma transacción.
     */
    public function createProductWithRecipe(array $data): Product
    {
        return DB::transaction(function () use ($data) {

            $product = Product::create([
                'category_id' => $data['category_id'],
                'name' => $data['name'],
                'sale_price' => $data['sale_price'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (!empty($data['ingredients'])) {
                $this->syncRecipe($product, $data['ingredients']);
            }

            return $product;
        });
    }

    /**
     * Actualiza la receta de un producto existente.
     */
    public function syncRecipe(Product $product, array $ingredientsData): void
    {
        // Limpiamos la receta actual
        $product->recipes()->delete();

        // Creamos la nueva formulación
        foreach ($ingredientsData as $ingredient) {
            Recipe::create([
                'product_id' => $product->id,
                'ingredient_id' => $ingredient['id'],
                'quantity' => $ingredient['quantity'], // Ej: 1 (unidad), 30 (ml)
            ]);
        }
    }
}
