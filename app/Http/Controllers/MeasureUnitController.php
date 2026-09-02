<?php

namespace App\Http\Controllers;

use App\Models\MeasureUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeasureUnitController extends Controller
{
    public function index(Request $request)
    {
        $units = MeasureUnit::when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('abbreviation', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('MeasureUnits/Index', [
            'units' => $units,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:50',
        ]);

        MeasureUnit::create($validated);
        return back()->with('success', 'Unidad de medida creada.');
    }

    public function update(Request $request, MeasureUnit $measureUnit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:50',
        ]);

        $measureUnit->update($validated);
        return back()->with('success', 'Unidad de medida actualizada.');
    }

    public function destroy(MeasureUnit $measureUnit)
    {
        $measureUnit->delete();
        return back()->with('success', 'Unidad eliminada.');
    }
}
