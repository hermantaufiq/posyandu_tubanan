<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\Jadwal;
use App\Models\User;
use App\Models\Posyandu;
use App\Models\LaporanPws;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalWarga    = User::role('masyarakat')->count();
        $totalNakes    = User::role('nakes')->count();
        $totalKader    = User::role('kader')->count();
        $totalPosyandu = Posyandu::count();

        // Ambil semua data PWS untuk dihitung
        $laporanPwsAll = LaporanPws::all();
        
        $totals = ['bumil' => 0, 'balita' => 0, 'remaja' => 0, 'dewasa' => 0, 'lansia' => 0];
        $posyanduSudahUpdate = [];
        
        // Buat struktur tren sasaran per bulan
        $trendData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $monthName = $this->getIndonesianMonth($monthDate->format('n')); // "Agustus"
            $year = $monthDate->format('Y');
            $key = $monthName . ' ' . $year;
            $trendData[$key] = ['bulan' => $monthDate->format('M Y'), 'total' => 0];
        }

        foreach($laporanPwsAll as $lap) {
            $data = is_string($lap->data) ? json_decode($lap->data, true) : $lap->data;
            if (!is_array($data)) continue;
            
            // Hitung total sasaran untuk record ini
            $sumRecord = intval($data['SASARAN_BUMIL'] ?? 0)
                       + intval($data['SASARAN_BAYI'] ?? 0) + intval($data['SASARAN_BALITA_APRAS'] ?? 0)
                       + intval($data['SASARAN_6_14'] ?? 0) + intval($data['SASARAN_15_18'] ?? 0)
                       + intval($data['SASARAN_DEWASA'] ?? 0)
                       + intval($data['SASARAN_LANSIA'] ?? 0);

            // Tambahkan ke tren jika masuk dalam 6 bulan terakhir
            $lapKey = ucfirst(strtolower($lap->bulan)) . ' ' . $lap->tahun;
            // Also try to match numeric month if they saved it as numeric
            if (is_numeric($lap->bulan)) {
                 $lapKey = $this->getIndonesianMonth((int)$lap->bulan) . ' ' . $lap->tahun;
            }

            if (isset($trendData[$lapKey])) {
                $trendData[$lapKey]['total'] += $sumRecord;
            }

            // Untuk stat utama, kita hanya pakai data tahun ini
            if ($lap->tahun == date('Y')) {
                $posyanduSudahUpdate[] = $lap->posyandu_id;
                
                $totals['bumil'] += intval($data['SASARAN_BUMIL'] ?? 0);
                $totals['balita'] += intval($data['SASARAN_BAYI'] ?? 0) + intval($data['SASARAN_BALITA_APRAS'] ?? 0);
                $totals['remaja'] += intval($data['SASARAN_6_14'] ?? 0) + intval($data['SASARAN_15_18'] ?? 0);
                $totals['dewasa'] += intval($data['SASARAN_DEWASA'] ?? 0);
                $totals['lansia'] += intval($data['SASARAN_LANSIA'] ?? 0);
            }
        }
        
        $totalSasaran = array_sum($totals);
        $sasaranKIA = $totals['bumil'] + $totals['balita'];
        
        $posyanduBelumUpdate = Posyandu::whereNotIn('id', array_unique($posyanduSudahUpdate))->get()->map(fn($p) => [
            'nama' => $p->name,
            'desa' => 'TUBANAN',
            'kecamatan' => 'KEMBANG',
            'terakhir_update' => '-'
        ]);

        $kegiatanTerbaru = Jadwal::with('posyandu')
            ->orderBy('tanggal', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($j) => [
                'id' => $j->id,
                'kegiatan' => $j->kegiatan,
                'posyandu' => $j->posyandu?->name,
                'tanggal' => Carbon::parse($j->tanggal)->format('d M Y'),
                'status' => 'Disetujui'
            ]);

        $trenSasaran = array_values($trendData);

        return response()->json([
            'stats' => [
                'total_posyandu' => $totalPosyandu,
                'total_kader'    => $totalKader,
                'total_sasaran'  => $totalSasaran,
                'sasaran_kia'    => $sasaranKIA,
                'proporsi'       => [
                    ['name' => 'Bumil', 'value' => $totals['bumil']],
                    ['name' => 'Balita', 'value' => $totals['balita']],
                    ['name' => 'Remaja', 'value' => $totals['remaja']],
                    ['name' => 'Dewasa', 'value' => $totals['dewasa']],
                    ['name' => 'Lansia', 'value' => $totals['lansia']],
                ]
            ],
            'kegiatan_terbaru' => $kegiatanTerbaru,
            'posyandu_belum_update' => $posyanduBelumUpdate,
            'tren_sasaran' => $trenSasaran,
        ]);
    }

    private function getIndonesianMonth($numericMonth)
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        return $months[$numericMonth] ?? '';
    }
}

