<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemeriksaan extends Model
{
    protected $fillable = [
        'balita_id', 'jadwal_id', 'berat_badan', 'tinggi_badan', 'lingkar_kepala',
        'status_gizi', 'tensi', 'gula_darah', 'imunisasi', 'vitamin', 'catatan',
        'dirujuk', 'alasan_rujukan', 'usia_kandungan'
    ];

    public function balita()
    {
        return $this->belongsTo(Balita::class);
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class);
    }
}
