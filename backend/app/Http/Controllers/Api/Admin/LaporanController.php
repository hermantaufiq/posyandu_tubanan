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
        $data = Pemeriksaan::with(['user', 'jadwal.posyandu'])
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'               => $p->id,
                'tanggal'          => $p->created_at->format('d M Y'),
                'nama'             => $p->user?->name ?? ($p->balita?->name ?? '-'),
                'jenis'            => $p->jadwal?->kegiatan ?? 'Umum',
                'berat_badan'      => $p->berat_badan,
                'tinggi_badan'     => $p->tinggi_badan,
                'lingkar_kepala'   => $p->lingkar_kepala,
                'status_gizi'      => $p->status_gizi,
                'posyandu'         => $p->jadwal?->posyandu?->name,

                // Data ILP
                'sistole'          => $p->sistole,
                'diastole'         => $p->diastole,
                'gula_darah'       => $p->gula_darah,
                'skrining_tbc'     => $p->skrining_tbc,
                'catatan_kader'    => $p->catatan_kader,
                'catatan_keluhan'  => $p->catatan_keluhan,
                'diagnosa_bidan'   => $p->diagnosa_bidan,
                'is_lapor_mandiri' => str_contains($p->catatan_kader ?? '', '[Laporan Mandiri Warga]')
                                   || str_contains($p->catatan_keluhan ?? '', '[Laporan Mandiri Warga]'),
            ]);

        return response()->json(['data' => $data]);
    }
}
