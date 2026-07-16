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
        \App\Models\Posyandu::create([
            'name' => 'Posyandu Anggrek',
            'location' => 'Balai Desa Tubanan Lor',
            'rt' => '01',
            'rw' => '02',
            'dusun' => 'Tubanan Krajan',
        ]);

        \App\Models\Posyandu::create([
            'name' => 'Posyandu Melati',
            'location' => 'Balai RT 03 RW 01 Tubanan Tengah',
            'rt' => '03',
            'rw' => '01',
            'dusun' => 'Tubanan Tengah',
        ]);
    }
}
