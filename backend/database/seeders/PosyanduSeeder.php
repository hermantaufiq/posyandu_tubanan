<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PosyanduSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posyandus = [
            ['name' => 'Posyandu Mekar Sari', 'location' => 'Madrasah Miftahul Huda', 'rt' => '06', 'rw' => '01', 'dusun' => '-'],
            ['name' => 'Posyandu Timbul Jaya', 'location' => 'Gedung Posyandu Timbul Jaya', 'rt' => '05', 'rw' => '02', 'dusun' => '-'],
            ['name' => 'Posyandu Sido Jaya', 'location' => 'Rumah Bu Yunivita', 'rt' => '03', 'rw' => '03', 'dusun' => '-'],
            ['name' => 'Posyandu Sido Asih', 'location' => 'Balai Desa Tubanan', 'rt' => '04', 'rw' => '04', 'dusun' => '-'],
            ['name' => 'Posyandu Sido Makmur', 'location' => 'Rumah Bu Sumainah', 'rt' => '03', 'rw' => '05', 'dusun' => '-'],
            ['name' => 'Posyandu Sido Mulyo', 'location' => 'Gedung Serbaguna', 'rt' => '04', 'rw' => '06', 'dusun' => '-'],
            ['name' => 'Posyandu Punjul Rejo', 'location' => 'Rumah Bapak Zudi', 'rt' => '04', 'rw' => '07', 'dusun' => '-'],
        ];

        foreach ($posyandus as $data) {
            \App\Models\Posyandu::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
