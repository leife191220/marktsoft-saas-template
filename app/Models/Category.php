<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'type', 'is_personal', 'is_active'];

    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function ingredients(): HasMany { return $this->hasMany(Ingredient::class); }
    public function expenses(): HasMany { return $this->hasMany(Expense::class); }
}
