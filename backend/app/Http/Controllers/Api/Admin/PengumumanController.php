<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Illuminate\Http\Request;

class PengumumanController extends Controller
{
    public function index()
    {
        $data = Pengumuman::with('user:id,name')
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'        => $p->id,
                'judul'     => $p->judul,
                'isi'       => $p->isi,
                'kategori'  => $p->kategori,
                'is_active' => $p->is_active,
                'oleh'      => $p->user?->name ?? 'Admin',
                'tanggal'   => $p->created_at->format('d M Y H:i'),
            ]);

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul'    => 'required|string|max:255',
            'isi'      => 'required|string',
            'kategori' => 'required|in:jadwal,imunisasi,kesehatan,umum',
        ]);

        $p = Pengumuman::create([
            'user_id'  => auth()->id(),
            'judul'    => $request->judul,
            'isi'      => $request->isi,
            'kategori' => $request->kategori,
        ]);

        return response()->json(['message' => 'Pengumuman berhasil dipublikasikan.', 'data' => $p], 201);
    }

    public function destroy($id)
    {
        Pengumuman::findOrFail($id)->delete();
        return response()->json(['message' => 'Pengumuman berhasil dihapus.']);
    }
}
