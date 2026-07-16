<?php

namespace App\Http\Controllers\Api\Kader;

use App\Http\Controllers\Controller;
use App\Models\Antrian;
use App\Models\Pemeriksaan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class KaderController extends Controller
{
    /**
     * Get daftar antrian untuk jadwal hari ini.
     * Mengelompokkan berdasarkan status (menunggu, hadir, tunggu_bidan, selesai).
     */
    public function getAntrian(Request $request)
    {
        $jadwalId = $request->query('jadwal_id', 1);

        $antrians = Antrian::with(['user', 'pemeriksaan'])
            ->where('jadwal_id', $jadwalId)
            ->orderBy('nomor_antrian', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $antrians
        ]);
    }

    /**
     * Meja 1: Tandai warga hadir berdasarkan ID Antrian (Scan QR atau Manual).
     */
    public function tandaiHadir(Request $request)
    {
        $request->validate([
            'antrian_id' => 'required|exists:antrians,id'
        ]);

        $antrian = Antrian::findOrFail($request->antrian_id);
        
        if ($antrian->status === 'menunggu') {
            $antrian->update(['status' => 'hadir']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Warga berhasil ditandai hadir.',
            'data' => $antrian
        ]);
    }

    /**
     * Meja 1: Daftarkan warga baru (Walk-in) menggunakan NIK.
     * Buat user baru (jika belum ada) dan langsung masukkan ke antrian.
     */
    public function daftarWalkIn(Request $request)
    {
        $request->validate([
            'nik' => 'required|string|size:16',
            'name' => 'required|string|max:255',
            'jenis_layanan' => 'required|string|in:Balita,Ibu Hamil,Ibu Nifas,Lansia',
            'jadwal_id' => 'required|exists:jadwal_posyandus,id',
        ]);

        // Cek atau buat user berdasarkan NIK
        $user = User::where('nik', $request->nik)->first();
        if (!$user) {
            $user = User::create([
                'nik' => $request->nik,
                'name' => $request->name,
                'email' => $request->nik . '@walkin.posyandu.id',
                'password' => Hash::make($request->nik), // default password is NIK
                'is_active' => true,
            ]);
            $user->assignRole('masyarakat');
        }

        // Cek apakah sudah ada di antrian hari ini
        $existing = Antrian::where('user_id', $user->id)
            ->where('jadwal_id', $request->jadwal_id)
            ->first();

        if ($existing) {
            // Langsung tandai hadir jika sudah ada
            if ($existing->status === 'menunggu') {
                $existing->update(['status' => 'hadir']);
            }
            return response()->json([
                'success' => true,
                'message' => 'Warga sudah terdaftar di antrian.',
                'data' => $existing
            ]);
        }

        // Buat antrian baru
        $lastAntrian = Antrian::where('jadwal_id', $request->jadwal_id)->max('nomor_antri') ?? 0;
        
        $antrian = Antrian::create([
            'jadwal_id' => $request->jadwal_id,
            'user_id' => $user->id,
            'nomor_antri' => $lastAntrian + 1,
            'status' => 'hadir', // Walk-in otomatis hadir
            'jenis_layanan' => $request->jenis_layanan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran walk-in berhasil.',
            'data' => $antrian
        ]);
    }

    /**
     * Meja 2: Simpan data pengukuran (BB, TB, Lingkar Kepala).
     * Mengubah status antrian menjadi 'tunggu_bidan'.
     */
    public function simpanPengukuran(Request $request)
    {
        $request->validate([
            'antrian_id' => 'required|exists:antrians,id',
            'berat_badan' => 'required|numeric',
            'tinggi_badan' => 'required|numeric',
            'lingkar_kepala' => 'nullable|numeric',
        ]);

        $antrian = Antrian::with('user')->findOrFail($request->antrian_id);

        // Cari atau buat profil Balita (dummy atau asli) untuk user ini
        $balita = \App\Models\Balita::firstOrCreate(
            ['user_id' => $antrian->user_id],
            [
                'nama_balita' => $antrian->user->name,
                'nik_balita' => $antrian->user->nik ?? '0000',
                'tanggal_lahir' => $antrian->user->date_of_birth ?? now()->subYears(1),
                'jenis_kelamin' => $antrian->user->gender ?? 'L',
            ]
        );

        // Buat record pemeriksaan awal
        $pemeriksaan = Pemeriksaan::create([
            'balita_id' => $balita->id,
            'jadwal_id' => $antrian->jadwal_id,
            'berat_badan' => $request->berat_badan,
            'tinggi_badan' => $request->tinggi_badan,
            'lingkar_kepala' => $request->lingkar_kepala,
        ]);

        // Hubungkan dengan antrian dan ubah status
        $antrian->update([
            'status' => 'tunggu_bidan'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data pengukuran berhasil disimpan. Warga diarahkan ke Meja Bidan.',
            'data' => $pemeriksaan
        ]);
    }
}
