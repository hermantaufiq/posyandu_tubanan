<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    protected $fillable = [
        'posyandu_id', 'tanggal', 'waktu_mulai', 'waktu_selesai', 'kegiatan', 'keterangan', 'kapasitas'
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }

    public function antrians()
    {
        return $this->hasMany(Antrian::class);
    }
}
