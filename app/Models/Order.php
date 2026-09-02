<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    // 1. Aseguramos que user_id esté habilitado
    // 2. Agregamos created_at y updated_at para permitir inserción de historial
    protected $fillable = [
        'table_id', 
        'user_id', 
        'customer_id', 
        'status', 
        'total',
        'created_at',
        'updated_at'
    ];

    public function table(): BelongsTo { return $this->belongsTo(Table::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function details(): HasMany { return $this->hasMany(OrderDetail::class); }
}