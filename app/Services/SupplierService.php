<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;

class SupplierService
{
    /**
     * Obtiene la lista de proveedores, aplicando filtro de búsqueda si existe.
     */
    public function getSuppliers(?string $searchTerm): Collection
    {
        $query = Supplier::query();

        if ($searchTerm) {
            $query->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('contact_person', 'like', "%{$searchTerm}%");
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Crea un nuevo proveedor.
     */
    public function createSupplier(array $data): Supplier
    {
        return Supplier::create($data);
    }

    /**
     * Actualiza la información de un proveedor existente.
     */
    public function updateSupplier(Supplier $supplier, array $data): bool
    {
        return $supplier->update($data);
    }

    /**
     * Elimina un proveedor.
     * (Aquí a futuro se puede agregar lógica para evitar eliminar si tiene gastos).
     */
    public function deleteSupplier(Supplier $supplier): ?bool
    {
        return $supplier->delete();
    }
}
