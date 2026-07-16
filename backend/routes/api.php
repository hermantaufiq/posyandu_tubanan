<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\AiChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Posyandu Desa Tubanan
|--------------------------------------------------------------------------
*/

// ── Public Routes (no auth required) ────────────────────────────────
Route::prefix('auth')->group(function () {
    // Credentials login (email / NIK / phone)
    Route::post('/login', [AuthController::class, 'login']);

    // Self-registration (Masyarakat only)
    Route::post('/register', [RegisterController::class, 'register']);

    // Google OAuth
    Route::get('/google', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
});

// ── AI Chat (Si Posya) — auth optional, public for demo ──────────────
Route::post('/ai/chat', [AiChatController::class, 'chat']);

// ── Protected Routes (Sanctum token required) ────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Profile completion (for Google OAuth users)
    Route::prefix('profile')->group(function () {
        Route::post('/complete', [ProfileController::class, 'complete']);
    });
});
