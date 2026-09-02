<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChecklistTask extends Model
{
    protected $fillable = ['name', 'description', 'is_active'];

    public function records(): HasMany { return $this->hasMany(ChecklistRecord::class); }
}
