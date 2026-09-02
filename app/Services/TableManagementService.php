<?php

namespace App\Services;

use App\Models\Table;
use Exception;

class TableManagementService
{
    public function markAsOccupied(Table $table): void
    {
        if ($table->status !== 'available') {
            throw new Exception("La mesa {$table->name} no está disponible.");
        }
        $table->update(['status' => 'occupied']);
    }

    public function markAsPaying(Table $table): void
    {
        $table->update(['status' => 'paying']);
    }

    public function releaseTable(Table $table): void
    {
        $table->update(['status' => 'available']);
    }
}
