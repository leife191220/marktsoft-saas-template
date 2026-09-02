<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class CsvImportSeeder extends Seeder
{
    public function run(): void
    {
        $this->importIngredients(database_path('data/Inventario_Bar.csv'));
        $this->importProducts(database_path('data/CARTA.csv'));
    }

    private function importIngredients(string $filePath): void
    {
        if (!file_exists($filePath)) {
            $this->command->error("El archivo no existe: {$filePath}");
            return;
        }

        $data = $this->readCSV($filePath);

        foreach ($data as $row) {
            // 1. Crear o buscar la categoría (Asegúrate de que 'Categoria' sea el nombre de tu columna en el CSV)
            $category = Category::firstOrCreate(
                ['name' => $row['Categoria'] ?? 'General'], // Cambia 'Categoria' por el encabezado real de tu CSV
                ['type' => 'ingredient']
            );

            // 2. Crear el Insumo
            Ingredient::updateOrCreate(
                ['name' => $row['Nombre']], // Cambia 'Nombre' por el encabezado real de tu CSV
                [
                    'category_id' => $category->id,
                    'unit_of_measure' => $row['Unidad'] ?? 'und', // Cambia 'Unidad' por el encabezado real
                    'current_stock' => (float) ($row['Stock'] ?? 0), // Cambia 'Stock' por el encabezado real
                    'cost_per_unit' => (float) ($row['Costo'] ?? 0), // Cambia 'Costo' por el encabezado real
                ]
            );
        }

        $this->command->info('✅ Insumos importados correctamente.');
    }

    private function importProducts(string $filePath): void
    {
        if (!file_exists($filePath)) {
            $this->command->error("El archivo no existe: {$filePath}");
            return;
        }

        $data = $this->readCSV($filePath);

        foreach ($data as $row) {
            // 1. Crear o buscar la categoría del menú
            $category = Category::firstOrCreate(
                ['name' => $row['Categoria'] ?? 'General'], // Cambia 'Categoria' por el encabezado real
                ['type' => 'product']
            );

            // 2. Crear el Producto
            Product::updateOrCreate(
                ['name' => $row['Nombre']], // Cambia 'Nombre' por el encabezado real
                [
                    'category_id' => $category->id,
                    'sale_price' => (float) ($row['Precio'] ?? 0), // Cambia 'Precio' por el encabezado real
                ]
            );
        }

        $this->command->info('✅ Productos de la carta importados correctamente.');
    }

    // Función auxiliar para leer CSV y convertirlo en un array asociativo
    private function readCSV(string $filename, string $delimiter = ','): array
    {
        if (!file_exists($filename) || !is_readable($filename)) {
            return [];
        }

        $header = null;
        $data = [];
        // Si tu CSV viene de Excel en español, a veces el delimitador es ';' en lugar de ','
        if (($handle = fopen($filename, 'r')) !== false) {
            while (($row = fgetcsv($handle, 1000, $delimiter)) !== false) {
                if (!$header) {
                    // Limpiamos BOM characters que a veces deja Excel
                    $header = array_map(function($h) { return preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h); }, $row);
                } else {
                    if (count($header) == count($row)) {
                        $data[] = array_combine($header, $row);
                    }
                }
            }
            fclose($handle);
        }

        return $data;
    }
}
