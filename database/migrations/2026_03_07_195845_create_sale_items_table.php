<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            // Relación con la venta principal (Si se borra la venta, se borra el detalle)
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            // Relación con el producto vendido
            $table->foreignId('product_id')->constrained();

            $table->integer('quantity'); // Cantidad vendida (Ej: 2 mojitos)
            $table->decimal('unit_price', 12, 2); // Precio al que se vendió en ese momento
            $table->decimal('subtotal', 12, 2); // Cantidad x Precio

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
