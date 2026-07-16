<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Posyandu;
use Illuminate\Http\Request;

class PosyanduAdminController extends Controller
{
    public function index()
    {
        $posyandus = Posyandu::withCount('jadwals')->get();
        return response()->json(['data' => $posyandus]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'location' => 'required|string|max:255',
        ]);
        $posyandu = Posyandu::create($data);
        return response()->json(['message' => 'Posyandu berhasil ditambahkan.', 'data' => $posyandu], 201);
    }

    public function update(Request $request, $id)
    {
        $posyandu = Posyandu::findOrFail($id);
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'location' => 'required|string|max:255',
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
