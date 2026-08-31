<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LaporanFoto;
use App\Models\LaporanPws;

class LaporanKaderController extends Controller
{
    /**
     * Get all laporan (digital & foto) for admin
     */
    public function index(Request $request)
    {
        $fotos = LaporanFoto::with(['posyandu', 'kader'])->orderBy('created_at', 'desc')->get();
        $pws = LaporanPws::with(['posyandu', 'kader'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'fotos' => $fotos,
            'pws'   => $pws,
        ]);
    }

    /**
     * Update status foto laporan (verifikasi)
     */
    public function verifikasiFoto(Request $request, $id)
    {
        $foto = LaporanFoto::findOrFail($id);
        $status = $request->input('status', 'terverifikasi');
        $foto->update(['status' => $status]);

        return response()->json([
            'message' => 'Status laporan foto berhasil diperbarui.',
            'data'    => $foto
        ]);
    }

    /**
     * Update status PWS (verifikasi)
     */
    public function verifikasiPws(Request $request, $id)
    {
        $pws = LaporanPws::findOrFail($id);
        $status = $request->input('status', 'terverifikasi');
        $pws->update(['status' => $status]);

        return response()->json([
            'message' => 'Status PWS digital berhasil diperbarui.',
            'data'    => $pws
        ]);
    }
}
