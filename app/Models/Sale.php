<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    // Añadimos 'status' para manejar estados de la venta (Ej: 'completed', 'pending')
    protected $fillable = [
        'order_id',
        'user_id',
        'customer_id',
        'total',
        'payment_method',
        'status'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    // NUEVO: Una venta tiene muchos ítems (detalle de factura)
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
