<?php

namespace App\Http\Controllers\Api\Nakes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PemeriksaanController extends Controller
{
    // Meja 4 & 5: Pemeriksaan Medis oleh Bidan
    public function store(Request $request)
    {
        $request->validate([
            'antrian_id'     => 'required|exists:antrians,id',
            'berat_badan'    => 'nullable|numeric',
            'tinggi_badan'   => 'nullable|numeric',
            'lingkar_kepala' => 'nullable|numeric',
            'tensi'          => 'nullable|string',    // Lansia: 120/80 mmHg
            'gula_darah'     => 'nullable|string',    // Opsional: 95 mg/dL
            'status_gizi'    => 'nullable|string',    // Normal / Kurang / Buruk / Lebih
            'imunisasi'      => 'nullable|string',    // BCG, DPT-1, Polio, dsb
            'vitamin'        => 'nullable|string',    // Vitamin A, Fe, dsb
            'catatan'        => 'nullable|string',
            'dirujuk'        => 'nullable|boolean',
            'alasan_rujukan' => 'nullable|string',
            'usia_kandungan' => 'nullable|string',
        ]);

        $antrian = \App\Models\Antrian::findOrFail($request->antrian_id);
        $balita  = \App\Models\Balita::where('user_id', $antrian->user_id)->first();

        if ($balita) {
            // Cek apakah Kader sudah membuat record pengukuran awal
            $pemeriksaan = \App\Models\Pemeriksaan::where('jadwal_id', $antrian->jadwal_id)
                ->where('balita_id', $balita->id)->first();

            $data = [
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
            ];

            if ($pemeriksaan) {
                // Bidan melengkapi data medis dari record Kader
                $pemeriksaan->update(array_filter($data, fn($v) => !is_null($v)));
            } else {
                // Bidan membuat record baru (tanpa Kader)
                \App\Models\Pemeriksaan::create(array_merge($data, [
                    'balita_id' => $balita->id,
                    'jadwal_id' => $antrian->jadwal_id,
                ]));
            }
        }

        // Tandai antrian selesai
        $antrian->update(['status' => 'selesai']);

        return response()->json([
            'message' => 'Pemeriksaan medis berhasil disimpan oleh Bidan.',
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
