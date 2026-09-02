<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('supplier_id')->nullable()->constrained(); // Solo si es una compra
            $table->enum('type', ['purchase', 'sale', 'waste', 'adjustment']);
            $table->decimal('quantity', 10, 2); // Negativo para salidas, positivo entradas
            $table->decimal('previous_stock', 10, 2);
            $table->decimal('new_stock', 10, 2);
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('inventory_transactions'); }
};
