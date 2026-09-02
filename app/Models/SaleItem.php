<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal'
    ];

    // Una línea de detalle pertenece a una venta
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    // Una línea de detalle pertenece a un producto específico de la carta
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
