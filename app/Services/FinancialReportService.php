<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Sale;
use App\Models\Expense;

class FinancialReportService
{
    public function listMovements(array $filters, int $perPage = 10)
    {
        $type = $filters['type'] ?? 'all';
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

       // 1. Query de Ventas (Ingresos) - Unificado para POS Web y Telegram
        $salesQuery = DB::table('sales')
            ->select(
                'sales.id',
                'sales.created_at as fecha',
                DB::raw("'Ingreso: Venta' as tipo_etiqueta"),
                DB::raw("'venta' as tipo_clase"),
                'sales.total as monto',

                // MAGIA SQL: Si tiene orden (Telegram) lee 'order_details', si no (POS), lee 'sale_items'
                DB::raw("CONCAT(sales.payment_method, ' | ',
                    COALESCE(
                        (SELECT STRING_AGG(CONCAT(od.quantity, 'x ', p.name), ', ')
                         FROM order_details od
                         JOIN products p ON p.id = od.product_id
                         WHERE od.order_id = sales.order_id),

                        (SELECT STRING_AGG(CONCAT(si.quantity, 'x ', p.name), ', ')
                         FROM sale_items si
                         JOIN products p ON p.id = si.product_id
                         WHERE si.sale_id = sales.id)
                    )
                ) as detalle"),

                DB::raw("(SELECT name FROM users WHERE users.id = sales.user_id) as responsable")
            )
            ->where('sales.status', 'completed');
            // Ya no necesitamos los leftJoin largos ni el groupBy aquí.
        // 2. Query de Gastos (Egresos)
        $expensesQuery = DB::table('expenses')
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->select(
                'expenses.id',
                'expenses.expense_date as fecha',
                DB::raw("CASE WHEN categories.is_personal THEN 'Egreso: Personal' ELSE 'Egreso: Negocio' END as tipo_etiqueta"),
                DB::raw("CASE WHEN categories.is_personal THEN 'gasto_personal' ELSE 'gasto_negocio' END as tipo_clase"),
                'amount as monto',
                'description as detalle',
                DB::raw("(SELECT name FROM users WHERE users.id = expenses.user_id) as responsable")
            );

        // Aplicar filtros de fecha
        if ($startDate && $endDate) {
            $salesQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            $expensesQuery->whereBetween('expense_date', [$startDate, $endDate]);
        }

        // Lógica de filtrado por tipo
        if ($type === 'ventas') {
            $query = $salesQuery;
        } elseif ($type === 'gastos_negocio') {
            $query = $expensesQuery->where('categories.is_personal', false);
        } elseif ($type === 'gastos_personales') {
            $query = $expensesQuery->where('categories.is_personal', true);
        } else {
            $query = $salesQuery->unionAll($expensesQuery);
        }

        return $query->orderBy('fecha', 'desc')->paginate($perPage)->withQueryString();
    }

    public function getMonthlySummary(int $year, int $month): array
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $totalSales = Sale::whereBetween('created_at', [$startDate, $endDate])->where('status', 'completed')->sum('total');
        $businessExpenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->whereHas('category', fn($q) => $q->where('is_personal', false))->sum('amount');
        $personalExpenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->whereHas('category', fn($q) => $q->where('is_personal', true))->sum('amount');

        $costosFijosMeta = 6200000;
        $margenContribucion = 0.65;
        $breakEvenPoint = $costosFijosMeta / $margenContribucion;

        return [
            'month' => $startDate->translatedFormat('F Y'),
            'sales' => (float)$totalSales,
            'business_expenses' => (float)$businessExpenses,
            'personal_expenses' => (float)$personalExpenses,
            'net_cash_flow' => (float)($totalSales - $businessExpenses - $personalExpenses),
            'break_even_point' => round($breakEvenPoint, 2),
            'remaining_to_break_even' => max(0, $breakEvenPoint - $totalSales),
            'is_profitable' => $totalSales >= $breakEvenPoint,
            'percentage' => round(($totalSales / ($breakEvenPoint ?: 1)) * 100, 1)
        ];
    }

    public function getZClosureMetrics(string $date): array
    {
        $startOfDay = \Carbon\Carbon::parse($date)->startOfDay();
        $endOfDay = \Carbon\Carbon::parse($date)->endOfDay();

        $sales = \App\Models\Sale::whereBetween('created_at', [$startOfDay, $endOfDay])->get();

        $salesByMethod = [
            'efectivo' => $sales->where('payment_method', 'efectivo')->sum('total'),
            'nequi' => $sales->where('payment_method', 'nequi')->sum('total'),
            'daviplata' => $sales->where('payment_method', 'daviplata')->sum('total'),
        ];

        $totalExpenses = \App\Models\Expense::whereDate('expense_date', $date)->sum('amount');

        return [
            'total_sales' => $sales->sum('total'),
            'sales_count' => $sales->count(),
            'sales_by_method' => $salesByMethod,
            'total_expenses' => $totalExpenses,
            'expected_cash' => $salesByMethod['efectivo'] - $totalExpenses,
        ];
    }
}
