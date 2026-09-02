<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['product', 'expense', 'ingredient']);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_personal')->default(false); // NUEVO: Para separar gastos de casa vs negocio
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('categories'); }
};
