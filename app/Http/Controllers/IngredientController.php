<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Category;
use App\Services\StockMovementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;
use App\Models\MeasureUnit;
use App\Imports\IngredientsImport;
use Maatwebsite\Excel\Facades\Excel;

class IngredientController extends Controller
{
    protected $stockService;

    public function __construct(StockMovementService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(Request $request)
    {
        $ingredients = Ingredient::with('category')
            ->when($request->search, function ($query, $search) {
                // Cambiado a 'like' para compatibilidad con bases de datos MySQL/MariaDB
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Ingredients/Index', [
            'ingredients' => $ingredients,
            'filters' => $request->only('search')
        ]);
    }

    // ==========================================
    // MÉTODOS CRUD (Nuevos para Create y Edit)
    // ==========================================

    public function create()
    {
        $categories = Category::where('type', 'ingredient')->where('is_active', true)->orderBy('name')->get();
        $units = MeasureUnit::orderBy('name')->get(); // <--- NUEVO

        return Inertia::render('Ingredients/Create', [
            'categories' => $categories,
            'units' => $units // <--- NUEVO
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ingredients',
            'category_id' => 'required|exists:categories,id',
            'unit_of_measure' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        Ingredient::create($validated + ['is_active' => true]);

        return redirect()->route('ingredients.index')->with('success', 'Insumo creado exitosamente.');
    }

    public function edit(Ingredient $ingredient)
    {
        $categories = Category::where('type', 'ingredient')->where('is_active', true)->orderBy('name')->get();
        $units = MeasureUnit::orderBy('name')->get(); // <--- NUEVO

        return Inertia::render('Ingredients/Edit', [
            'ingredient' => $ingredient,
            'categories' => $categories,
            'units' => $units // <--- NUEVO
        ]);
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ingredients,name,' . $ingredient->id,
            'category_id' => 'required|exists:categories,id',
            'unit_of_measure' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $ingredient->update($validated);

        return redirect()->route('ingredients.index')->with('success', 'Insumo actualizado exitosamente.');
    }

    public function destroy(Ingredient $ingredient)
    {
        try {
            // Usamos una transacción para que, si algo falla, no se borre nada a medias
            \Illuminate\Support\Facades\DB::transaction(function () use ($ingredient) {
                // 1. Limpiamos el historial de movimientos (Kardex) de este insumo
                $ingredient->transactions()->delete();

                // 2. Limpiamos si está atado a alguna receta (opcional pero recomendado)
                $ingredient->recipes()->delete();

                // 3. Ahora sí, Postgres nos dejará borrar el insumo padre
                $ingredient->delete();
            });

            return redirect()->route('ingredients.index')->with('success', 'Insumo y su historial eliminados del sistema.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error eliminando insumo: " . $e->getMessage());
            return redirect()->route('ingredients.index')->with('error', 'Error en la base de datos. No se pudo eliminar.');
        }
    }

    // ==========================================
    // MÉTODOS DE BODEGA E IMPORTACIÓN
    // ==========================================

    // Método exclusivo para registrar compras/entradas de inventario
    public function addStock(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'reason' => 'required|string|max:255',
        ]);

        try {
            // Usamos el servicio estricto para modificar el stock y dejar huella en el Kardex
            $this->stockService->recordMovement(
                $ingredient,
                $validated['quantity'],
                'purchase',
                $validated['reason'],
                $request->user()->id // El usuario que está registrando la compra
            );

            return back()->with('success', "Se agregaron {$validated['quantity']} {$ingredient->unit_of_measure} al stock de {$ingredient->name}.");
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Importación masiva desde Excel/CSV
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new IngredientsImport, $request->file('file'));

            return redirect()->route('ingredients.index')->with('success', '¡Inventario sincronizado correctamente!');
        } catch (\Exception $e) {
            return back()->with('error', 'Error en el archivo: ' . $e->getMessage());
        }
    }
}
