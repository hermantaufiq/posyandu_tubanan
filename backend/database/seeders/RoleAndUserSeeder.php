<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $roles = ['admin', 'nakes', 'kader', 'masyarakat'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@posyandu-tubanan.id'],
            [
                'name'     => 'Admin Posyandu Tubanan',
                'nik'      => '3312010101010001',
                'phone'    => '081234567890',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin');

        // Tenaga Kesehatan (Bidan)
        $nakes = User::firstOrCreate(
            ['email' => 'bidan@posyandu-tubanan.id'],
            [
                'name'     => 'Bidan Sari Dewi',
                'nik'      => '3312010101010002',
                'phone'    => '081234567891',
                'password' => Hash::make('password123'),
                'gender'   => 'female',
                'is_active' => true,
            ]
        );
        $nakes->assignRole('nakes');

        // Kader Posyandu
        $kader = User::firstOrCreate(
            ['email' => 'kader@posyandu-tubanan.id'],
            [
                'name'     => 'Ibu Kader Sumiati',
                'nik'      => '3312010101010003',
                'phone'    => '081234567892',
                'password' => Hash::make('password123'),
                'gender'   => 'female',
                'is_active' => true,
            ]
        );
        $kader->assignRole('kader');

        // Masyarakat
        $warga = User::firstOrCreate(
            ['email' => 'warga@posyandu-tubanan.id'],
            [
                'name'          => 'Budi Santoso',
                'nik'           => '3312010101010004',
                'phone'         => '081234567893',
                'password'      => Hash::make('password123'),
                'gender'        => 'male',
                'date_of_birth' => '1990-05-15',
                'address'       => 'Dusun Tubanan RT 01 RW 02, Desa Tubanan',
                'is_active'     => true,
            ]
        );
        $warga->assignRole('masyarakat');

        $this->command->info('Roles and demo users seeded successfully!');
        $this->command->info('');
        $this->command->info('Demo Credentials:');
        $this->command->info('  Admin   : admin@posyandu-tubanan.id / password123');
        $this->command->info('  Nakes   : bidan@posyandu-tubanan.id / password123');
        $this->command->info('  Kader   : kader@posyandu-tubanan.id / password123');
        $this->command->info('  Warga   : warga@posyandu-tubanan.id / password123');
    }
}
