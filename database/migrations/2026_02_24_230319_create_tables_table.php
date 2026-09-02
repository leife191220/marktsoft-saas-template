<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej: "Mesa 1", "Barra"
            $table->enum('status', ['available', 'occupied', 'paying'])->default('available');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('tables'); }
};
