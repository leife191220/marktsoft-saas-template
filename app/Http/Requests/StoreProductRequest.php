<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     */
    public function authorize(): bool
    {
        // Cambia esto a true para que cualquier usuario logueado pueda crear productos.
        // A futuro, aquí podrías validar roles (ej: return auth()->user()->role === 'admin';)
        return true; 
    }

    /**
     * Reglas de validación que se aplicarán a la petición.
     */
    public function rules(): array
    {
        return [
            // Aquí está la regla de unicidad para productos nuevos
            'name' => 'required|string|max:255|unique:products,name',
            'category_id' => 'required|exists:categories,id',
            'sale_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'ingredients' => 'array',
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.01',
        ];
    }

    /**
     * (Opcional) Mensajes de error personalizados.
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'Ya existe un producto con este nombre en la carta. Elige otro.',
            'category_id.required' => 'Debes seleccionar una categoría.',
        ];
    }
}