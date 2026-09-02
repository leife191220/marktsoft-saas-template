<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Exception;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    // Procesa el pago de una cuenta abierta
    public function store(Request $request, Order $order)
    {
        // 1. Validamos el pago (ACTUALIZADO CON NEQUI Y DAVIPLATA)
        $validated = $request->validate([
            'payment_method' => 'required|string|in:efectivo,nequi,daviplata',
        ]);

        try {
            $sale = $this->checkoutService->processPayment(
                $order,
                $validated['payment_method'],
                $request->user()->id
            );

            return redirect()->route('orders.index')->with('success', "Pago registrado correctamente. Ticket #{$sale->id}");
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
