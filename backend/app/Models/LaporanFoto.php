<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanFoto extends Model
{
    protected $fillable = [
        'posyandu_id', 'kader_id', 'bulan', 'tahun', 'kategori', 'file_path', 'catatan', 'status'
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
