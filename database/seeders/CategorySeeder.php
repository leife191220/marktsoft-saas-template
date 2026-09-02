<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Categorías compartidas para Productos de Carta e Insumos
            ['name' => 'Cervezas nacionales', 'type' => 'product', 'is_personal' => false, 'is_active' => true],
            ['name' => 'Licores base', 'type' => 'product', 'is_personal' => false, 'is_active' => true],
            
            // Categorías estrictas para Bodega/Inventario
            ['name' => 'Insumos operativos', 'type' => 'ingredient', 'is_personal' => false, 'is_active' => true],

            // Categorías de Gastos Operativos (Negocio)
            ['name' => 'Servicios Públicos', 'type' => 'expense', 'is_personal' => false, 'is_active' => true],
            ['name' => 'Nómina', 'type' => 'expense', 'is_personal' => false, 'is_active' => true],
            
            // Categorías de Gastos Personales (Casa)
            ['name' => 'Gastos Casa', 'type' => 'expense', 'is_personal' => true, 'is_active' => true],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['name' => $cat['name']], $cat);
        }
    }
}