<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\ProcurementService;
use App\Services\InvoiceScannerService;
use Illuminate\Support\Facades\Log;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Ingredient; // <-- IMPORTANTE AGREGAR ESTO
use Inertia\Inertia;
use Exception;
use Throwable;

class PurchaseController extends Controller
{
    public function __construct(
        protected ProcurementService $procurementService,
        protected InvoiceScannerService $scannerService
    ) {}

    public function index()
    {
        $purchases = Purchase::with('supplier')->latest()->paginate(15);
        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::orderBy('name')->get();
        return Inertia::render('Purchases/Create', [
            'suppliers' => $suppliers
        ]);
    }

    public function scanInvoice(Request $request): JsonResponse
    {
        $request->validate([
            'receipt' => 'required|image|max:5120'
        ]);

        try {
            $result = $this->scannerService->scanAndMatch($request->file('receipt'));
            return response()->json($result);
        } catch (Throwable $e) {
            Log::error('Fallo crítico en scanInvoice: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error de lectura IA',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_number' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            $this->procurementService->recordPurchase($validated);
            return redirect()->route('purchases.index')
                ->with('success', 'Compra registrada, stock actualizado y gasto asentado correctamente.');
        } catch (Exception $e) {
            Log::error('Error guardando la compra: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Hubo un problema registrando la compra: ' . $e->getMessage()]);
        }
    }

    /**
     * Muestra el formulario para editar una compra existente.
     */
    public function edit($id)
    {
        // Traemos la compra con sus items de la base de datos
        $purchase = Purchase::with('items')->findOrFail($id);
        $suppliers = Supplier::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();

        return Inertia::render('Purchases/Edit', [
            'purchase' => $purchase,
            'suppliers' => $suppliers,
            'ingredients' => $ingredients
        ]);
    }

    /**
     * Actualiza la compra.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_number' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:purchase_items,id', // El ID del item si ya existía
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            // Aquí deberás hacer la lógica en tu ProcurementService para actualizar,
            // recalculando el inventario viejo vs el nuevo.
            // $this->procurementService->updatePurchase($id, $validated);

            return redirect()->route('purchases.index')
                ->with('success', 'Compra actualizada correctamente (Lógica pendiente en Service).');
        } catch (Exception $e) {
            Log::error('Error actualizando la compra: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Hubo un problema actualizando la compra: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $purchase = Purchase::findOrFail($id);
            $purchase->delete();

            return redirect()->route('purchases.index')
                ->with('success', 'Compra eliminada del sistema.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Error al eliminar: ' . $e->getMessage()]);
        }
    }
}
