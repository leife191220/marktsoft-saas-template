<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el ID del producto que viene en la URL (ej: /products/5)
        $productId = $this->route('product')->id;

        return [
            // Le decimos a la regla unique que ignore el ID actual
            'name' => 'required|string|max:255|unique:products,name,' . $productId,
            'category_id' => 'required|exists:categories,id',
            'sale_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'ingredients' => 'array',
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.01',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Ya existe otro producto con este nombre. Elige uno diferente.',
        ];
    }
}