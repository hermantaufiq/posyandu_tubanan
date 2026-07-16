<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Complete profile after Google OAuth login (fill NIK, etc.)
     * POST /api/profile/complete
     */
    public function complete(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'nik'           => ['required', 'string', 'size:16', Rule::unique('users')->ignore($user->id), 'regex:/^[0-9]+$/'],
            'phone'         => ['required', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender'        => ['required', 'in:male,female'],
            'address'       => ['required', 'string', 'max:500'],
        ], [
            'nik.size'   => 'NIK harus 16 digit.',
            'nik.unique' => 'NIK sudah terdaftar oleh pengguna lain.',
            'nik.regex'  => 'NIK hanya boleh berisi angka.',
        ]);

        $user->update([
            'nik'                   => $request->nik,
            'phone'                 => $request->phone,
            'date_of_birth'         => $request->date_of_birth,
            'gender'                => $request->gender,
            'address'               => $request->address,
            'needs_nik_completion'  => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil dilengkapi.',
            'data'    => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'nik'           => $user->nik,
                'phone'         => $user->phone,
                'gender'        => $user->gender,
                'date_of_birth' => $user->date_of_birth,
                'address'       => $user->address,
                'avatar'        => $user->avatar,
                'role'          => $user->getRoleNames()->first() ?? 'masyarakat',
                'needs_nik_completion' => false,
            ],
        ]);
    }
}
