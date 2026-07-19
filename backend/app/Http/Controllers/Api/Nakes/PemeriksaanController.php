<?php

namespace App\Http\Controllers\Api\Nakes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PemeriksaanController extends Controller
{
    /**
     * Get daftar jadwal aktif
     */
    public function getJadwalAktif()
    {
        $jadwals = \App\Models\Jadwal::with('posyandu')->orderBy('tanggal', 'desc')->get();
        return response()->json(['success' => true, 'data' => $jadwals]);
    }

    // Meja 4 & 5: Pemeriksaan Medis oleh Bidan
    public function store(Request $request)
    {
        $request->validate([
            'antrian_id'     => 'required|exists:antrians,id',
            'berat_badan'    => 'nullable|numeric',
            'tinggi_badan'   => 'nullable|numeric',
            'lingkar_kepala' => 'nullable|numeric',
            'tensi'          => 'nullable|string',
            'gula_darah'     => 'nullable|string',
            'status_gizi'    => 'nullable|string',
            'imunisasi'      => 'nullable|string',
            'vitamin'        => 'nullable|string',
            'catatan'        => 'nullable|string',
            'dirujuk'        => 'nullable|boolean',
            'alasan_rujukan' => 'nullable|string',
            'usia_kandungan' => 'nullable|string',
        ]);

        $antrian = \App\Models\Antrian::findOrFail($request->antrian_id);

        // Cek apakah Kader sudah buat record pengukuran awal
        $pemeriksaan = \App\Models\Pemeriksaan::where('antrian_id', $antrian->id)->first();

        $data = array_filter([
            'berat_badan'    => $request->berat_badan,
            'tinggi_badan'   => $request->tinggi_badan,
            'lingkar_kepala' => $request->lingkar_kepala,
            'tensi'          => $request->tensi,
            'gula_darah'     => $request->gula_darah,
            'status_gizi'    => $request->status_gizi ?? 'Normal',
            'imunisasi'      => $request->imunisasi,
            'vitamin'        => $request->vitamin,
            'catatan'        => $request->catatan,
            'dirujuk'        => $request->dirujuk ?? false,
            'alasan_rujukan' => $request->alasan_rujukan,
            'usia_kandungan' => $request->usia_kandungan,
        ], fn($v) => !is_null($v));

        if ($pemeriksaan) {
            // Bidan melengkapi data medis dari record Kader
            $pemeriksaan->update($data);
        } else {
            // Bidan membuat record baru (warga langsung ke Bidan)
            \App\Models\Pemeriksaan::create(array_merge($data, [
                'antrian_id' => $antrian->id,
                'user_id'    => $antrian->user_id,
                'jadwal_id'  => $antrian->jadwal_id,
            ]));
        }

        // Tandai antrian selesai
        $antrian->update(['status' => 'selesai']);

        return response()->json([
            'message' => 'Pemeriksaan medis berhasil disimpan.',
        ]);
    }

    // Meja 2 & 3: Pengukuran oleh Kader
    public function storeKader(Request $request)
    {
        $request->validate([
            'antrian_id'   => 'required|exists:antrians,id',
            'berat_badan'  => 'nullable|numeric',
            'tinggi_badan' => 'nullable|numeric',
        ]);

        $antrian = \App\Models\Antrian::findOrFail($request->antrian_id);

        $balita = \App\Models\Balita::where('user_id', $antrian->user_id)->first();

        if ($balita) {
            \App\Models\Pemeriksaan::create([
                'balita_id'    => $balita->id,
                'jadwal_id'    => $antrian->jadwal_id,
                'berat_badan'  => $request->berat_badan,
                'tinggi_badan' => $request->tinggi_badan,
                'catatan'      => 'Diukur oleh Kader'
            ]);
        }

        // Lanjut ke Meja Bidan
        $antrian->update(['status' => 'tunggu_bidan']);

        return response()->json([
            'message' => 'Pengukuran Kader berhasil disimpan. Lanjut ke Bidan.',
        ]);
    }
}
