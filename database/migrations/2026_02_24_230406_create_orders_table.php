<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')->nullable()->constrained(); // Nullable para ventas de pie
            $table->foreignId('user_id')->constrained();
            $table->foreignId('customer_id')->nullable()->constrained(); // Nullable si no dan datos
            $table->enum('status', ['open', 'closed', 'canceled'])->default('open');
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orders'); }
};
