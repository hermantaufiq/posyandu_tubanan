<?php

namespace App\Http\Controllers\Api\Masyarakat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    public function index()
    {
        $jadwals = \App\Models\Jadwal::with('posyandu')
            ->orderBy('tanggal', 'asc')
            ->get();
            
        return response()->json([
            'data' => $jadwals
        ]);
    }
}
