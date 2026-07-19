<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemeriksaan extends Model
{
    protected $fillable = [
        'antrian_id', 'balita_id', 'user_id', 'jadwal_id',
        'berat_badan', 'tinggi_badan', 'lingkar_kepala',
        'lingkar_perut', 'lila', 'status_gizi',
        'tensi', 'sistole', 'diastole', 'gula_darah',
        'imunisasi', 'vitamin',
        'catatan', 'catatan_kader', 'catatan_keluhan', 'diagnosa_bidan',
        'dirujuk', 'alasan_rujukan', 'usia_kandungan',
        'skrining_tbc', 'skrining_lansia', 'skrining_ptm',
    ];

    protected $casts = [
        'skrining_tbc'    => 'array',
        'skrining_lansia' => 'array',
        'skrining_ptm'    => 'array',
    ];

    public function antrian()
    {
        return $this->belongsTo(Antrian::class);
    }

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
