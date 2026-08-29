<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Antrian;
use App\Models\Jadwal;
use App\Models\Pemeriksaan;
use App\Models\Posyandu;
use App\Models\LaporanPws;

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

    public function rekapSasaran(Request $request)
    {
        $query = LaporanPws::with('posyandu');
        if ($request->has('bulan')) {
            $query->where('bulan', $request->bulan);
        }
        if ($request->has('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        $laporans = $query->get();
        $posyandus = Posyandu::all();

        $totals = [
            'bumil' => 0,
            'balita' => 0,
            'remaja' => 0,
            'dewasa' => 0,
            'lansia' => 0,
        ];

        $rekapPerPosyandu = [];
        foreach ($posyandus as $p) {
            $rekapPerPosyandu[$p->id] = [
                'nama' => $p->name,
                'bumil' => 0,
                'balita' => 0,
                'remaja' => 0,
                'dewasa' => 0,
                'lansia' => 0,
                'updated' => false,
            ];
        }

        foreach ($laporans as $lap) {
            $data = is_string($lap->data) ? json_decode($lap->data, true) : $lap->data;
            if (!is_array($data)) continue;

            $pId = $lap->posyandu_id;
            if (!isset($rekapPerPosyandu[$pId])) continue;

            $rekapPerPosyandu[$pId]['updated'] = true;

            $bumil = intval($data['SASARAN_BUMIL'] ?? 0);
            $balita = intval($data['SASARAN_BAYI'] ?? 0) + intval($data['SASARAN_BALITA_APRAS'] ?? 0);
            $remaja = intval($data['SASARAN_6_14'] ?? 0) + intval($data['SASARAN_15_18'] ?? 0);
            $dewasa = intval($data['SASARAN_DEWASA'] ?? 0);
            $lansia = intval($data['SASARAN_LANSIA'] ?? 0);

            $rekapPerPosyandu[$pId]['bumil'] += $bumil;
            $rekapPerPosyandu[$pId]['balita'] += $balita;
            $rekapPerPosyandu[$pId]['remaja'] += $remaja;
            $rekapPerPosyandu[$pId]['dewasa'] += $dewasa;
            $rekapPerPosyandu[$pId]['lansia'] += $lansia;

            $totals['bumil'] += $bumil;
            $totals['balita'] += $balita;
            $totals['remaja'] += $remaja;
            $totals['dewasa'] += $dewasa;
            $totals['lansia'] += $lansia;
        }

        return response()->json([
            'totals' => $totals,
            'posyandu' => array_values($rekapPerPosyandu)
        ]);
    }
}
