<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = ['category_id', 'name', 'unit_of_measure', 'current_stock', 'cost_per_unit', 'is_active'];

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function recipes(): HasMany { return $this->hasMany(Recipe::class); }
    // NUEVO: Para ver el historial de movimientos de este insumo
    public function transactions(): HasMany { return $this->hasMany(InventoryTransaction::class); }
}
