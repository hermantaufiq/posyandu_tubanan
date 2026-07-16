<?php

namespace App\Http\Controllers\Api\Masyarakat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class KmsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $balita = \App\Models\Balita::where('user_id', $user->id)->first();
        
        if (!$balita) {
            return response()->json(['balita' => null, 'data' => []]);
        }

        $pemeriksaans = \App\Models\Pemeriksaan::where('balita_id', $balita->id)
            ->orderBy('created_at', 'asc')
            ->get();
            
        $kmsData = $pemeriksaans->map(function($p, $index) {
            return [
                'bulan' => 'Bln ' . ($index + 1),
                'berat' => (float) $p->berat_badan,
                'tinggi' => (float) $p->tinggi_badan,
                'standar' => round(8.5 + ($index * 0.45), 1), // Approx WHO median
            ];
        });

        return response()->json([
            'balita' => $balita,
            'data' => $kmsData
        ]);
    }
}
