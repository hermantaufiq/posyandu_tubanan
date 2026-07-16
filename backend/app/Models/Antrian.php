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

    // Pengukuran/pemeriksaan yang terkait dengan antrian ini
    public function pemeriksaan()
    {
        return $this->hasOneThrough(
            Pemeriksaan::class,
            Balita::class,
            'user_id',       // FK on balitas → users
            'balita_id',     // FK on pemeriksaans → balitas
            'user_id',       // local key on antrians
            'id'             // local key on balitas
        )->where('pemeriksaans.jadwal_id', $this->jadwal_id ?? 0);
    }
}
