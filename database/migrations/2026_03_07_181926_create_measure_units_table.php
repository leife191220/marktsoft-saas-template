<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('measure_units', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej: "Mililitros", "Caja", "Botella"
            $table->string('abbreviation'); // Ej: "ml", "cj", "bot"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('measure_units');
    }
};
