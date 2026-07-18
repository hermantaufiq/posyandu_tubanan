<?php

namespace App\Http\Controllers\Api\Masyarakat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pemeriksaan;
use App\Models\User;

class RiwayatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $pemeriksaans = Pemeriksaan::with(['jadwal.posyandu'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('balita', function ($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $riwayat = $pemeriksaans->map(function ($p) {
            $tbc_gejala = 0;
            $tbc_detail = [false, false, false, false];
            if ($p->skrining_tbc && is_array($p->skrining_tbc)) {
                $tbc_detail = $p->skrining_tbc;
                $tbc_gejala = count(array_filter($p->skrining_tbc, fn($v) => $v === true));
            }

            $aks_score = null;
            if ($p->skrining_lansia && is_array($p->skrining_lansia)) {
                $aks_score = array_sum(array_map('intval', $p->skrining_lansia));
            }

            // IMT jika ada BB & TB
            $imt = null;
            $kategori_imt = null;
            if ($p->berat_badan && $p->tinggi_badan && $p->tinggi_badan > 0) {
                $tb_m = $p->tinggi_badan / 100;
                $imt = round($p->berat_badan / ($tb_m * $tb_m), 1);
                if ($imt < 18.5) $kategori_imt = 'Kurus';
                elseif ($imt < 25) $kategori_imt = 'Normal';
                elseif ($imt < 27) $kategori_imt = 'Overweight';
                else $kategori_imt = 'Obesitas';
            }

            return [
                'id'            => $p->id,
                'tanggal'       => $p->created_at->format('Y-m-d'),
                'tanggal_label' => $p->created_at->translatedFormat('d M Y'),
                'bulan_label'   => $p->created_at->translatedFormat('F Y'),
                'posyandu'      => $p->jadwal->posyandu->name ?? 'Posyandu Tubanan',
                'sumber'        => 'kader', // future: 'mandiri'

                // BAGIAN 1: Penimbangan & Pengukuran
                'penimbangan' => [
                    'berat_badan'    => $p->berat_badan,
                    'tinggi_badan'   => $p->tinggi_badan,
                    'lingkar_kepala' => $p->lingkar_kepala,
                    'lingkar_perut'  => $p->lingkar_perut,
                    'lila'           => $p->lila,
                    'status_gizi'    => $p->status_gizi,
                    'imt'            => $imt,
                    'kategori_imt'   => $kategori_imt,
                    'imunisasi'      => $p->imunisasi,
                    'vitamin'        => $p->vitamin,
                ],

                // BAGIAN 2: Skrining TBC (4 Indikator)
                'skrining_tbc' => [
                    'detail'       => $tbc_detail, // array 4 boolean
                    'jumlah_gejala' => $tbc_gejala,
                    'hasil'        => $tbc_gejala >= 2 ? 'Suspek TBC' : ($tbc_gejala === 1 ? 'Perlu Pantau' : 'Negatif'),
                    'dirujuk'      => (bool)$p->dirujuk,
                    'alasan_rujukan' => $p->alasan_rujukan,
                ],

                // BAGIAN 3: Pelayanan Kesehatan
                'pelayanan' => [
                    'tensi'         => $p->tensi,
                    'gula_darah'    => $p->gula_darah,
                    'usia_kandungan' => $p->usia_kandungan,
                    'aks_score'     => $aks_score,
                    'catatan'       => $p->catatan,
                    'dirujuk'       => (bool)$p->dirujuk,
                    'alasan_rujukan' => $p->alasan_rujukan,
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $riwayat,
        ]);
    }

    /**
     * Self-report penuh oleh warga (BB, TB, Tensi, Gula, Skrining TBC)
     * Data akan ditandai sumber = 'mandiri'
     */
    public function laporMandiri(Request $request)
    {
        $request->validate([
            'berat_badan'  => 'nullable|numeric|min:1|max:300',
            'tinggi_badan' => 'nullable|numeric|min:20|max:250',
            'lingkar_perut' => 'nullable|numeric',
            'lila'         => 'nullable|numeric',
            'tensi'        => 'nullable|string|max:20',
            'gula_darah'   => 'nullable|numeric',
            'skrining_tbc' => 'nullable|array|size:4',
            'skrining_tbc.*' => 'boolean',
            'catatan'      => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $jadwal = \App\Models\Jadwal::latest()->first();

        // Hitung IMT jika ada BB & TB
        $imt = null;
        if ($request->berat_badan && $request->tinggi_badan > 0) {
            $tb_m = $request->tinggi_badan / 100;
            $imt = round($request->berat_badan / ($tb_m * $tb_m), 1);
        }

        // Tentukan status gizi berdasarkan IMT
        $status_gizi = null;
        if ($imt !== null) {
            if ($imt < 18.5)      $status_gizi = 'Kurus (IMT ' . $imt . ')';
            elseif ($imt < 25)    $status_gizi = 'Normal (IMT ' . $imt . ')';
            elseif ($imt < 27)    $status_gizi = 'Overweight (IMT ' . $imt . ')';
            else                  $status_gizi = 'Obesitas (IMT ' . $imt . ')';
        }

        $catatanAkhir = $request->catatan ?? '';
        $catatanAkhir = trim('[Laporan Mandiri Warga] ' . $catatanAkhir);

        $p = \App\Models\Pemeriksaan::create([
            'user_id'       => $user->id,
            'jadwal_id'     => $jadwal?->id,
            'berat_badan'   => $request->berat_badan,
            'tinggi_badan'  => $request->tinggi_badan,
            'lingkar_perut' => $request->lingkar_perut,
            'lila'          => $request->lila,
            'tensi'         => $request->tensi,
            'gula_darah'    => $request->gula_darah,
            'skrining_tbc'  => $request->skrining_tbc ?? [false, false, false, false],
            'status_gizi'   => $status_gizi,
            'catatan'       => $catatanAkhir,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data pemeriksaan mandiri berhasil disimpan.',
            'data'    => $p,
        ]);
    }

    /**
     * @deprecated — gunakan laporMandiri()
     */
    public function skriningMandiri(Request $request)
    {
        return $this->laporMandiri($request);
    }
}
