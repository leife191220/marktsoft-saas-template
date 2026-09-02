<?php

namespace App\Services;

use App\Models\DailyClosure;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class DailyClosureService
{
    public function executeClosure(int $userId, float $actualCashCounted, string $notes = null): DailyClosure
    {
        $today = Carbon::today()->toDateString();

        // Validar que no se haya cerrado ya
        if (DailyClosure::where('closure_date', $today)->exists()) {
            throw new Exception("El cierre de caja de hoy ya fue realizado.");
        }

        return DB::transaction(function () use ($today, $userId, $actualCashCounted, $notes) {

            // 1. Sumar Ventas (Separando Efectivo de Transferencias/Tarjetas)
            $sales = Sale::whereDate('created_at', $today)->get();
            $totalSales = $sales->sum('total');
            $totalCash = $sales->where('payment_method', 'Efectivo')->sum('total');
            $totalTransfers = $sales->where('payment_method', '!=', 'Efectivo')->sum('total');

            // 2. Sumar Gastos del día
            $totalExpenses = Expense::whereDate('expense_date', $today)->sum('amount');

            // 3. Calcular Efectivo Esperado (Ventas Efectivo - Gastos)
            $expectedCash = $totalCash - $totalExpenses;

            // 4. Calcular Descuadre
            $difference = $actualCashCounted - $expectedCash;

            // 5. Guardar el Cierre
            return DailyClosure::create([
                'closure_date' => $today,
                'user_id' => $userId,
                'total_sales' => $totalSales,
                'total_cash' => $totalCash,
                'total_transfers' => $totalTransfers,
                'total_expenses' => $totalExpenses,
                'expected_cash' => $expectedCash,
                'actual_cash' => $actualCashCounted,
                'difference' => $difference,
                'notes' => $notes
            ]);
        });
    }
}
