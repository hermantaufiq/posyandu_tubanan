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
     * Get daftar jadwal aktif
     */
    public function getJadwalAktif()
    {
        $jadwals = \App\Models\Jadwal::with('posyandu')->orderBy('tanggal', 'desc')->get();
        return response()->json(['success' => true, 'data' => $jadwals]);
    }

    /**
     * Get daftar antrian untuk jadwal hari ini.
     * Mengelompokkan berdasarkan status (menunggu, hadir, tunggu_bidan, selesai).
     */
    public function getAntrian(Request $request)
    {
        $jadwalId = $request->query('jadwal_id');

        $antrians = Antrian::with(['user', 'pemeriksaan'])
            ->where('jadwal_id', $jadwalId)
            ->orderBy('nomor_antri', 'asc')
            ->get()
            ->map(fn($a) => [
                'id'            => $a->id,
                'nomor_antri'   => $a->nomor_antrian ?? $a->nomor_antri,
                'jenis_layanan' => $a->jenis_layanan,
                'status'        => $a->status,
                'pemeriksaan'   => $a->pemeriksaan,
                'user' => $a->user ? [
                    'id'              => $a->user->id,
                    'name'            => $a->user->name,
                    'nik'             => $a->user->nik,
                    'phone'           => $a->user->phone,
                    'kategori_warga'  => $a->user->kategori_warga ?? 'sasaran',
                    'alamat_asal'     => $a->user->alamat_asal,
                ] : null,
            ]);

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
            'jenis_layanan' => 'required|string|in:Balita dan Anak Prasekolah,Ibu Hamil,Ibu Nifas dan Menyusui,Anak Usia Sekolah dan Remaja,Usia Produktif,Lansia',
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
            'berat_badan' => 'nullable|numeric',
            'tinggi_badan' => 'nullable|numeric',
            'lingkar_kepala' => 'nullable|numeric',
            'lingkar_perut' => 'nullable|numeric',
            'lila' => 'nullable|numeric',
            'tensi' => 'nullable|string',
            'gula_darah' => 'nullable|numeric',
            'skrining_tbc' => 'nullable|array',
            'skrining_lansia' => 'nullable|array',
            'skrining_ptm' => 'nullable|array',
        ]);

        $antrian = Antrian::with('user')->findOrFail($request->antrian_id);

        // Cek apakah layanannya untuk Balita
        $balita_id = null;
        if (str_contains(strtolower($antrian->jenis_layanan), 'balita') || str_contains(strtolower($antrian->jenis_layanan), 'prasekolah')) {
            $balita = \App\Models\Balita::firstOrCreate(
                ['user_id' => $antrian->user_id],
                [
                    'nama_balita' => $antrian->user->name,
                    'nik_balita' => $antrian->user->nik ?? '0000',
                    'tanggal_lahir' => $antrian->user->date_of_birth ?? now()->subYears(1),
                    'jenis_kelamin' => $antrian->user->gender ?? 'L',
                ]
            );
            $balita_id = $balita->id;
        }

        // Buat record pemeriksaan awal (terhubung langsung ke antrian)
        $pemeriksaan = Pemeriksaan::create([
            'antrian_id'     => $antrian->id,
            'user_id'        => $antrian->user_id,
            'balita_id'      => $balita_id,
            'jadwal_id'      => $antrian->jadwal_id,
            'berat_badan'    => $request->berat_badan,
            'tinggi_badan'   => $request->tinggi_badan,
            'lingkar_kepala' => $request->lingkar_kepala,
            'lingkar_perut'  => $request->lingkar_perut,
            'lila'           => $request->lila,
            'tensi'          => $request->tensi,
            'gula_darah'     => $request->gula_darah,
            'skrining_tbc'   => $request->skrining_tbc,
            'skrining_lansia'=> $request->skrining_lansia,
            'skrining_ptm'   => $request->skrining_ptm,
        ]);

        // Update antrian menjadi tunggu_bidan (pindah ke Meja 4)
        $antrian->update(['status' => 'tunggu_bidan']);

        return response()->json([
            'success' => true,
            'message' => 'Pengukuran ILP berhasil disimpan. Lanjut ke Meja 4 (Bidan).',
            'data' => $pemeriksaan
        ]);
    }
}
