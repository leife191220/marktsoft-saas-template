<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            // Relación con la compra (Si se borra la compra, se borran sus items)
            $table->foreignId('purchase_id')->constrained()->cascadeOnDelete();

            // Relación con el insumo de inventario
            $table->foreignId('ingredient_id')->constrained()->restrictOnDelete();

            // Detalles numéricos (Usamos decimal 10,3 para soportar cantidades como 1.5 Litros o Kilos)
            $table->decimal('quantity', 10, 3);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
