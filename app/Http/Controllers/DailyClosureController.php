<?php

namespace App\Http\Controllers;

use App\Models\DailyClosure;
use App\Services\DailyClosureService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class DailyClosureController extends Controller
{
    protected $closureService;

    public function __construct(DailyClosureService $closureService)
    {
        $this->closureService = $closureService;
    }

    public function index()
    {
        $closures = DailyClosure::with('user')->orderByDesc('closure_date')->paginate(10);
        return Inertia::render('Finances/Closures', ['closures' => $closures]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'actual_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        try {
            $closure = $this->closureService->executeClosure(
                $request->user()->id,
                $validated['actual_cash'],
                $validated['notes']
            );

            return back()->with('success', "Caja cerrada. Descuadre registrado: $ {$closure->difference}");
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
