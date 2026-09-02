<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\Category;
use App\Models\Supplier; // <-- IMPORTANTE: Agregar el modelo Supplier
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class InvoiceScannerService
{
    /**
     * Escanea la factura, contacta a la IA y hace match con inventario y proveedores.
     *
     * @param UploadedFile $file
     * @return array<string, mixed>
     * @throws Exception
     */
    public function scanAndMatch(UploadedFile $file): array
    {
        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey)) {
            throw new Exception('Falta la API Key de Gemini en el servidor.');
        }

        $base64Image = base64_encode(file_get_contents($file->path()));

        // 1. Llamar a la IA
        $aiData = $this->callGeminiApi($base64Image, $file->getMimeType(), $apiKey);

        // 2. Hacer match del proveedor
        $matchedSupplierId = null;
        if (!empty($aiData['supplier_name'])) {
            $matchedSupplierId = $this->findBestSupplierMatch($aiData['supplier_name']);
        }

        // 3. Retornar toda la data estructurada para el frontend
        return [
            'date'             => $aiData['date'] ?? null,
            'ai_supplier_name' => $aiData['supplier_name'] ?? null,
            'supplier_id'      => $matchedSupplierId, // Si es null, el frontend debe mostrar la alerta
            'items'            => $this->matchWithInventory($aiData['items'] ?? []),
            'ingredients'      => Ingredient::orderBy('name')->get()
        ];
    }

    private function callGeminiApi(string $base64Image, string $mimeType, string $apiKey): array
    {
        // 🚨 PROMPT ACTUALIZADO: Ahora pide un JSON con fecha, proveedor y items
        $prompt = 'Analiza esta factura o recibo. Extrae la fecha de la compra (en formato YYYY-MM-DD), el nombre del proveedor o establecimiento (ej: D1, ARA, Makro), y los productos. Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta: {"date": "YYYY-MM-DD", "supplier_name": "Nombre Proveedor", "items": [{"name": "nombre", "quantity": numero, "unit_price": numero}]}. No incluyas texto adicional ni markdown. Si algún dato no es visible, usa null o un arreglo vacío [].';

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [[
                    'parts' => [
                        ['text' => $prompt],
                        ['inline_data' => ['mime_type' => $mimeType, 'data' => $base64Image]]
                    ]
                ]]
            ]);

        if (!$response->successful()) {
            throw new Exception('Fallo en la comunicación con la IA de Google.');
        }

        $text = $response->json('candidates.0.content.parts.0.text');
        $cleanJson = trim(preg_replace('/```json|```/', '', (string)$text));
        $data = json_decode($cleanJson, true);

        if (!is_array($data)) {
            throw new Exception('La respuesta de la IA no es un formato JSON válido.');
        }

        return $data;
    }

    private function matchWithInventory(array $scannedItems): array
    {
        $processedItems = [];
        $existingIngredients = Ingredient::all();
        $defaultCategory = Category::firstOrCreate(
            ['name' => 'General', 'type' => 'ingredient'],
            ['is_active' => true]
        );

        foreach ($scannedItems as $item) {
            $itemName = $item['name'] ?? 'Producto Desconocido';
            $itemQty = (float) ($item['quantity'] ?? 1);
            $itemPrice = (float) ($item['unit_price'] ?? 0);

            $bestMatchId = $this->findBestMatch($itemName, $existingIngredients);

            if (!$bestMatchId) {
                $newIngredient = Ingredient::create([
                    'name' => ucwords(strtolower($itemName)),
                    'category_id' => $defaultCategory->id,
                    'unit_of_measure' => 'und',
                    'cost_per_unit' => $itemPrice,
                    'current_stock' => 0,
                    'is_active' => true,
                ]);
                $bestMatchId = $newIngredient->id;
            }

            $processedItems[] = [
                'ingredient_id' => $bestMatchId,
                'ai_name' => $itemName,
                'quantity' => $itemQty,
                'unit_price' => $itemPrice,
                'subtotal' => $itemQty * $itemPrice
            ];
        }

        return $processedItems;
    }

    private function findBestMatch(string $searchTarget, $existingIngredients): ?int
    {
        $searchTarget = strtolower(trim($searchTarget));
        $bestMatchId = null;
        $highestScore = 0;

        foreach ($existingIngredients as $ing) {
            $dbName = strtolower($ing->name);
            $score = 0;

            if ($dbName === $searchTarget) return $ing->id;
            if (str_contains($dbName, $searchTarget) || str_contains($searchTarget, $dbName)) $score += 50;

            foreach (explode(' ', $searchTarget) as $word) {
                if (strlen($word) > 2 && str_contains($dbName, $word)) $score += 10;
            }

            if ($score > $highestScore && $score >= 20) {
                $highestScore = $score;
                $bestMatchId = $ing->id;
            }
        }
        return $bestMatchId;
    }

    /**
     * Nuevo método para hacer match del nombre del proveedor detectado en la IA
     * con los registrados en la base de datos.
     */
    private function findBestSupplierMatch(string $searchTarget): ?int
    {
        $searchTarget = strtolower(trim($searchTarget));
        $suppliers = Supplier::all();
        $bestMatchId = null;
        $highestScore = 0;

        foreach ($suppliers as $supplier) {
            $dbName = strtolower($supplier->name);
            $score = 0;

            // Match exacto
            if ($dbName === $searchTarget) return $supplier->id;

            // Match parcial (ej: "D1 SAS" y "D1")
            if (str_contains($dbName, $searchTarget) || str_contains($searchTarget, $dbName)) {
                $score += 50;
            }

            // Match por palabras clave
            foreach (explode(' ', $searchTarget) as $word) {
                if (strlen($word) > 2 && str_contains($dbName, $word)) {
                    $score += 10;
                }
            }

            // Umbral mínimo de confianza
            if ($score > $highestScore && $score >= 20) {
                $highestScore = $score;
                $bestMatchId = $supplier->id;
            }
        }
        return $bestMatchId;
    }
}
