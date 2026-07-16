<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class KaderSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'kader@posyandu.id'],
            [
                'name' => 'Kader Desa Tubanan',
                'password' => bcrypt('password123'),
                'nik' => '9876543210987654',
                'phone' => '081298765432',
                'is_active' => true,
            ]
        );
        $user->assignRole('kader');
    }
}
