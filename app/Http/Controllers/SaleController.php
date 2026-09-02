<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;
use App\Models\Sale;

class SaleController extends Controller
{
    protected $saleService;

    // Inyectamos nuestro nuevo servicio de ventas
    public function __construct(SaleService $saleService)
    {
        $this->saleService = $saleService;
    }

    // 1. Cargar la pantalla de la Caja Registradora (POS)
    public function create()
    {
        $categories = Category::where('type', 'product')->where('is_active', true)->orderBy('name')->get();
        $products = Product::with('recipes.ingredient')->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('POS/Index', [
            'categories' => $categories,
            'products' => $products
        ]);
    }

    // 2. Procesar el cobro delegando la responsabilidad al Servicio
    // 2. Procesar el cobro delegando la responsabilidad al Servicio
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            // ACTUALIZADO: Aceptamos Nequi y Daviplata en lugar de transferencia y tarjeta
            'payment_method' => 'required|string|in:efectivo,nequi,daviplata',
            'total' => 'required|numeric|min:0',
        ]);

        try {
            // ARREGLADO: Guardamos el resultado en la variable $sale para poder obtener su ID
            $sale = $this->saleService->processSale($validated, $request->user()->id);

            return back()->with([
                'success' => 'Venta cobrada con éxito.',
                'last_sale_id' => $sale->id // Ahora sí pasará el ID a React para el Ticket
            ]);

        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al procesar la venta: ' . $e->getMessage()]);
        }
    }

    public function receipt(Sale $sale)
    {
        // Cargamos las relaciones necesarias
        $sale->load(['items.product', 'user']);

        // Formateamos la fecha directamente con Carbon para garantizar la hora correcta
        // Ejemplo de salida: 16/08/2026 04:05 PM
        $sale->formatted_date = $sale->created_at->format('d/m/Y h:i A');

        return Inertia::render('POS/Receipt', [
            'sale' => $sale
        ]);
    }
}
