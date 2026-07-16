<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JadwalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Jadwal::create([
            'posyandu_id' => 1,
            'tanggal' => date('Y-m-d', strtotime('next wednesday')),
            'kegiatan' => 'Penimbangan Balita & Ibu Hamil',
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '11:00:00',
        ]);

        \App\Models\Jadwal::create([
            'posyandu_id' => 2,
            'tanggal' => date('Y-m-d', strtotime('+2 weeks monday')),
            'kegiatan' => 'Penimbangan Balita & Lansia',
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '11:00:00',
        ]);
    }
}
