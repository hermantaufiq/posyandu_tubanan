<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Posyandu;
use App\Models\User;
use Illuminate\Http\Request;

class PosyanduAdminController extends Controller
{
    public function index()
    {
        $posyandus = Posyandu::withCount(['jadwals', 'pemeriksaans'])->get()->map(function ($pos) {
            $kaderCount = User::where('posyandu_id', $pos->id)->role('kader')->count();
            $wargaCount = User::where('posyandu_id', $pos->id)->role('masyarakat')->count();
            return array_merge($pos->toArray(), [
                'kaders_count' => $kaderCount,
                'warga_count'  => $wargaCount,
            ]);
        });

        return response()->json(['data' => $posyandus]);
    }

    public function show($id)
    {
        $posyandu = Posyandu::with(['jadwals' => function($q) {
            $q->orderBy('tanggal', 'desc')->withCount('pemeriksaans');
        }])->findOrFail($id);

        // Get kaders registered at this pos
        $kaders = User::where('posyandu_id', $id)
            ->role('kader')
            ->get()
            ->map(fn($u) => [
                'id'    => $u->id,
                'name'  => $u->name,
                'phone' => $u->phone,
                'email' => $u->email,
            ]);

        $wargaCount = User::where('posyandu_id', $id)->role('masyarakat')->count();

        return response()->json([
            'data' => array_merge($posyandu->toArray(), [
                'kaders'      => $kaders,
                'warga_count' => $wargaCount,
            ])
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'location'   => 'required|string|max:255',
            'rt'         => 'nullable|string|max:5',
            'rw'         => 'nullable|string|max:5',
            'ketua_name' => 'nullable|string|max:255',
            'no_hp_ketua'=> 'nullable|string|max:20',
            'deskripsi'  => 'nullable|string',
        ]);
        $posyandu = Posyandu::create($data);
        return response()->json(['message' => 'Posyandu berhasil ditambahkan.', 'data' => $posyandu], 201);
    }

    public function update(Request $request, $id)
    {
        $posyandu = Posyandu::findOrFail($id);
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'location'   => 'required|string|max:255',
            'rt'         => 'nullable|string|max:5',
            'rw'         => 'nullable|string|max:5',
            'ketua_name' => 'nullable|string|max:255',
            'no_hp_ketua'=> 'nullable|string|max:20',
            'deskripsi'  => 'nullable|string',
        ]);
        $posyandu->update($data);
        return response()->json(['message' => 'Posyandu berhasil diupdate.', 'data' => $posyandu]);
    }

    public function destroy($id)
    {
        Posyandu::findOrFail($id)->delete();
        return response()->json(['message' => 'Posyandu berhasil dihapus.']);
    }
}
