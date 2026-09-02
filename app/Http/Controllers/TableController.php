<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        return Inertia::render('Tables/Index', [
            // Traemos las mesas ordenadas para que la "Mesa 1" siempre salga primero
            'tables' => Table::orderBy('id')->get()
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validamos que el nombre sea obligatorio
        $request->validate(['name' => 'required|string|max:50']);
        
        // 2. Creamos la mesa
        Table::create([
            'name' => $request->name,
            
            // 👇 AGREGA ESTA LÍNEA MÁGICA AQUÍ 👇
            'status' => 'available' // Así la base de datos nunca recibirá un null
        ]);

        return back()->with('success', 'Mesa creada y lista para usar.');
    }

    public function update(Request $request, Table $table)
    {
        $request->validate(['name' => 'required|string|max:50']);
        $table->update(['name' => $request->name]);

        return back()->with('success', 'Nombre de la mesa actualizado.');
    }

    public function destroy(Table $table)
    {
        // Regla de negocio: No se puede borrar una mesa si hay clientes tomando
        if ($table->orders()->where('status', 'open')->exists()) {
            return back()->withErrors(['error' => 'No puedes eliminar una mesa que tiene una cuenta abierta.']);
        }

        $table->delete();
        return back()->with('success', 'Mesa eliminada del sistema y del Bot.');
    }
}