<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('type')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:product,expense,ingredient',
            'is_personal' => 'boolean',
            'is_active' => 'boolean',
        ]);

        Category::create($validated);
        return back()->with('success', 'Categoría creada exitosamente.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:product,expense,ingredient',
            'is_personal' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        return back()->with('success', 'Categoría actualizada.');
    }

    public function destroy(Category $category)
    {
        // Validación de seguridad para no borrar categorías en uso
        if ($category->products()->count() > 0 || $category->ingredients()->count() > 0 || $category->expenses()->count() > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar esta categoría porque tiene registros asociados. Te sugerimos desactivarla.']);
        }

        $category->delete();
        return back()->with('success', 'Categoría eliminada.');
    }
}
