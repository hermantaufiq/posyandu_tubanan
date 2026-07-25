<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanPws extends Model
{
    protected $fillable = [
        'posyandu_id', 'kader_id', 'bulan', 'tahun', 'kategori_sasaran', 'data'
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }

    public function kader()
    {
        return $this->belongsTo(User::class, 'kader_id');
    }
}
