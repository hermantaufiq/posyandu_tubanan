<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Penduduk;
use Illuminate\Support\Facades\Hash;

$nik = '3320123456780004';
$email = 'hermantaufiq12@gmail.com';
$password = Hash::make('herman12');

$penduduk = Penduduk::where('nik', $nik)->first();

if (!$penduduk) {
    echo "Master data penduduk not found.\n";
    exit;
}

$user = User::where('email', $email)->first();

if (!$user) {
    $user = User::create([
        'name' => $penduduk->name,
        'nik' => $nik,
        'email' => $email,
        'password' => $password,
        'phone' => '081234567899', // Dummy phone
        'date_of_birth' => $penduduk->date_of_birth,
        'gender' => $penduduk->gender,
        'address' => $penduduk->address,
        'is_active' => true,
    ]);
    $user->assignRole('masyarakat');
    echo "Akun Herman berhasil DIBUAT ULANG!\n";
} else {
    $user->update(['password' => $password]);
    echo "Akun Herman SUDAH ADA, password direset ke herman12.\n";
}

