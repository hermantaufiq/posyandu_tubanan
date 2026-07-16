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
            'name'                  => ['required', 'string', 'max:255'],
            'nik'                   => ['required', 'string', 'size:16', 'unique:users,nik', 'regex:/^[0-9]+$/'],
            'phone'                 => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password'              => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'date_of_birth'         => ['required', 'date', 'before:today'],
            'gender'                => ['required', 'in:male,female'],
            'address'               => ['required', 'string', 'max:500'],
            'email'                 => ['nullable', 'email', 'unique:users,email'],
        ], [
            'nik.required'          => 'NIK wajib diisi.',
            'nik.size'              => 'NIK harus 16 digit.',
            'nik.unique'            => 'NIK sudah terdaftar.',
            'nik.regex'             => 'NIK hanya boleh berisi angka.',
            'phone.unique'          => 'Nomor HP sudah terdaftar.',
            'password.confirmed'    => 'Konfirmasi password tidak sesuai.',
            'password.min'          => 'Password minimal 8 karakter dengan huruf dan angka.',
            'date_of_birth.before'  => 'Tanggal lahir tidak valid.',
            'email.unique'          => 'Email sudah terdaftar.',
        ]);

        // 1. Validasi Master Data Kependudukan
        $penduduk = \App\Models\Penduduk::where('nik', $request->nik)->first();
        
        if (!$penduduk) {
            return response()->json([
                'message' => 'Validasi Kependudukan Gagal',
                'errors' => [
                    'nik' => ['NIK Anda belum terdata sebagai warga Desa Tubanan. Silakan lapor ke Balai Desa atau RT setempat.']
                ]
            ], 422);
        }

        // 2. Buat Akun User
        $user = User::create([
            'name'          => $penduduk->name, // Ambil nama asli dari Dukcapil/Desa
            'nik'           => $request->nik,
            'phone'         => $request->phone,
            'email'         => $request->email,
            'password'      => $request->password,
            'date_of_birth' => $request->date_of_birth,
            'gender'        => $request->gender,
            'address'       => $request->address,
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
