<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Ingredient;
use App\Services\ProductCatalogService;
use App\Services\RecipeManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    protected $catalogService;
    protected $recipeService;

    public function __construct(ProductCatalogService $catalogService, RecipeManagementService $recipeService)
    {
        $this->catalogService = $catalogService;
        $this->recipeService = $recipeService;
    }

    public function index(Request $request)
    {
        // Traemos los productos con su categoría y sus ingredientes (receta)
        $products = Product::with(['category', 'recipes.ingredient.category'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('category_id')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only('search')
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::where('type', 'product')->where('is_active', true)->orderBy('name')->get(),
            'ingredients' => Ingredient::with('category')->where('is_active', true)->orderBy('name')->get()
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        // Los datos ya vienen validados, solo tienes que obtenerlos
        $validated = $request->validated();

        try {
            // 1. Validar la lógica de la receta
            if (!empty($validated['ingredients'])) {
                $this->recipeService->validateRecipeData($validated['ingredients']);
            }

            // 2. Crear el producto y sincronizar la receta usando nuestro Servicio SRP
            $this->catalogService->createProductWithRecipe($validated);

            return redirect()->route('products.index')->with('success', 'Producto creado exitosamente en la carta.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function edit(Product $product)
    {
        // Cargamos el producto con su receta actual para enviarla a React
        $product->load('recipes.ingredient');

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => Category::where('type', 'product')->where('is_active', true)->orderBy('name')->get(),
            'ingredients' => Ingredient::with('category')->where('is_active', true)->orderBy('name')->get()
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        // Los datos ya vienen validados
        $validated = $request->validated();

        try {
            if (!empty($validated['ingredients'])) {
                $this->recipeService->validateRecipeData($validated['ingredients']);
            }

            // Actualizamos los datos básicos del producto
            $product->update([
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'sale_price' => $validated['sale_price'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Sincronizamos la nueva receta usando el servicio
            $this->catalogService->syncRecipe($product, $validated['ingredients'] ?? []);

            return redirect()->route('products.index')->with('success', 'Producto y receta actualizados.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function updateRecipe(Request $request, Product $product)
    {
        $validated = $request->validate([
            'ingredients' => 'array',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.01',
        ]);

        // Preparamos los datos en el formato que pide el método sync()
        $syncData = [];
        if (!empty($validated['ingredients'])) {
            foreach ($validated['ingredients'] as $item) {
                $syncData[$item['ingredient_id']] = ['quantity' => $item['quantity']];
            }
        }

        // Actualiza la receta del producto
        $product->ingredients()->sync($syncData);

        return back()->with('success', 'Receta actualizada correctamente.');
    }

    public function destroy(Product $product)
    {
        // Al eliminar el producto, su receta se borra en cascada automáticamente por la base de datos
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Producto eliminado de la carta.');
    }
}
