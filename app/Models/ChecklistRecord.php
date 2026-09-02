<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistRecord extends Model
{
    protected $fillable = ['checklist_task_id', 'user_id', 'status', 'notes', 'completed_at'];

    protected $casts = [
        'completed_at' => 'datetime',
        'status' => 'boolean'
    ];

    public function task(): BelongsTo { return $this->belongsTo(ChecklistTask::class, 'checklist_task_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
