<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    // Muestra la pantalla de configuraciones
    public function index()
    {
        // Buscamos el límite actual. Si no existe en la base de datos, lo crea con el valor por defecto de 2 millones.
        $budgetSetting = Setting::firstOrCreate(
            ['key' => 'personal_budget_limit'],
            ['value' => '2000000']
        );

        return Inertia::render('Settings/Index', [
            'personalBudget' => $budgetSetting->value
        ]);
    }

    // Actualiza el valor desde el formulario
    public function update(Request $request)
    {
        $request->validate([
            'personal_budget_limit' => 'required|numeric|min:0'
        ]);

        Setting::updateOrCreate(
            ['key' => 'personal_budget_limit'],
            ['value' => $request->personal_budget_limit]
        );

        return back()->with('success', 'Presupuesto personal actualizado exitosamente.');
    }
}
