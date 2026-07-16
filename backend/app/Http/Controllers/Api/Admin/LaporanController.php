<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\Jadwal;
use App\Models\Pemeriksaan;

class LaporanController extends Controller
{
    public function antrian()
    {
        $jadwals = Jadwal::with(['posyandu', 'antrians.user'])
            ->orderByDesc('tanggal')
            ->get()
            ->map(fn($j) => [
                'id'         => $j->id,
                'tanggal'    => $j->tanggal,
                'kegiatan'   => $j->kegiatan,
                'posyandu'   => $j->posyandu?->name,
                'total'      => $j->antrians->count(),
                'hadir'      => $j->antrians->whereIn('status', ['hadir', 'pengukuran', 'tunggu_bidan', 'selesai'])->count(),
                'selesai'    => $j->antrians->where('status', 'selesai')->count(),
                'tidak_hadir'=> $j->antrians->where('status', 'menunggu')->count(),
                'antrians'   => $j->antrians->map(fn($a) => [
                    'nomor'  => $a->nomor_antri,
                    'nama'   => $a->user?->name,
                    'jenis'  => $a->jenis_layanan,
                    'status' => $a->status,
                ]),
            ]);

        return response()->json(['data' => $jadwals]);
    }

    public function pemeriksaan()
    {
        $data = Pemeriksaan::with(['antrian.user', 'antrian.jadwal.posyandu'])
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'tanggal'       => $p->created_at->format('d M Y'),
                'nama'          => $p->antrian?->user?->name,
                'jenis'         => $p->antrian?->jenis_layanan,
                'berat_badan'   => $p->berat_badan,
                'tinggi_badan'  => $p->tinggi_badan,
                'lingkar_kepala'=> $p->lingkar_kepala,
                'status_gizi'   => $p->status_gizi,
                'posyandu'      => $p->antrian?->jadwal?->posyandu?->name,
            ]);

        return response()->json(['data' => $data]);
    }
}
