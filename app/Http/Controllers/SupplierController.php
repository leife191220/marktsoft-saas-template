<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    protected $supplierService;

    // Inyectamos el servicio
    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    public function index(Request $request)
    {
        // Delegamos la búsqueda al servicio
        $suppliers = $this->supplierService->getSuppliers($request->search);

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        // Delegamos la creación
        $this->supplierService->createSupplier($validated);

        return back()->with('success', 'Proveedor registrado correctamente.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        // Delegamos la actualización
        $this->supplierService->updateSupplier($supplier, $validated);

        return back()->with('success', 'Datos del proveedor actualizados.');
    }

    public function destroy(Supplier $supplier)
    {
        // Delegamos la eliminación
        $this->supplierService->deleteSupplier($supplier);

        return back()->with('success', 'Proveedor eliminado del sistema.');
    }
}
