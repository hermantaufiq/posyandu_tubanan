<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan role admin ada
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $user = User::firstOrCreate(
            ['email' => 'admin@posyandu.id'],
            [
                'name'      => 'Admin Posyandu',
                'password'  => bcrypt('password123'),
                'nik'       => '3515090101900001',
                'phone'     => '081200000001',
                'is_active' => true,
            ]
        );
        $user->assignRole('admin');
    }
}
