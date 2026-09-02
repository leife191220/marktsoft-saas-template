<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyClosure extends Model
{
    protected $fillable = [
        'closure_date', 'user_id', 'total_sales', 'total_cash',
        'total_transfers', 'total_expenses', 'expected_cash',
        'actual_cash', 'difference', 'notes'
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
