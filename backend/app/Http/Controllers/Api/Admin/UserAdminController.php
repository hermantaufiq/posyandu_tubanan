<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role', null);

        $query = User::with('roles')->latest();
        if ($role) {
            $query->role($role);
        }

        $users = $query->get()->map(fn($u) => [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'nik'        => $u->nik,
            'phone'      => $u->phone,
            'is_active'  => $u->is_active,
            'roles'      => $u->getRoleNames(),
            'created_at' => $u->created_at->format('d M Y'),
        ]);

        return response()->json(['data' => $users]);
    }

    public function toggle($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json([
            'message'   => 'Status pengguna diperbarui.',
            'is_active' => $user->is_active,
        ]);
    }

    public function show($id)
    {
        $user = User::with(['roles', 'antrians.jadwal.posyandu'])->findOrFail($id);
        return response()->json(['data' => $user]);
    }
}
