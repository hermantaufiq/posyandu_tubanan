<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BalitaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = \App\Models\User::where('email', 'hermantaufiq12@gmail.com')->first();
        $userId = $user ? $user->id : null;

        \App\Models\Balita::create([
            'user_id' => $userId,
            'nik' => '3320123456780099',
            'nama' => 'Ananda Budi',
            'tanggal_lahir' => date('Y-m-d', strtotime('-2 years -4 months')),
            'jenis_kelamin' => 'L',
            'nama_ayah' => 'Herman Taufiq',
            'nama_ibu' => 'Siti Aminah',
        ]);
    }
}
