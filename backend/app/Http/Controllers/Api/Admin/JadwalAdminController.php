<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Posyandu;
use Illuminate\Http\Request;

class JadwalAdminController extends Controller
{
    public function index()
    {
        $jadwals = Jadwal::with('posyandu')
            ->orderByDesc('tanggal')
            ->get()
            ->map(fn($j) => [
                'id'           => $j->id,
                'tanggal'      => $j->tanggal,
                'waktu_mulai'  => $j->waktu_mulai,
                'waktu_selesai'=> $j->waktu_selesai,
                'kegiatan'     => $j->kegiatan,
                'kapasitas'    => $j->kapasitas,
                'posyandu'     => $j->posyandu,
                'antrian_count'=> $j->antrians()->count(),
            ]);

        return response()->json(['data' => $jadwals]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'posyandu_id'  => 'required|exists:posyandus,id',
            'tanggal'      => 'required|date',
            'waktu_mulai'  => 'required',
            'waktu_selesai'=> 'required',
            'kegiatan'     => 'required|string|max:255',
            'kapasitas'    => 'nullable|integer|min:1',
        ]);

        $jadwal = Jadwal::create($data);
        return response()->json(['message' => 'Jadwal berhasil dibuat.', 'data' => $jadwal->load('posyandu')], 201);
    }

    public function update(Request $request, $id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $data = $request->validate([
            'posyandu_id'  => 'required|exists:posyandus,id',
            'tanggal'      => 'required|date',
            'waktu_mulai'  => 'required',
            'waktu_selesai'=> 'required',
            'kegiatan'     => 'required|string|max:255',
            'kapasitas'    => 'nullable|integer|min:1',
        ]);

        $jadwal->update($data);
        return response()->json(['message' => 'Jadwal berhasil diupdate.', 'data' => $jadwal->load('posyandu')]);
    }

    public function destroy($id)
    {
        Jadwal::findOrFail($id)->delete();
        return response()->json(['message' => 'Jadwal berhasil dihapus.']);
    }
}
