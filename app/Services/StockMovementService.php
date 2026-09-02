<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use Illuminate\Support\Facades\DB;
use Exception;

class StockMovementService
{
    /**
     * Registra un movimiento de inventario (Entrada o Salida)
     * Tipos válidos: 'purchase' (compra), 'sale' (venta), 'waste' (merma/rotura), 'adjustment' (cuadre)
     */
    public function recordMovement(Ingredient $ingredient, float $quantity, string $type, string $reason, int $userId): InventoryTransaction
    {
        return DB::transaction(function () use ($ingredient, $quantity, $type, $reason, $userId) {

            // 1. Validar que no quede en negativo si es salida
            if (in_array($type, ['sale', 'waste', 'adjustment']) && $quantity < 0) {
                if (($ingredient->current_stock + $quantity) < 0) {
                    throw new Exception("Stock insuficiente para {$ingredient->name}. Stock actual: {$ingredient->current_stock}");
                }
            }

            // 2. Actualizar el stock actual
            $ingredient->increment('current_stock', $quantity); // Si es salida, $quantity debe venir negativo

            // 3. Crear el registro de auditoría (Kardex)
            return InventoryTransaction::create([
                'ingredient_id' => $ingredient->id,
                'user_id' => $userId,
                'type' => $type,
                'quantity' => $quantity,
                'previous_stock' => $ingredient->current_stock - $quantity,
                'new_stock' => $ingredient->current_stock,
                'reason' => $reason
            ]);
        });
    }
}
