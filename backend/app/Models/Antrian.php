<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Antrian extends Model
{
    protected $fillable = [
        'user_id', 'jadwal_id', 'nomor_antri', 'status', 'jenis_layanan'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class);
    }

    // Pengukuran/pemeriksaan yang terkait langsung dengan antrian ini
    public function pemeriksaan()
    {
        return $this->hasOne(Pemeriksaan::class, 'antrian_id');
    }
}
