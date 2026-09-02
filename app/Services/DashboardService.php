<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardService
{
    public function getMonthlyKPIs(): array
    {
        // 1. Forzamos el rango de fechas para que no haya duda (Mes actual)
        $inicioMes = Carbon::now()->startOfMonth()->toDateTimeString();
        $finMes = Carbon::now()->endOfMonth()->toDateTimeString();

        // 2. Cálculo de Inventario (Bruto, sin filtros de fecha)
        $valorInventario = DB::table('ingredients')
            ->select(DB::raw('SUM(current_stock * cost_per_unit) as total'))
            ->value('total') ?? 0;

        // 3. Ventas del Mes (Buscamos literal el estado 'completed')
        $ventasMes = DB::table('sales')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$inicioMes, $finMes])
            ->sum('total');

        // 4. Gastos Separados
        $gastosNegocio = DB::table('expenses')
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->where('categories.is_personal', false)
            ->whereBetween('expense_date', [$inicioMes, $finMes])
            ->sum('amount');

        $gastosPersonales = DB::table('expenses')
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->where('categories.is_personal', true)
            ->whereBetween('expense_date', [$inicioMes, $finMes])
            ->sum('amount');

        // 5. Producto más vendido (Top 1) - Lo conservamos por compatibilidad
        $top = DB::table('order_details')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(quantity) as qty'))
            ->groupBy('products.id', 'products.name')
            ->orderBy('qty', 'desc')
            ->first();

        // 6. Datos del Gráfico (Últimos 30 días)
        $ventasDiarias = DB::table('sales')
            ->select(DB::raw('DATE(created_at) as fecha'), DB::raw('SUM(total) as total'))
            ->where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        // -------------------------------------------------------------
        // NUEVAS CONSULTAS PARA WIDGETS DE INVENTARIO Y VENTAS
        // -------------------------------------------------------------

        // 7. Insumos en Peligro (Stock Crítico <= 15)
        $lowStock = DB::table('ingredients')
            ->where('current_stock', '<=', 15)
            ->where('is_active', true)
            ->orderBy('current_stock', 'asc')
            ->take(5)
            ->get(['name', 'current_stock', 'unit_of_measure']); // <--- Corregido

        // 8. Top 5 Productos Más Vendidos del Mes
        $topProducts = DB::table('order_details')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->join('orders', 'order_details.order_id', '=', 'orders.id')
            ->whereMonth('orders.created_at', Carbon::now()->month)
            ->whereYear('orders.created_at', Carbon::now()->year)
            ->select(
                'products.name', 
                DB::raw('SUM(order_details.quantity) as total_sold'), 
                DB::raw('SUM(order_details.quantity * order_details.unit_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        $resultados = [
            'valorInventario'  => (float)$valorInventario,
            'ventasTotales'    => (float)$ventasMes,
            'gastosNegocio'    => (float)$gastosNegocio,
            'gastosPersonales' => (float)$gastosPersonales,
            'flujoNeto'        => (float)($ventasMes - $gastosNegocio),
            'topProduct'       => $top ? $top->name : 'N/A',
            'topProductQty'    => $top ? (int)$top->qty : 0,
            'chartData'        => $ventasDiarias,
            'puntoEquilibrio'  => 6200000,
            
            // INYECTAMOS LOS NUEVOS DATOS AQUÍ:
            'lowStock'         => $lowStock,
            'topProducts'      => $topProducts
        ];

        // ESTO ES PARA DEPURAR: Revisa tu laravel.log
        Log::info('DEPURACIÓN DASHBOARD:', $resultados);

        return $resultados;
    }
}