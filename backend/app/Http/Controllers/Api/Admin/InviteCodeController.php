<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class InviteCodeController extends Controller
{
    public function index()
    {
        return response()->json([
            'nakes_code' => env('NAKES_INVITE_CODE', 'NAKES2025'),
            'kader_code' => env('KADER_INVITE_CODE', 'KADER2025'),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'nakes_code' => 'sometimes|string|min:4|max:30',
            'kader_code' => 'sometimes|string|min:4|max:30',
        ]);

        $envPath = base_path('.env');
        $env = file_get_contents($envPath);

        if ($request->has('nakes_code')) {
            $newCode = strtoupper($request->nakes_code);
            $env = preg_replace('/^NAKES_INVITE_CODE=.*/m', "NAKES_INVITE_CODE={$newCode}", $env);
        }

        if ($request->has('kader_code')) {
            $newCode = strtoupper($request->kader_code);
            $env = preg_replace('/^KADER_INVITE_CODE=.*/m', "KADER_INVITE_CODE={$newCode}", $env);
        }

        file_put_contents($envPath, $env);
        Artisan::call('config:clear');

        return response()->json([
            'message' => 'Kode undangan berhasil diperbarui.',
        ]);
    }
}
