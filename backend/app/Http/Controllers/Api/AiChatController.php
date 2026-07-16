<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiChatController extends Controller
{
    /**
     * System prompt yang mengatur perilaku Si Posya sebagai Bidan Digital.
     */
    private string $systemPrompt = <<<EOT
Kamu adalah "Si Posya", asisten kesehatan digital Posyandu Desa Tubanan, Kecamatan Jaken, Kabupaten Pati, Jawa Tengah.
Kamu bertugas membantu warga desa mendapatkan informasi kesehatan yang akurat dan mudah dipahami.

Kepribadianmu:
- Ramah, sabar, dan seperti seorang bidan yang peduli
- Menggunakan bahasa Indonesia yang sederhana dan tidak terlalu formal
- Sesekali menggunakan sapaan hangat seperti "Ibu", "Bapak", atau "Bunda"
- Memberikan jawaban yang ringkas namun lengkap

Kamu HANYA boleh menjawab pertanyaan seputar:
- Kesehatan balita (0-5 tahun): tumbuh kembang, berat badan, tinggi badan
- Interpretasi data KMS (Kartu Menuju Sehat)
- Panduan MPASI (Makanan Pendamping ASI) untuk bayi 6+ bulan
- Jadwal imunisasi dan vitamin (Polio, BCG, DPT, Vitamin A, Obat Cacing, dll)
- Pencegahan dan deteksi stunting
- Gizi ibu hamil dan menyusui
- Jadwal dan informasi kegiatan Posyandu Desa Tubanan
- Pertolongan pertama untuk gejala umum pada anak (demam, diare ringan, batuk, dll)
- Informasi seputar Posyandu dan program kesehatan Desa Tubanan

Jika ada pertanyaan di luar topik di atas (misalnya politik, teknologi umum, dll), tolak dengan sopan:
"Maaf Bunda/Ibu/Bapak, Si Posya hanya bisa membantu seputar kesehatan keluarga dan informasi Posyandu Desa Tubanan. Untuk pertanyaan lain, Bunda bisa hubungi Bidan Desa ya 😊"

Penting: Selalu ingatkan bahwa untuk kondisi darurat atau serius, warga harus segera menghubungi Bidan Desa atau fasilitas kesehatan terdekat.
EOT;

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'history' => 'nullable|array',
        ]);

        $apiKey = config('services.gemini.api_key');

        if (empty($apiKey) || $apiKey === 'your-gemini-api-key-here') {
            return response()->json([
                'reply' => 'Maaf, Si Posya sedang dalam masa konfigurasi. Silakan hubungi Bidan Desa untuk konsultasi. 😊',
            ]);
        }

        // Build conversation history for context
        $contents = [];

        // Add system prompt as first turn
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $this->systemPrompt . "\n\nMulai percakapan sekarang."]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => 'Halo! Saya Si Posya, asisten kesehatan digital Posyandu Desa Tubanan. Ada yang bisa saya bantu seputar kesehatan keluarga Bunda/Ibu/Bapak? 😊']]
        ];

        // Add conversation history
        if ($request->history) {
            foreach ($request->history as $msg) {
                $contents[] = [
                    'role' => $msg['role'] === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $msg['content']]]
                ];
            }
        }

        // Add current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $request->message]]
        ];

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
                    [
                        'contents' => $contents,
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'maxOutputTokens' => 512,
                        ],
                        'safetySettings' => [
                            ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                            ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'],
                        ]
                    ]
                );

            if ($response->failed()) {
                throw new \Exception('Gemini API returned error: ' . $response->status());
            }

            $data = $response->json();
            $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, Si Posya sedang tidak bisa menjawab. Coba lagi ya Bunda 😊';

            return response()->json(['reply' => $reply]);

        } catch (\Exception $e) {
            \Log::error('Gemini API Error: ' . $e->getMessage());
            return response()->json([
                'reply' => 'Maaf, Si Posya sedang mengalami gangguan teknis. Silakan coba beberapa saat lagi atau hubungi Bidan Desa langsung. 🙏'
            ]);
        }
    }
}
