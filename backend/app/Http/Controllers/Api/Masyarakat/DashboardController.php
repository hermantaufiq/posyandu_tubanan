<?php

namespace App\Http\Controllers\Api\Masyarakat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $jadwal_terdekat = \App\Models\Jadwal::with('posyandu')
            ->where('tanggal', '>=', date('Y-m-d'))
            ->orderBy('tanggal', 'asc')
            ->first();

        $balita = \App\Models\Balita::where('user_id', $user->id)->first();
        $pemeriksaan_terakhir = null;
        
        if ($balita) {
            $pemeriksaan_terakhir = \App\Models\Pemeriksaan::where('balita_id', $balita->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $target = $balita;
        } else {
            $pemeriksaan_terakhir = \App\Models\Pemeriksaan::where('user_id', $user->id)
                ->whereNull('balita_id')
                ->orderBy('created_at', 'desc')
                ->first();
                
            $target = [
                'nama' => $user->name,
                'tanggal_lahir' => $user->date_of_birth ?? now()->subYears(30)->toDateString(),
                'jenis_kelamin' => $user->gender == 'female' ? 'P' : 'L'
            ];
        }

        return response()->json([
            'jadwal_terdekat' => $jadwal_terdekat,
            'balita' => $target,
            'pemeriksaan_terakhir' => $pemeriksaan_terakhir
        ]);
    }
}
