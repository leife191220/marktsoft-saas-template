<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['category_id', 'name', 'sale_price', 'is_active'];

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function recipes(): HasMany { return $this->hasMany(Recipe::class); }
    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class)
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
