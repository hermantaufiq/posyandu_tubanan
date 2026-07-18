<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PemeriksaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $balita = \App\Models\Balita::first();
        if ($balita) {
            // Pemeriksaan Balita
            \App\Models\Pemeriksaan::create([
                'balita_id' => $balita->id,
                'user_id' => $balita->user_id,
                'jadwal_id' => 1,
                'berat_badan' => 12.0,
                'tinggi_badan' => 88.5,
                'lingkar_kepala' => 48.0,
                'status_gizi' => 'Gizi Baik',
                'created_at' => now()->subMonth(),
                'updated_at' => now()->subMonth(),
            ]);
            
            \App\Models\Pemeriksaan::create([
                'balita_id' => $balita->id,
                'user_id' => $balita->user_id,
                'jadwal_id' => 1,
                'berat_badan' => 12.5,
                'tinggi_badan' => 89.0,
                'lingkar_kepala' => 48.5,
                'imunisasi' => 'Campak Rubella',
                'vitamin' => 'Vitamin A Biru',
                'status_gizi' => 'Gizi Baik',
            ]);
        }

        // Pemeriksaan ILP Lansia / Dewasa (contoh: user pertama yang bukan anak-anak)
        $user = \App\Models\User::where('name', 'like', '%ilham%')->first() ?? \App\Models\User::first();
        if ($user) {
            // Skrining PTM & TBC
            \App\Models\Pemeriksaan::create([
                'user_id' => $user->id,
                'jadwal_id' => 1,
                'berat_badan' => 65.5,
                'tinggi_badan' => 165.0,
                'lingkar_perut' => 85.0,
                'tensi' => '130/85',
                'gula_darah' => 110,
                'skrining_tbc' => [false, false, false, false],
                'skrining_lansia' => [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // Total 20 (Mandiri)
                'catatan' => 'Kondisi sehat, tekanan darah sedikit tinggi, disarankan kurangi garam.',
                'created_at' => now()->subMonths(2),
                'updated_at' => now()->subMonths(2),
            ]);

            // Skrining TBC Positif gejala
            \App\Models\Pemeriksaan::create([
                'user_id' => $user->id,
                'jadwal_id' => 1,
                'berat_badan' => 63.0,
                'tinggi_badan' => 165.0,
                'tensi' => '120/80',
                'skrining_tbc' => [true, false, false, true], // Batuk & BB turun
                'catatan' => 'Ditemukan 2 gejala TBC. Dirujuk ke Puskesmas untuk tes dahak.',
                'dirujuk' => true,
                'alasan_rujukan' => 'Suspek TBC',
                'created_at' => now()->subMonths(1),
                'updated_at' => now()->subMonths(1),
            ]);
        }
    }
}
