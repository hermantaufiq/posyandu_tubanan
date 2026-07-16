<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to Google OAuth page.
     * GET /api/auth/google
     */
    public function redirectToGoogle()
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    /**
     * Handle Google OAuth callback.
     * GET /api/auth/google/callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
            return redirect($frontendUrl . '/login?error=google_failed');
        }

        // Find or create user
        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        $needsNik = false;

        if (! $user) {
            // Brand new user via Google — auto-register as masyarakat
            $user = User::create([
                'name'                 => $googleUser->getName(),
                'email'                => $googleUser->getEmail(),
                'google_id'            => $googleUser->getId(),
                'avatar'               => $googleUser->getAvatar(),
                'password'             => Hash::make(Str::random(32)), // random, user won't use it
                'is_active'            => true,
                'needs_nik_completion' => true, // Must complete profile
            ]);
            $user->assignRole('masyarakat');
            $needsNik = true;
        } else {
            // Existing user — update google_id and avatar if not set
            $user->update([
                'google_id' => $user->google_id ?? $googleUser->getId(),
                'avatar'    => $user->avatar ?? $googleUser->getAvatar(),
            ]);
            $needsNik = $user->needs_nik_completion;
        }

        if (! $user->is_active) {
            $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
            return redirect($frontendUrl . '/login?error=account_inactive');
        }

        // Revoke all old tokens
        $user->tokens()->delete();

        $role  = $user->getRoleNames()->first() ?? 'masyarakat';
        $token = $user->createToken('auth-token', [$role])->plainTextToken;

        // Redirect to frontend with token in URL fragment (hash-based, not exposed in server logs)
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
        $redirectUrl = $needsNik
            ? $frontendUrl . '/complete-profile#token=' . $token . '&needs_nik=true'
            : $frontendUrl . '/auth/callback#token=' . $token . '&role=' . $role;

        return redirect($redirectUrl);
    }
}
