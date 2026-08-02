<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posyandu extends Model
{
    protected $fillable = [
        'name', 'location', 'dusun', 'rt', 'rw', 'description',
        'ketua_name', 'no_hp_ketua', 'deskripsi'
    ];

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function pemeriksaans()
    {
        return $this->hasManyThrough(Pemeriksaan::class, Jadwal::class);
    }

    public function kaders()
    {
        return $this->hasMany(User::class)->role('kader');
    }

    public function warga()
    {
        return $this->hasMany(User::class)->role('masyarakat');
    }
}

