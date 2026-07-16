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
        if (!$balita) return;

        // Pemeriksaan bulan lalu
        \App\Models\Pemeriksaan::create([
            'balita_id' => $balita->id,
            'jadwal_id' => 1,
            'berat_badan' => 12.0,
            'tinggi_badan' => 88.5,
            'lingkar_kepala' => 48.0,
            'status_gizi' => 'Gizi Baik',
            'created_at' => now()->subMonth(),
            'updated_at' => now()->subMonth(),
        ]);

        // Pemeriksaan bulan ini
        \App\Models\Pemeriksaan::create([
            'balita_id' => $balita->id,
            'jadwal_id' => 1,
            'berat_badan' => 12.5,
            'tinggi_badan' => 89.0,
            'lingkar_kepala' => 48.5,
            'status_gizi' => 'Gizi Baik',
        ]);
    }
}
