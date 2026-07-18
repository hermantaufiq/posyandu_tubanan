<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemeriksaan extends Model
{
    protected $fillable = [
        'balita_id', 'user_id', 'jadwal_id', 'berat_badan', 'tinggi_badan', 'lingkar_kepala',
        'lingkar_perut', 'lila', 'status_gizi', 'tensi', 'gula_darah', 'imunisasi', 'vitamin', 'catatan',
        'dirujuk', 'alasan_rujukan', 'usia_kandungan',
        'skrining_tbc', 'skrining_lansia', 'skrining_ptm'
    ];

    protected $casts = [
        'skrining_tbc' => 'array',
        'skrining_lansia' => 'array',
        'skrining_ptm' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function balita()
    {
        return $this->belongsTo(Balita::class);
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class);
    }
}
