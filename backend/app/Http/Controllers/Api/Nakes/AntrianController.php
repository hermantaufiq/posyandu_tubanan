<?php

namespace App\Http\Controllers\Api\Nakes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AntrianController extends Controller
{
    // Meja 4 & 5: Pantau Antrian yang sudah diproses Kader
    public function index(Request $request)
    {
        $jadwalId = $request->query('jadwal_id');
        $status   = $request->query('status'); // tunggu_bidan, selesai, atau null (semua)
        
        $query = \App\Models\Antrian::with([
            'user',
            'jadwal.posyandu',
            'pemeriksaan',
        ]);
            
        if ($jadwalId) {
            $query->where('jadwal_id', $jadwalId);
        }

        // Default tampilkan semua yang sudah/sedang diproses (kecuali masih 'menunggu' saja)
        if ($status) {
            $query->where('status', $status);
        }
        
        $antrians = $query->orderBy('nomor_antri', 'asc')->get();

        // Tambahkan riwayat pemeriksaan sebelumnya untuk setiap pasien
        $antrians->transform(function ($antrian) {
            $antrian->riwayat = \App\Models\Pemeriksaan::where('user_id', $antrian->user_id)
                ->where('antrian_id', '!=', $antrian->pemeriksaan?->antrian_id)
                ->orderBy('created_at', 'desc')
                ->take(6)
                ->get(['id', 'berat_badan', 'tinggi_badan', 'status_gizi', 'imunisasi', 'vitamin', 'catatan', 'created_at']);
            return $antrian;
        });
        
        return response()->json(['data' => $antrians]);
    }

    // Meja 1: Scan QR Balita/Warga Mandiri
    public function scanQr(Request $request)
    {
        $request->validate([
            'qr_payload' => 'required|string',
            'jadwal_id' => 'required|exists:jadwals,id'
        ]);

        try {
            $data = json_decode($request->qr_payload, true);
            
            // Verifikasi payload POSYANDU-TUBANAN
            if (!isset($data['app']) || $data['app'] !== 'POSYANDU-TUBANAN') {
                return response()->json(['message' => 'QR Code tidak valid atau bukan dari sistem Posyandu Tubanan.'], 400);
            }

            // Cek apakah antrian dengan ID ini ada
            $antrian = \App\Models\Antrian::find($data['id']);
            if (!$antrian) {
                return response()->json(['message' => 'Data antrian tidak ditemukan.'], 404);
            }

            // Ubah status antrian menjadi "diperiksa"
            $antrian->update(['status' => 'diperiksa']);

            return response()->json([
                'message' => 'QR Berhasil dipindai. Antrian dikonfirmasi.',
                'data' => $antrian->load('user')
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memproses QR Code.'], 500);
        }
    }

    // Meja 1: Input KTP (Lansia)
    public function inputKtp(Request $request)
    {
        $request->validate([
            'nik' => 'required|string|min:16|max:16',
            'jadwal_id' => 'required|exists:jadwals,id'
        ]);

        // Cari user by NIK
        $user = \App\Models\User::where('nik', $request->nik)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Data KTP tidak terdaftar di sistem kependudukan desa.'], 404);
        }

        // Cek apakah hari ini sudah daftar
        $existing = \App\Models\Antrian::where('user_id', $user->id)
            ->where('jadwal_id', $request->jadwal_id)
            ->first();

        if ($existing) {
            $existing->update(['status' => 'diperiksa']);
            return response()->json([
                'message' => 'Warga sudah memiliki antrian hari ini. Status dikonfirmasi.',
                'data' => $existing->load('user')
            ]);
        }

        // Hitung nomor antrian baru
        $count = \App\Models\Antrian::where('jadwal_id', $request->jadwal_id)->count();
        $nomor = 'A-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        // Buat antrian baru & langsung "diperiksa" karena Lansia datang fisik
        $antrian = \App\Models\Antrian::create([
            'user_id' => $user->id,
            'jadwal_id' => $request->jadwal_id,
            'nomor_antri' => $nomor,
            'status' => 'diperiksa',
            'jenis_layanan' => 'Lansia'
        ]);

        return response()->json([
            'message' => 'Kehadiran Lansia berhasil dicatat.',
            'data' => $antrian->load('user')
        ]);
    }
}
