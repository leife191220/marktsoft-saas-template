<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Sale;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        
        // Obtener los IDs de las categorías creadas en el CategorySeeder
        $gastoOperativoCat = Category::where('name', 'Insumos operativos')->first()->id;
        $gastoCasaCat = Category::where('name', 'Gastos Casa')->first()->id;

        // 1. Simular Ventas del mes actual (Aprox 7 a 9 millones para superar el punto de equilibrio)
        for ($i = 1; $i <= 80; $i++) {
            Sale::create([
                'user_id' => $admin->id,
                'total' => rand(45000, 180000), // Tickets promedio entre 45k y 180k
                'payment_method' => collect(['efectivo', 'transferencia', 'tarjeta'])->random(),
                'status' => 'completed',
                'created_at' => Carbon::now()->subDays(rand(0, 28)), // Fechas aleatorias de este mes
            ]);
        }

        // 2. Simular Gastos Operativos del Bar
        for ($i = 1; $i <= 15; $i++) {
            Expense::create([
                'category_id' => $gastoOperativoCat,
                'user_id' => $admin->id,
                'description' => 'Compra a proveedor ' . rand(1, 5),
                'amount' => rand(80000, 450000),
                'expense_date' => Carbon::now()->subDays(rand(0, 28)),
            ]);
        }

        // 3. Simular Gastos de la Casa (No afectarán el flujo neto)
        for ($i = 1; $i <= 6; $i++) {
            Expense::create([
                'category_id' => $gastoCasaCat,
                'user_id' => $admin->id,
                'description' => 'Mercado D1 o recibos',
                'amount' => rand(30000, 280000),
                'expense_date' => Carbon::now()->subDays(rand(0, 28)),
            ]);
        }
    }
}