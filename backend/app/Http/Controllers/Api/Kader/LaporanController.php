<?php

namespace App\Http\Controllers\Api\Kader;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LaporanFoto;
use App\Models\LaporanPws;
use Illuminate\Support\Facades\Storage;

class LaporanController extends Controller
{
    /**
     * Upload foto form manual dari Kader
     */
    public function uploadFoto(Request $request)
    {
        $request->validate([
            'kategori' => 'required|string',
            'bulan'    => 'required|string',
            'tahun'    => 'required|integer',
            'foto'     => 'required|image|max:5120', // maks 5MB
            'catatan'  => 'nullable|string',
        ]);

        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json(['message' => 'Akun Anda belum terhubung ke Posyandu tertentu.'], 403);
        }

        $path = $request->file('foto')->store('laporan_kader', 'public');

        $laporan = LaporanFoto::create([
            'posyandu_id' => $user->posyandu_id,
            'kader_id'    => $user->id,
            'bulan'       => $request->bulan,
            'tahun'       => $request->tahun,
            'kategori'    => $request->kategori,
            'file_path'   => $path,
            'catatan'     => $request->catatan,
            'status'      => 'menunggu_verifikasi'
        ]);

        return response()->json([
            'message' => 'Foto laporan berhasil diunggah.',
            'data'    => $laporan
        ]);
    }

    /**
     * Simpan angka PWS secara digital
     */
    public function simpanPws(Request $request)
    {
        $request->validate([
            'kategori' => 'required|string',
            'bulan'    => 'required|string',
            'tahun'    => 'required|integer',
            'data'     => 'required|array',
        ]);

        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json(['message' => 'Akun Anda belum terhubung ke Posyandu tertentu.'], 403);
        }

        $pws = LaporanPws::updateOrCreate(
            [
                'posyandu_id'      => $user->posyandu_id,
                'bulan'            => $request->bulan,
                'tahun'            => $request->tahun,
                'kategori_sasaran' => $request->kategori,
            ],
            [
                'kader_id' => $user->id,
                'data'     => $request->data,
            ]
        );

        return response()->json([
            'message' => 'Data PWS digital berhasil disimpan.',
            'data'    => $pws
        ]);
    }

    /**
     * Riwayat laporan Kader
     */
    public function riwayat(Request $request)
    {
        $user = $request->user();

        $fotos = LaporanFoto::where('posyandu_id', $user->posyandu_id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        $pws = LaporanPws::where('posyandu_id', $user->posyandu_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'fotos' => $fotos,
            'pws'   => $pws,
        ]);
    }
}
