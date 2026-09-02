<?php

namespace App\Imports;

use App\Models\Ingredient;
use App\Models\Category;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class IngredientsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // 1. Ignorar si no tiene nombre
        if (empty($row['nombre'])) {
            return null;
        }

        // 2. Buscar categoría (tipo insumo)
        $category = Category::where('name', 'like', '%' . trim($row['categoria']) . '%')
            ->where('type', 'ingredient')
            ->first();

        // 3. Fallback: Si no existe, usamos/creamos "Importados"
        if (!$category) {
            $category = Category::firstOrCreate(
                ['name' => 'Importados', 'type' => 'ingredient'],
                ['is_active' => true]
            );
        }

        // 4. Actualizar o Crear Insumo (evita duplicados)
        return Ingredient::updateOrCreate(
            ['name' => trim($row['nombre'])],
            [
                'category_id'     => $category->id,
                'unit_of_measure' => $row['unidad'] ?? 'und',
                'current_stock'   => $row['stock_inicial'] ?? 0,
                'cost_per_unit'   => $row['costo_unitario'] ?? 0,
                'is_active'       => true,
            ]
        );
    }
}