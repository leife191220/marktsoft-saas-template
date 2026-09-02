<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Usuario
        User::updateOrCreate(
            ['email' => 'admin@laestacion.com'],
            [
                'name' => 'Leidi Lorena Zapata',
                'password' => Hash::make('password123'),
            ]
        );

        // 2. Ejecutar la cadena de Seeders
        $this->call([
            CategorySeeder::class,        // Crea las categorías maestras (El que hicimos en el mensaje anterior)
            BasicConfigSeeder::class,     // Crea Unidades y Proveedores
            CatalogSeeder::class,         // Crea Insumos, Carta y Recetas
            DashboardDemoSeeder::class,   // Crea las ventas y gastos aleatorios para las gráficas
        ]);
    }
}