<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener categorías previamente creadas en CategorySeeder
        $catLicores = Category::where('name', 'Licores base')->first()->id;
        $catCervezas = Category::where('name', 'Cervezas nacionales')->first()->id;
        $catInsumos = Category::where('name', 'Insumos operativos')->first()->id;

        // --- 1. CREAR INVENTARIO (Insumos en bodega) ---
        $ingAguardiente = Ingredient::create([
            'category_id' => $catLicores,
            'name' => 'Aguardiente Amarillo (Botella)',
            'unit_of_measure' => 'ml',
            'current_stock' => 3000, // 4 botellas aprox
            'cost_per_unit' => 68, // $50.900 / 750ml
        ]);

        $ingLimon = Ingredient::create([
            'category_id' => $catInsumos,
            'name' => 'Limón',
            'unit_of_measure' => 'und',
            'current_stock' => 50,
            'cost_per_unit' => 300, 
        ]);

        $ingPoker = Ingredient::create([
            'category_id' => $catCervezas,
            'name' => 'Cerveza Poker Botella',
            'unit_of_measure' => 'und',
            'current_stock' => 120, // 5 canastas
            'cost_per_unit' => 3200, 
        ]);

        // --- 2. CREAR PRODUCTOS DE LA CARTA (Lo que se vende) ---
        $prodShotAmarillo = Product::create([
            'category_id' => $catLicores,
            'name' => 'Shot Aguardiente Amarillo',
            'sale_price' => 8000,
        ]);

        $prodBotellaAmarillo = Product::create([
            'category_id' => $catLicores,
            'name' => 'Botella Aguardiente Amarillo',
            'sale_price' => 90000,
        ]);

        $prodPoker = Product::create([
            'category_id' => $catCervezas,
            'name' => 'Poker Botella 330 ml',
            'sale_price' => 6000,
        ]);

        // --- 3. CREAR RECETAS (El puente para descontar inventario) ---
        
        // El Shot descuenta 30ml de la botella de Aguardiente y usa 1 rodaja de limón (0.25 limón)
        Recipe::create(['product_id' => $prodShotAmarillo->id, 'ingredient_id' => $ingAguardiente->id, 'quantity' => 30]);
        Recipe::create(['product_id' => $prodShotAmarillo->id, 'ingredient_id' => $ingLimon->id, 'quantity' => 0.25]);

        // La botella descuenta 750ml directos
        Recipe::create(['product_id' => $prodBotellaAmarillo->id, 'ingredient_id' => $ingAguardiente->id, 'quantity' => 750]);

        // La cerveza comercial es 1 a 1
        Recipe::create(['product_id' => $prodPoker->id, 'ingredient_id' => $ingPoker->id, 'quantity' => 1]);
    }
}