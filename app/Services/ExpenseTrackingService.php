<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Category;
use App\Models\Setting;
use Carbon\Carbon;

class ExpenseTrackingService
{
    /**
     * Registra el gasto y devuelve un array con el gasto y una posible alerta de presupuesto.
     */
    // Añadimos $expenseDate al final
    public function recordExpense(int $userId, string $description, float $amount, ?int $categoryId = null, ?int $supplierId = null, ?string $expenseDate = null): array
    {
        $expense = Expense::create([
            'user_id' => $userId,
            'category_id' => $categoryId,
            'supplier_id' => $supplierId,
            'description' => $description,
            'amount' => $amount,
            'expense_date' => $expenseDate ?? now()->toDateString(), // Usar la fecha enviada o la de hoy
        ]);

        $alertMessage = null;

        // Si el gasto tiene categoría, verificamos si es un "Gasto de Casa" (Salario Aleja)
        if ($categoryId) {
            $category = Category::find($categoryId);

            if ($category && $category->is_personal) {
                // Obtenemos el límite desde la BD (Si no existe, el default es 2,000,000)
                $budgetLimitSetting = Setting::where('key', 'personal_budget_limit')->first();
                $budgetLimit = $budgetLimitSetting ? (float) $budgetLimitSetting->value : 2000000;

                // Sumamos todos los gastos personales del mes actual
                $currentMonthTotal = Expense::whereHas('category', function ($query) {
                        $query->where('is_personal', true);
                    })
                    ->whereMonth('expense_date', Carbon::now()->month)
                    ->whereYear('expense_date', Carbon::now()->year)
                    ->sum('amount');

                // Verificamos si sobrepasó el límite
                if ($currentMonthTotal > $budgetLimit) {
                    $formatedTotal = number_format($currentMonthTotal, 0, ',', '.');
                    $formatedLimit = number_format($budgetLimit, 0, ',', '.');

                    $alertMessage = "⚠️ ¡Alerta Financiera! Con este registro, los retiros personales del mes ($ {$formatedTotal}) han superado el presupuesto asignado de $ {$formatedLimit}.";
                }
            }
        }

        // Retornamos el gasto y la alerta (si existe)
        return [
            'expense' => $expense,
            'alert' => $alertMessage
        ];
    }
}
