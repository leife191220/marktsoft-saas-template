<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    // type puede ser: 'purchase', 'sale', 'waste', 'adjustment'
    protected $fillable = [
        'ingredient_id', 'user_id', 'supplier_id', 'type',
        'quantity', 'previous_stock', 'new_stock', 'reason'
    ];

    public function ingredient(): BelongsTo { return $this->belongsTo(Ingredient::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function supplier(): BelongsTo { return $this->belongsTo(Supplier::class); }
}
