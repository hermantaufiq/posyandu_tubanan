<?php

namespace App\Http\Controllers\Api\Kader;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class RegisterKaderController extends Controller
{
    /**
     * Register Kader Posyandu dengan Kode Undangan.
     * Kode undangan disimpan di .env sebagai KADER_INVITE_CODE.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:8|confirmed',
            'invite_code'   => 'required|string',
        ]);

        // Verifikasi kode undangan
        $validCode = env('KADER_INVITE_CODE', 'KADER2025');
        if (strtoupper($request->invite_code) !== $validCode) {
            return response()->json([
                'message' => 'Kode undangan tidak valid. Hubungi Kepala Posyandu Anda.',
                'errors'  => ['invite_code' => ['Kode undangan tidak valid.']]
            ], 422);
        }

        // Buat akun Kader
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'is_active' => true,
        ]);

        // Assign role kader
        $user->assignRole('kader');

        // Auto-login: buat token
        $token = $user->createToken('auth-token', ['kader'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Akun Kader Posyandu berhasil dibuat.',
            'data' => [
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => 'kader',
                    'roles' => ['kader'],
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }
}
