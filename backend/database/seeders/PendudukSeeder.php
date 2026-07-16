<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Penduduk;

class PendudukSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'nik' => '3320123456780001',
                'no_kk' => '3320123456781111',
                'name' => 'Budi Santoso',
                'date_of_birth' => '1990-05-15',
                'gender' => 'male',
                'address' => 'Jl. Tubanan Indah No. 1',
                'rt' => '01',
                'rw' => '02',
                'dusun' => 'Tubanan Krajan',
            ],
            [
                'nik' => '3320123456780002',
                'no_kk' => '3320123456781111',
                'name' => 'Siti Aminah',
                'date_of_birth' => '1992-08-20',
                'gender' => 'female',
                'address' => 'Jl. Tubanan Indah No. 1',
                'rt' => '01',
                'rw' => '02',
                'dusun' => 'Tubanan Krajan',
            ],
            [
                'nik' => '3320123456780003',
                'no_kk' => '3320123456782222',
                'name' => 'Ahmad Junaidi',
                'date_of_birth' => '1985-11-10',
                'gender' => 'male',
                'address' => 'Desa Tubanan Tengah',
                'rt' => '03',
                'rw' => '01',
                'dusun' => 'Tubanan Tengah',
            ],
            [
                'nik' => '3320123456780004',
                'no_kk' => '3320123456783333',
                'name' => 'Herman Taufiq', // the user's name
                'date_of_birth' => '1995-02-28',
                'gender' => 'male',
                'address' => 'Desa Tubanan Lor',
                'rt' => '02',
                'rw' => '04',
                'dusun' => 'Tubanan Lor',
            ],
            [
                'nik' => '3320123456780005',
                'no_kk' => '3320123456784444',
                'name' => 'Dewi Lestari',
                'date_of_birth' => '1998-12-05',
                'gender' => 'female',
                'address' => 'Desa Tubanan Selatan',
                'rt' => '05',
                'rw' => '02',
                'dusun' => 'Tubanan Selatan',
            ],
        ];

        foreach ($data as $penduduk) {
            Penduduk::create($penduduk);
        }
    }
}
