<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = ['category_id', 'user_id', 'supplier_id', 'description', 'amount', 'expense_date'];

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); } // Quién registró el gasto
    // Agregar la relación
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
