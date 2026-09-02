<?php

namespace Database\Seeders;

use App\Models\MeasureUnit;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class BasicConfigSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Unidades de Medida
        $units = [
            ['name' => 'Mililitros', 'abbreviation' => 'ml'],
            ['name' => 'Gramos', 'abbreviation' => 'gr'],
            ['name' => 'Unidad', 'abbreviation' => 'und'],
            ['name' => 'Botella', 'abbreviation' => 'bot'],
        ];

        foreach ($units as $unit) {
            MeasureUnit::firstOrCreate(['abbreviation' => $unit['abbreviation']], $unit);
        }

        // 2. Proveedores
        $suppliers = [
            ['name' => 'Distribuciones J&M', 'contact_name' => 'Vendedor J&M', 'phone' => '3001234567'],
            ['name' => 'Distribuidora El Descuento', 'contact_name' => 'Vendedor Descuento', 'phone' => '3007654321'],
            ['name' => 'Supermercado D1', 'contact_name' => 'Tienda Física', 'phone' => 'N/A'],
            ['name' => 'Crisam', 'contact_name' => 'Proveedor Mezcladores', 'phone' => '3110000000'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(['name' => $supplier['name']], $supplier);
        }
    }
}