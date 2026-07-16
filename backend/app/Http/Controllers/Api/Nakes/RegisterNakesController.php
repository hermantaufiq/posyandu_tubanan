<?php

namespace App\Http\Controllers\Api\Nakes;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class RegisterNakesController extends Controller
{
    /**
     * Register Tenaga Kesehatan dengan Kode Undangan.
     * Kode undangan disimpan di .env sebagai NAKES_INVITE_CODE.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8|confirmed',
            'invite_code'   => 'required|string',
            'jabatan'       => 'nullable|string', // e.g. Bidan Desa, Perawat, Dokter
        ]);

        // Verifikasi kode undangan
        $validCode = env('NAKES_INVITE_CODE', 'NAKES2025');
        if ($request->invite_code !== $validCode) {
            return response()->json([
                'message' => 'Kode undangan tidak valid. Hubungi Kepala Posyandu Anda.',
                'errors'  => ['invite_code' => ['Kode undangan tidak valid.']]
            ], 422);
        }

        // Buat akun Nakes
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'is_active' => true,
        ]);

        // Assign role nakes
        $user->assignRole('nakes');

        // Auto-login: buat token
        $token = $user->createToken('auth-token', ['nakes'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Akun Tenaga Kesehatan berhasil dibuat.',
            'data' => [
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => 'nakes',
                    'roles' => ['nakes'],
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }
}
