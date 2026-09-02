<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use App\Models\Product;
use App\Models\Customer;
use App\Services\OrderDraftingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;
use App\Models\OrderDetail;


class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderDraftingService $orderService)
    {
        $this->orderService = $orderService;
    }

    // Muestra todas las mesas y cuentas abiertas
    public function index()
    {
        $tables = Table::with(['orders' => function($query) {
            $query->where('status', 'open')->with('details.product');
        }])
        ->get()
        // Aplicamos SORT_NATURAL para que entienda que "Cuenta 2" va antes que "Cuenta 10"
        ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
        // values() es crucial: reindexa el arreglo para que a React le llegue un Array limpio y no un Objeto JSON
        ->values();

        return Inertia::render('Orders/Index', ['tables' => $tables]);
    }

    // Abre una nueva cuenta
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'nullable|exists:tables,id',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        try {
            $table = isset($validated['table_id']) ? Table::find($validated['table_id']) : null;
            $this->orderService->openOrder($request->user()->id, $table, $validated['customer_id'] ?? null);

            return back()->with('success', 'Cuenta abierta exitosamente.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Agrega un producto a la cuenta (Endpoint que también usará el bot de Telegram)
    public function addItem(Request $request, Order $order)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        try {
            $product = Product::find($validated['product_id']);
            $this->orderService->addItem($order, $product, $validated['quantity'], $validated['notes']);

            return back()->with('success', 'Producto agregado a la cuenta.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Muestra el detalle de una cuenta específica
    public function show(Order $order)
    {
        // Cargamos la orden con su mesa y el detalle de los productos
        $order->load(['table', 'details.product']);

        // Traemos todos los productos disponibles para el select
        $products = Product::orderBy('name')->get();

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'products' => $products
        ]);
    }

    public function removeItem(Order $order, OrderDetail $orderDetail)
    {
        // Verificamos que el detalle pertenezca a la orden
        if ($orderDetail->order_id !== $order->id) {
            return back()->withErrors(['error' => 'Ítem no encontrado en esta cuenta.']);
        }

        // Restamos del total de la orden
        $order->decrement('total', $orderDetail->subtotal);

        // Eliminamos el ítem
        $orderDetail->delete();

        return back()->with('success', 'Producto eliminado de la cuenta.');
    }

    public function destroyOrder(Order $order)
    {
        // 1. Liberamos la mesa asociada
        if ($order->table_id) {
            \App\Models\Table::where('id', $order->table_id)->update(['status' => 'available']);
        }

        // 2. Eliminamos los detalles y la orden
        \App\Models\OrderDetail::where('order_id', $order->id)->delete();
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Comanda cancelada y mesa liberada correctamente.');
    }
}
