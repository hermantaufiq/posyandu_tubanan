<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Healthcheck for Railway
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\Nakes\RegisterNakesController;

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

// ── Nakes Register (dengan Kode Undangan) ────────────────────────────
Route::post('/nakes/register', [RegisterNakesController::class, 'register']);

// ── Public Posyandus List ────────────────────────────────
Route::get('/public/posyandus', [\App\Http\Controllers\Api\Kader\RegisterKaderController::class, 'posyandus']);

// ── Kader Register ────────────────────────────
Route::post('/kader/register', [\App\Http\Controllers\Api\Kader\RegisterKaderController::class, 'register']);

// ── AI Chat (Si Posya) — auth optional, public for demo ──────────────
Route::post('/ai/chat', [AiChatController::class, 'chat']);

// ── Protected Routes (Sanctum token required) ────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // AI Assistant for Kader & Admin
    Route::post('/ai/assistant', [\App\Http\Controllers\Api\AiAssistantController::class, 'assistant']);

    // Portal Masyarakat Routes
    Route::prefix('masyarakat')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\Masyarakat\DashboardController::class, 'index']);
        Route::get('/kms', [\App\Http\Controllers\Api\Masyarakat\KmsController::class, 'index']);
        Route::get('/riwayat', [\App\Http\Controllers\Api\Masyarakat\RiwayatController::class, 'index']);
        Route::post('/skrining-mandiri', [\App\Http\Controllers\Api\Masyarakat\RiwayatController::class, 'skriningMandiri']);
        Route::post('/lapor-mandiri', [\App\Http\Controllers\Api\Masyarakat\RiwayatController::class, 'laporMandiri']);
        Route::get('/jadwal', [\App\Http\Controllers\Api\Masyarakat\JadwalController::class, 'index']);
        
        Route::get('/antrian', [\App\Http\Controllers\Api\Masyarakat\AntrianController::class, 'index']);
        Route::post('/antrian', [\App\Http\Controllers\Api\Masyarakat\AntrianController::class, 'store']);
        Route::delete('/antrian/{id}', [\App\Http\Controllers\Api\Masyarakat\AntrianController::class, 'destroy']);

        Route::get('/pengumuman', [\App\Http\Controllers\Api\Masyarakat\PengumumanController::class, 'index']);
    });

    // Portal Nakes Routes
    Route::prefix('nakes')->group(function () {
        Route::get('/jadwal-aktif', [\App\Http\Controllers\Api\Nakes\PemeriksaanController::class, 'getJadwalAktif']);
        Route::get('/antrian', [\App\Http\Controllers\Api\Nakes\AntrianController::class, 'index']);
        Route::post('/scan-qr', [\App\Http\Controllers\Api\Nakes\AntrianController::class, 'scanQr']);
        Route::post('/input-ktp', [\App\Http\Controllers\Api\Nakes\AntrianController::class, 'inputKtp']);
        
        Route::post('/pemeriksaan', [\App\Http\Controllers\Api\Nakes\PemeriksaanController::class, 'store']);
    });

    // --- KADER ---
    Route::middleware('role:kader')->prefix('kader')->group(function () {
        Route::get('/jadwal/aktif', [\App\Http\Controllers\Api\Kader\KaderController::class, 'getJadwalAktif']);
        Route::get('/antrian', [\App\Http\Controllers\Api\Kader\KaderController::class, 'getAntrian']);
        Route::post('/antrian/hadir', [\App\Http\Controllers\Api\Kader\KaderController::class, 'tandaiHadir']);
        Route::post('/antrian/walk-in', [\App\Http\Controllers\Api\Kader\KaderController::class, 'daftarWalkIn']);
        Route::post('/pengukuran', [\App\Http\Controllers\Api\Kader\KaderController::class, 'simpanPengukuran']);
        Route::get('/warga', [\App\Http\Controllers\Api\Kader\KaderController::class, 'getWarga']);
        
        // Laporan Kader (PWS & Upload Foto)
        Route::post('/laporan/foto', [\App\Http\Controllers\Api\Kader\LaporanController::class, 'uploadFoto']);
        Route::post('/laporan/pws', [\App\Http\Controllers\Api\Kader\LaporanController::class, 'simpanPws']);
        Route::get('/laporan/riwayat', [\App\Http\Controllers\Api\Kader\LaporanController::class, 'riwayat']);
    });

    // --- ADMIN ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserAdminController::class);
        Route::apiResource('posyandus', \App\Http\Controllers\Api\Admin\PosyanduAdminController::class);
        Route::apiResource('jadwals', \App\Http\Controllers\Api\Admin\JadwalAdminController::class);
        Route::apiResource('pengumuman', \App\Http\Controllers\Api\Admin\PengumumanController::class);
        
        // Laporan Kader
        Route::get('/laporan-kader', [\App\Http\Controllers\Api\Admin\LaporanKaderController::class, 'index']);
        Route::put('/laporan-kader/foto/{id}/verifikasi', [\App\Http\Controllers\Api\Admin\LaporanKaderController::class, 'verifikasiFoto']);
        Route::put('/laporan-kader/pws/{id}/verifikasi', [\App\Http\Controllers\Api\Admin\LaporanKaderController::class, 'verifikasiPws']);
    });

    // Portal Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\AdminController::class, 'dashboard']);

        // Jadwal CRUD
        Route::get('/jadwal', [\App\Http\Controllers\Api\Admin\JadwalAdminController::class, 'index']);
        Route::post('/jadwal', [\App\Http\Controllers\Api\Admin\JadwalAdminController::class, 'store']);
        Route::put('/jadwal/{id}', [\App\Http\Controllers\Api\Admin\JadwalAdminController::class, 'update']);
        Route::delete('/jadwal/{id}', [\App\Http\Controllers\Api\Admin\JadwalAdminController::class, 'destroy']);

        // Users
        Route::get('/users', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'show']);
        Route::put('/users/{id}/toggle', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'toggle']);

        // Laporan
        Route::get('/laporan/antrian', [\App\Http\Controllers\Api\Admin\LaporanController::class, 'antrian']);
        Route::get('/laporan/pemeriksaan', [\App\Http\Controllers\Api\Admin\LaporanController::class, 'pemeriksaan']);
        Route::get('/laporan/rekap-sasaran', [\App\Http\Controllers\Api\Admin\LaporanController::class, 'rekapSasaran']);

        // Posyandu CRUD
        Route::get('/posyandu', [\App\Http\Controllers\Api\Admin\PosyanduAdminController::class, 'index']);
        Route::get('/posyandu/{id}', [\App\Http\Controllers\Api\Admin\PosyanduAdminController::class, 'show']);
        Route::post('/posyandu', [\App\Http\Controllers\Api\Admin\PosyanduAdminController::class, 'store']);
        Route::put('/posyandu/{id}', [\App\Http\Controllers\Api\Admin\PosyanduAdminController::class, 'update']);
        Route::delete('/posyandu/{id}', [\App\Http\Controllers\Api\Admin\PosyanduAdminController::class, 'destroy']);

        // Kode Undangan
        Route::get('/invite-codes', [\App\Http\Controllers\Api\Admin\InviteCodeController::class, 'index']);
        Route::put('/invite-codes', [\App\Http\Controllers\Api\Admin\InviteCodeController::class, 'update']);

        // Pengumuman
        Route::get('/pengumuman', [\App\Http\Controllers\Api\Admin\PengumumanController::class, 'index']);
        Route::post('/pengumuman', [\App\Http\Controllers\Api\Admin\PengumumanController::class, 'store']);
        Route::delete('/pengumuman/{id}', [\App\Http\Controllers\Api\Admin\PengumumanController::class, 'destroy']);
    });

    // Profile completion (for Google OAuth users)
    Route::prefix('profile')->group(function () {
        Route::post('/complete', [\App\Http\Controllers\Api\ProfileController::class, 'complete']);
    });
});

