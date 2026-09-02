<?php

namespace App\Services;

use App\Models\Ingredient;
use Exception;

class RecipeManagementService
{
    /**
     * Valida que los ingredientes de una receta sean lógicos.
     * Ejemplo: Evitar que se ponga cantidad 0 o negativa.
     */
    public function validateRecipeData(array $ingredientsData): void
    {
        foreach ($ingredientsData as $item) {
            if (!isset($item['id']) || !isset($item['quantity'])) {
                throw new Exception("Datos de receta incompletos.");
            }

            if ($item['quantity'] <= 0) {
                throw new Exception("La cantidad de un insumo en la receta debe ser mayor a 0.");
            }

            $ingredient = Ingredient::find($item['id']);
            if (!$ingredient) {
                throw new Exception("Insumo no encontrado en la base de datos.");
            }

            // Aquí a futuro puedes agregar lógica compleja:
            // Ej: Si el insumo es "gr", validar que la cantidad no exceda límites lógicos.
        }
    }
}
