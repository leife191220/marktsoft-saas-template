<?php

namespace App\Services;

use App\Models\ChecklistRecord;
use App\Models\ChecklistTask;

class OperationChecklistService
{
    public function submitTaskCompletion(int $taskId, int $userId, bool $status, ?string $notes = null): ChecklistRecord
    {
        // Si el estado es true, marcamos la fecha/hora actual, sino lo dejamos null
        $completedAt = $status ? now() : null;

        return ChecklistRecord::create([
            'checklist_task_id' => $taskId,
            'user_id' => $userId,
            'status' => $status,
            'notes' => $notes,
            'completed_at' => $completedAt
        ]);
    }

    /**
     * Devuelve las tareas pendientes del día para mostrarlas en el Dashboard
     */
    public function getPendingTasksForToday()
    {
        $today = now()->startOfDay();

        // Retorna las tareas maestras que no tienen un record de completado el día de hoy
        return ChecklistTask::where('is_active', true)
            ->whereDoesntHave('records', function ($query) use ($today) {
                $query->where('status', true)
                      ->whereDate('completed_at', $today);
            })->get();
    }
}
