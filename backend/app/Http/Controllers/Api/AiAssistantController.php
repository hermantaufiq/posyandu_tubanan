<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAssistantController extends Controller
{
    public function assistant(Request $request)
    {
        $request->validate([
            'task' => 'required|string|in:analyze_growth,generate_broadcast,kader_chat',
            'prompt' => 'nullable|string',
            'data' => 'nullable|array',
        ]);

        $task = $request->task;
        $prompt = $request->prompt ?? '';
        $data = $request->data ?? [];

        $apiKey = config('services.gemini.api_key');
        if (empty($apiKey) || $apiKey === 'your-gemini-api-key-here') {
            return response()->json([
                'status' => 'error',
                'message' => 'API Key Gemini belum dikonfigurasi. Silakan periksa file .env'
            ], 401);
        }

        $systemInstruction = "";
        $userMessage = "";

        if ($task === 'analyze_growth') {
            $systemInstruction = "Kamu adalah Bidan Ahli. Analisis data pertumbuhan anak berikut dan berikan ringkasan singkat serta rekomendasi medis. Gunakan bahasa yang profesional namun mudah dipahami Kader Posyandu.";
            $userMessage = "Data Anak: " . json_encode($data) . "\nCatatan Tambahan: " . $prompt;
        } elseif ($task === 'generate_broadcast') {
            $systemInstruction = "Kamu adalah Admin Posyandu. Buatlah draft pesan broadcast WhatsApp (pengumuman) berdasarkan topik berikut. Bahasa harus ramah, sopan, menggunakan format WhatsApp (bold dengan *, list), dan ditutup dengan salam 'Tim Posyandu Desa Tubanan'. Jangan beri penjelasan tambahan, langsung berikan output pesannya.";
            $userMessage = "Topik/Permintaan: " . $prompt . "\nData Tambahan: " . json_encode($data);
        } elseif ($task === 'kader_chat') {
            $systemInstruction = "Kamu adalah 'Si Posya', Asisten Medis khusus untuk Kader Posyandu. Berikan panduan ringkas, padat, medis, dan akurat (berdasarkan pedoman Kemenkes/IDAI) untuk pertanyaan kader. Gunakan format yang rapi.";
            $userMessage = $prompt;
        }

        $payload = [
            'systemInstruction' => [
                'role' => 'system',
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [['text' => $userMessage]]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 800,
            ]
        ];

        try {
            $response = Http::timeout(30)
                ->withoutVerifying()
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
                    $payload
                );

            if ($response->successful()) {
                $result = $response->json();
                $reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                return response()->json([
                    'status' => 'success',
                    'reply' => $reply
                ]);
            }

            Log::error('Gemini AI Assistant Error: ' . $response->body());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungi AI. Coba lagi nanti.'
            ], 500);

        } catch (\Exception $e) {
            Log::error('Gemini AI Assistant Exception: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem.'
            ], 500);
        }
    }
}
