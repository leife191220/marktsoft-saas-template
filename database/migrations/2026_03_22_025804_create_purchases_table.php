<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            // Relación con el proveedor
            $table->foreignId('supplier_id')->constrained()->restrictOnDelete();

            // Datos del comprobante
            $table->string('invoice_number')->nullable()->comment('Número de factura o recibo');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->date('purchase_date');

            // Estado y método de pago
            $table->string('status')->default('completed')->comment('pending, completed, cancelled');
            $table->string('payment_method')->default('efectivo')->comment('efectivo, transferencia, tarjeta');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
