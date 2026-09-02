<?php

namespace App\Http\Controllers;

use App\Services\OperationChecklistService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChecklistController extends Controller
{
    protected $checklistService;

    public function __construct(OperationChecklistService $checklistService)
    {
        $this->checklistService = $checklistService;
    }

    public function index()
    {
        $pendingTasks = $this->checklistService->getPendingTasksForToday();
        return Inertia::render('Checklist/Index', ['pendingTasks' => $pendingTasks]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'checklist_task_id' => 'required|exists:checklist_tasks,id',
            'status' => 'required|boolean',
            'notes' => 'nullable|string'
        ]);

        $this->checklistService->submitTaskCompletion(
            $validated['checklist_task_id'],
            $request->user()->id,
            $validated['status'],
            $validated['notes']
        );

        return back()->with('success', 'Tarea actualizada.');
    }
}
