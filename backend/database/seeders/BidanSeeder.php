<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BidanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'bidan@posyandu.id'],
            [
                'name' => 'Bidan Desa Tubanan',
                'password' => bcrypt('password123'),
                'nik' => '2222222222222222',
                'phone' => '082222222222',
                'is_active' => true,
            ]
        );
        if (!$user->hasRole('nakes')) {
            $user->assignRole('nakes');
        }
    }
}
