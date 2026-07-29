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
        
        if ($balita) {
            $pemeriksaans = \App\Models\Pemeriksaan::where('balita_id', $balita->id)
                ->orderBy('created_at', 'asc')
                ->get();
            $target = $balita;
        } else {
            // For Warga Asli without balita or Pengunjung, show their own health record
            $pemeriksaans = \App\Models\Pemeriksaan::where('user_id', $user->id)
                ->whereNull('balita_id')
                ->orderBy('created_at', 'asc')
                ->get();
            
            if ($pemeriksaans->isEmpty()) {
                 return response()->json(['balita' => null, 'data' => []]);
            }
            
            // Mock balita object using user data
            $target = [
                'nama' => $user->name,
                'tanggal_lahir' => $user->date_of_birth ?? now()->subYears(30)->toDateString(),
                'jenis_kelamin' => $user->gender == 'female' ? 'P' : 'L'
            ];
        }

        $kmsData = $pemeriksaans->map(function($p, $index) use ($balita) {
            $data = [
                'bulan' => 'Ke-' . ($index + 1),
                'berat' => (float) $p->berat_badan,
                'tinggi' => (float) $p->tinggi_badan,
            ];
            if ($balita) {
                $data['standar'] = round(8.5 + ($index * 0.45), 1);
            }
            return $data;
        });

        return response()->json([
            'balita' => $target,
            'data' => $kmsData
        ]);
    }
}
