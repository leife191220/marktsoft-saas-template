<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Category;
use App\Models\Supplier; // Importar el modelo Supplier
use App\Services\ExpenseTrackingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    protected $expenseService;

    public function __construct(ExpenseTrackingService $expenseService)
    {
        $this->expenseService = $expenseService;
    }

    public function index()
    {
        // Añadimos 'supplier' al eager loading
        $expenses = Expense::with(['category', 'user', 'supplier'])->orderByDesc('expense_date')->paginate(15);
        $categories = Category::where('type', 'expense')->get();
        // Traemos los proveedores para el formulario
        $suppliers = Supplier::orderBy('name')->get();

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'suppliers' => $suppliers // Lo enviamos a React
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:100',
            'expense_date' => 'required|date', // Validamos la fecha
        ]);

        $result = $this->expenseService->recordExpense(
            $request->user()->id,
            $validated['description'],
            $validated['amount'],
            $validated['category_id'],
            $validated['supplier_id'] ?? null,
            $validated['expense_date'] // Le pasamos la fecha al servicio
        );

        if ($result['alert']) {
            return back()
                ->with('success', 'Gasto registrado correctamente.')
                ->with('warning', $result['alert']);
        }

        return back()->with('success', 'Gasto registrado correctamente.');
    }
}
