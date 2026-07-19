<?php

namespace App\Http\Controllers\Api\Masyarakat;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;

class PengumumanController extends Controller
{
    public function index()
    {
        $data = Pengumuman::where('is_active', true)
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'       => $p->id,
                'judul'    => $p->judul,
                'isi'      => $p->isi,
                'kategori' => $p->kategori,
                'tanggal'  => $p->created_at->format('d M Y H:i'),
            ]);

        return response()->json(['data' => $data, 'total' => $data->count()]);
    }
}
