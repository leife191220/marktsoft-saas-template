<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = ['name', 'contact_name', 'phone', 'email', 'is_active'];

    public function inventoryTransactions(): HasMany { return $this->hasMany(InventoryTransaction::class); }
}
