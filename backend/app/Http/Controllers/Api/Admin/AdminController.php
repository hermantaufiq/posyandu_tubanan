<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\Jadwal;
use App\Models\Pemeriksaan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalWarga    = User::role('masyarakat')->count();
        $totalNakes    = User::role('nakes')->count();
        $totalKader    = User::role('kader')->count();
        $totalAntrian  = Antrian::whereDate('created_at', today())->count();
        $antrianSelesai = Antrian::whereDate('created_at', today())->where('status', 'selesai')->count();
        $totalPemeriksaan = Pemeriksaan::whereMonth('created_at', now()->month)->count();
        $jadwalAktif   = Jadwal::where('tanggal', '>=', today())->count();

        // Kunjungan per bulan (6 bulan terakhir)
        $kunjungan = Antrian::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
                DB::raw('COUNT(*) as total')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        // Antrian terbaru
        $antrianTerbaru = Antrian::with(['user:id,name,nik', 'jadwal.posyandu'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id'           => $a->id,
                'nomor_antri'  => $a->nomor_antri,
                'nama'         => $a->user?->name,
                'jenis'        => $a->jenis_layanan,
                'status'       => $a->status,
                'posyandu'     => $a->jadwal?->posyandu?->name,
                'tanggal'      => $a->created_at->format('d M Y H:i'),
            ]);

        $totalPosyandu = \App\Models\Posyandu::count();

        return response()->json([
            'stats' => [
                'total_warga'        => $totalWarga,
                'total_nakes'        => $totalNakes,
                'total_kader'        => $totalKader,
                'antrian_hari_ini'   => $totalAntrian,
                'antrian_selesai'    => $antrianSelesai,
                'pemeriksaan_bulan'  => $totalPemeriksaan,
                'jadwal_aktif'       => $jadwalAktif,
                'total_posyandu'     => $totalPosyandu,
            ],
            'kunjungan_bulanan' => $kunjungan,
            'antrian_terbaru'   => $antrianTerbaru,
        ]);
    }
}
