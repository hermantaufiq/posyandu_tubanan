<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posyandu extends Model
{
    protected $fillable = [
        'name', 'location', 'dusun', 'rt', 'rw', 'description'
    ];

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }
}
