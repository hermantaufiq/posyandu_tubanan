<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login'    => ['required', 'string'],  // email or NIK or phone
            'password' => ['required', 'string'],
        ]);

        // Find user by email, NIK, or phone
        $user = User::where('email', $request->login)
            ->orWhere('nik', $request->login)
            ->orWhere('phone', $request->login)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Kredensial yang diberikan tidak sesuai dengan data kami.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'login' => ['Akun Anda telah dinonaktifkan. Silakan hubungi administrator.'],
            ]);
        }

        // Revoke all existing tokens
        $user->tokens()->delete();

        // Get user role
        $role = $user->getRoleNames()->first() ?? 'masyarakat';

        // Create new token with role abilities
        $token = $user->createToken('auth-token', [$role])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data'    => [
                'user'  => [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'email'         => $user->email,
                    'nik'           => $user->nik,
                    'phone'         => $user->phone,
                    'gender'        => $user->gender,
                    'avatar'        => $user->avatar,
                    'date_of_birth' => $user->date_of_birth,
                    'address'       => $user->address,
                    'role'          => $role,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Get authenticated user profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->getRoleNames()->first() ?? 'masyarakat';

        return response()->json([
            'success' => true,
            'data'    => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'nik'           => $user->nik,
                'phone'         => $user->phone,
                'gender'        => $user->gender,
                'avatar'        => $user->avatar,
                'date_of_birth' => $user->date_of_birth,
                'address'       => $user->address,
                'role'          => $role,
            ],
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }
}
