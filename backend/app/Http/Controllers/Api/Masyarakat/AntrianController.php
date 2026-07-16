<?php

namespace App\Http\Controllers\Api\Masyarakat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AntrianController extends Controller
{
    public function index(Request $request)
    {
        $antrian = \App\Models\Antrian::with('jadwal.posyandu')
            ->where('user_id', $request->user()->id)
            ->where('status', 'menunggu')
            ->first();
            
        return response()->json([
            'data' => $antrian
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jadwal_id' => 'required|exists:jadwals,id',
            'jenis_layanan' => 'nullable|string'
        ]);

        $userId = $request->user()->id;
        
        // Cek jika sudah punya antrian menunggu
        $exists = \App\Models\Antrian::where('user_id', $userId)
            ->where('status', 'menunggu')
            ->first();

        if ($exists) {
            return response()->json(['message' => 'Anda sudah memiliki antrian aktif.'], 400);
        }

        // Generate nomor antrian
        $count = \App\Models\Antrian::where('jadwal_id', $request->jadwal_id)->count();
        $nomor = 'A-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        $antrian = \App\Models\Antrian::create([
            'jadwal_id' => $request->jadwal_id,
            'user_id' => $userId,
            'nomor_antri' => $nomor,
            'status' => 'menunggu',
            'jenis_layanan' => $request->jenis_layanan ?? 'Balita/Umum'
        ]);

        // Load relations for response
        $antrian->load('jadwal.posyandu');

        return response()->json([
            'message' => 'Antrian berhasil dibuat',
            'data' => $antrian
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $antrian = \App\Models\Antrian::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$antrian) {
            return response()->json(['message' => 'Antrian tidak ditemukan'], 404);
        }

        $antrian->delete();

        return response()->json(['message' => 'Antrian berhasil dibatalkan']);
    }
}
