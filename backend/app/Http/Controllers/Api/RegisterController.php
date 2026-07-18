<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Register a new Masyarakat user.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'kategori_warga'        => ['required', 'in:sasaran,pengunjung'],
            'name'                  => ['required', 'string', 'max:255'],
            'nik'                   => ['required_if:kategori_warga,sasaran', 'nullable', 'string', 'size:16', 'unique:users,nik', 'regex:/^[0-9]+$/'],
            'phone'                 => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password'              => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'date_of_birth'         => ['required', 'date', 'before:today'],
            'gender'                => ['required', 'in:male,female'],
            'address'               => ['required', 'string', 'max:500'],
            'email'                 => ['nullable', 'email', 'unique:users,email'],
            'alamat_asal'           => ['required_if:kategori_warga,pengunjung', 'nullable', 'string', 'max:500'],
        ], [
            'nik.required_if'       => 'NIK wajib diisi untuk warga asli.',
            'nik.size'              => 'NIK harus 16 digit.',
            'nik.unique'            => 'NIK sudah terdaftar.',
            'nik.regex'             => 'NIK hanya boleh berisi angka.',
            'phone.unique'          => 'Nomor HP sudah terdaftar.',
            'password.confirmed'    => 'Konfirmasi password tidak sesuai.',
            'password.min'          => 'Password minimal 8 karakter dengan huruf dan angka.',
            'date_of_birth.before'  => 'Tanggal lahir tidak valid.',
            'email.unique'          => 'Email sudah terdaftar.',
            'alamat_asal.required_if' => 'Asal kota/desa wajib diisi untuk pengunjung.',
        ]);

        $nameToSave = $request->name;

        // 1. Validasi Master Data Kependudukan (Hanya untuk Sasaran)
        if ($request->kategori_warga === 'sasaran') {
            $penduduk = \App\Models\Penduduk::where('nik', $request->nik)->first();
            
            if (!$penduduk) {
                return response()->json([
                    'message' => 'Validasi Kependudukan Gagal',
                    'errors' => [
                        'nik' => ['NIK Anda belum terdata sebagai warga Desa Tubanan. Silakan lapor ke Balai Desa atau mendaftar sebagai Pengunjung.']
                    ]
                ], 422);
            }
            $nameToSave = $penduduk->name; // Ambil nama asli dari Dukcapil/Desa
        }

        // 2. Buat Akun User
        $user = User::create([
            'kategori_warga'=> $request->kategori_warga,
            'name'          => $nameToSave,
            'nik'           => $request->nik,
            'phone'         => $request->phone,
            'email'         => $request->email,
            'password'      => $request->password,
            'date_of_birth' => $request->date_of_birth,
            'gender'        => $request->gender,
            'address'       => $request->address,
            'alamat_asal'   => $request->alamat_asal,
            'is_active'     => true,
        ]);

        $user->assignRole('masyarakat');

        $token = $user->createToken('auth-token', ['masyarakat'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil! Selamat datang di Portal Posyandu Desa Tubanan.',
            'data'    => [
                'user'       => [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'email'         => $user->email,
                    'nik'           => $user->nik,
                    'phone'         => $user->phone,
                    'gender'        => $user->gender,
                    'date_of_birth' => $user->date_of_birth,
                    'address'       => $user->address,
                    'role'          => 'masyarakat',
                ],
                'token'      => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }
}
