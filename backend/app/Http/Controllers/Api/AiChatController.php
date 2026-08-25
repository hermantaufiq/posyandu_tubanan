<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Jadwal;
use App\Models\Antrian;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AiChatController extends Controller
{
    private string $systemPrompt = <<<EOT
Kamu adalah "Si Posya", asisten kesehatan digital Posyandu Desa Tubanan, Kecamatan Jaken, Kabupaten Pati, Jawa Tengah.
Kamu bertugas membantu warga desa mendapatkan informasi kesehatan dan memfasilitasi layanan posyandu.

Kepribadianmu:
- Ramah, sabar, dan seperti seorang bidan yang peduli
- Menggunakan bahasa Indonesia yang sederhana dan tidak terlalu formal
- Sesekali menggunakan sapaan hangat seperti "Ibu", "Bapak", atau "Bunda"

Kemampuan utamamu saat ini:
1. Menjawab pertanyaan seputar kesehatan balita, MPASI, KMS, imunisasi, dan stunting.
2. Mengecek jadwal posyandu → panggil fungsi `cek_jadwal`.
3. Mengambil antrian posyandu → panggil fungsi `ambil_antrian`.
4. Menginput laporan kesehatan mandiri warga → panggil fungsi `input_laporan_mandiri`.
5. Merekomendasikan video edukasi kesehatan → panggil fungsi `rekomendasi_video`.

PANDUAN MENGAMBIL ANTRIAN:
- Tanyakan jenis layanan jika belum jelas (anak prasekolah, ibu hamil, lansia, dll).
- Panggil `ambil_antrian` dengan parameter `jenis_layanan`.

PANDUAN CEK JADWAL:
- Jika warga bertanya kapan posyandu, panggil `cek_jadwal`.

PANDUAN LAPORAN MANDIRI:
- Jika warga ingin melaporkan data kesehatan mandiri (berat badan, tinggi badan, tensi, gula darah, dll), tanyakan data yang dibutuhkan satu per satu.
- Data MINIMAL yang harus ada: berat_badan atau tinggi_badan (minimal salah satu).
- Setelah data terkumpul, panggil fungsi `input_laporan_mandiri` dengan data yang diberikan.
- Informasikan hasilnya kepada warga termasuk status IMT/gizi jika bisa dihitung.
- Jika warga tidak tahu nilainya, boleh skip (isi null).

PANDUAN VIDEO EDUKASI:
- Jika warga meminta video, tutorial, atau edukasi terkait topik kesehatan, panggil fungsi `rekomendasi_video` dengan topik yang relevan.
- Topik yang tersedia: 'stunting', 'mpasi', 'imunisasi', 'kms', 'asi', 'gizi_ibu_hamil', 'hipertensi', 'diabetes', 'tbc', 'posyandu_umum'.
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

        // 1. Build initial contents
        $contents = [];
        
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $this->systemPrompt . "\n\nMulai percakapan sekarang."]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => 'Halo! Saya Si Posya, asisten kesehatan digital Posyandu Desa Tubanan. Ada yang bisa saya bantu seputar kesehatan keluarga Bunda/Ibu/Bapak? 😊']]
        ];

        if ($request->history) {
            foreach ($request->history as $msg) {
                // Ensure correct roles. 'user' and 'model'.
                $role = $msg['role'] === 'user' ? 'user' : 'model';
                $contents[] = [
                    'role' => $role,
                    'parts' => [['text' => $msg['content']]]
                ];
            }
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $request->message]]
        ];

        // Define Tools
        $tools = [
            [
                'functionDeclarations' => [
                    [
                        'name' => 'cek_jadwal',
                        'description' => 'Mengecek jadwal pelaksanaan posyandu yang akan datang (terdekat).',
                    ],
                    [
                        'name' => 'ambil_antrian',
                        'description' => 'Mengambil nomor antrian untuk warga pada jadwal posyandu terdekat.',
                        'parameters' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'jenis_layanan' => [
                                    'type' => 'STRING',
                                    'description' => "Jenis layanan: 'Anak Prasekolah (0-70 bulan)', 'Ibu Hamil', 'Ibu Nifas dan Menyusui', 'Anak Sekolah dan Remaja', 'Usia Produktif', 'Lansia'"
                                ]
                            ],
                            'required' => ['jenis_layanan']
                        ]
                    ],
                    [
                        'name' => 'input_laporan_mandiri',
                        'description' => 'Menginput laporan kesehatan mandiri warga ke dalam sistem. Gunakan saat warga menyebutkan data kesehatan mereka seperti berat badan, tinggi badan, tekanan darah, gula darah, dll.',
                        'parameters' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'berat_badan'   => ['type' => 'NUMBER', 'description' => 'Berat badan dalam kg, contoh: 65'],
                                'tinggi_badan'  => ['type' => 'NUMBER', 'description' => 'Tinggi badan dalam cm, contoh: 165'],
                                'lingkar_perut' => ['type' => 'NUMBER', 'description' => 'Lingkar perut dalam cm'],
                                'lila'          => ['type' => 'NUMBER', 'description' => 'Lingkar lengan atas dalam cm (terutama untuk ibu hamil)'],
                                'tensi'         => ['type' => 'STRING', 'description' => 'Tekanan darah, contoh: 120/80'],
                                'gula_darah'    => ['type' => 'NUMBER', 'description' => 'Kadar gula darah dalam mg/dL'],
                                'catatan'       => ['type' => 'STRING', 'description' => 'Catatan tambahan atau keluhan dari warga'],
                            ],
                        ]
                    ],
                    [
                        'name' => 'rekomendasi_video',
                        'description' => 'Memberikan rekomendasi link video edukasi kesehatan kepada warga.',
                        'parameters' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'topik' => [
                                    'type' => 'STRING',
                                    'description' => "Topik video: 'stunting', 'mpasi', 'imunisasi', 'kms', 'asi', 'gizi_ibu_hamil', 'hipertensi', 'diabetes', 'tbc', 'posyandu_umum'"
                                ]
                            ],
                            'required' => ['topik']
                        ]
                    ],
                ]
            ]
        ];

        try {
            // First API Call
            $response = $this->callGemini($apiKey, $contents, $tools);
            
            // Check if Model wants to call a tool
            $parts = $response['candidates'][0]['content']['parts'] ?? [];
            $functionCall = null;
            
            foreach ($parts as $part) {
                if (isset($part['functionCall'])) {
                    $functionCall = $part['functionCall'];
                    break;
                }
            }

            if ($functionCall) {
                // Execute local function
                $functionName = $functionCall['name'];
                $args = $functionCall['args'] ?? [];
                
                $functionResult = [];
                if ($functionName === 'cek_jadwal') {
                    $functionResult = $this->handleCekJadwal();
                } elseif ($functionName === 'ambil_antrian') {
                    $functionResult = $this->handleAmbilAntrian($request, $args);
                } elseif ($functionName === 'input_laporan_mandiri') {
                    $functionResult = $this->handleInputLaporanMandiri($request, $args);
                } elseif ($functionName === 'rekomendasi_video') {
                    $functionResult = $this->handleRekomendasiVideo($args);
                } else {
                    $functionResult = ['error' => 'Fungsi tidak ditemukan.'];
                }

                // Add model's functionCall to history (preserve exact parts)
                $contents[] = [
                    'role' => 'model',
                    'parts' => $parts
                ];

                // Add function response to history
                $contents[] = [
                    'role' => 'user',
                    'parts' => [
                        [
                            'functionResponse' => [
                                'name' => $functionName,
                                'response' => [
                                    'name' => $functionName,
                                    'content' => $functionResult
                                ]
                            ]
                        ]
                    ]
                ];

                // Second API Call (to get final natural language text)
                $finalResponse = $this->callGemini($apiKey, $contents, $tools);
                $reply = $finalResponse['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, ada kendala sistem 😊';
                
                return response()->json(['reply' => $reply]);
            }

            // No function call, just normal text reply
            $reply = $response['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, Si Posya sedang tidak bisa menjawab. Coba lagi ya Bunda 😊';
            return response()->json(['reply' => $reply]);

        } catch (\Exception $e) {
            Log::error('Gemini API Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'reply' => 'Maaf, Si Posya sedang mengalami gangguan teknis. Silakan coba beberapa saat lagi. 🙏'
            ]);
        }
    }

    private function callGemini($apiKey, $contents, $tools)
    {
        $response = Http::timeout(30)
            ->withoutVerifying()
            ->withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
                [
                    'contents' => $contents,
                    'tools' => $tools,
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 512,
                    ]
                ]
            );

        if ($response->failed()) {
            throw new \Exception('Gemini API returned error: ' . $response->body());
        }

        return $response->json();
    }

    private function handleCekJadwal()
    {
        $jadwal = Jadwal::where('tanggal', '>=', Carbon::today())
            ->orderBy('tanggal', 'asc')
            ->first();

        if (!$jadwal) {
            return ['status' => 'Tidak ada jadwal terdekat yang ditemukan.'];
        }

        return [
            'status' => 'Jadwal ditemukan',
            'tanggal' => Carbon::parse($jadwal->tanggal)->format('d F Y'),
            'waktu' => substr($jadwal->waktu_mulai, 0, 5) . ' - ' . substr($jadwal->waktu_selesai, 0, 5),
            'kegiatan' => $jadwal->kegiatan,
            'lokasi' => $jadwal->posyandu ? $jadwal->posyandu->nama : 'Posyandu Desa Tubanan'
        ];
    }

    private function handleAmbilAntrian(Request $request, $args)
    {
        // Require auth user! Since API is accessed via Bearer token
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return ['error' => 'Gagal mengambil antrian. Pengguna belum login. Harap beri tahu pengguna untuk login terlebih dahulu.'];
        }

        $jenisLayanan = $args['jenis_layanan'] ?? 'Anak Prasekolah (0-70 bulan)';
        
        // Find nearest schedule
        $jadwal = Jadwal::where('tanggal', '>=', Carbon::today())
            ->orderBy('tanggal', 'asc')
            ->first();

        if (!$jadwal) {
            return ['error' => 'Tidak ada jadwal posyandu aktif untuk hari ini atau waktu dekat.'];
        }

        // Check if user already has queue for this schedule
        $existing = Antrian::where('jadwal_id', $jadwal->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return [
                'status' => 'Sudah memiliki antrian',
                'nomor_antrian' => $existing->nomor_antrian,
                'jenis_layanan' => $existing->jenis_layanan,
                'pesan' => 'Anda sudah terdaftar di antrian ini.'
            ];
        }

        // Determine prefix based on jenis_layanan
        $prefix = 'A'; // Anak/Balita
        $k = strtolower($jenisLayanan);
        if (str_contains($k, 'hamil')) $prefix = 'B';
        elseif (str_contains($k, 'nifas')) $prefix = 'C';
        elseif (str_contains($k, 'remaja')) $prefix = 'D';
        elseif (str_contains($k, 'produktif')) $prefix = 'E';
        elseif (str_contains($k, 'lansia')) $prefix = 'F';

        $lastAntrian = Antrian::where('jadwal_id', $jadwal->id)
            ->where('nomor_antrian', 'like', $prefix . '-%')
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastAntrian) {
            $parts = explode('-', $lastAntrian->nomor_antrian);
            if (count($parts) > 1) {
                $nextNumber = intval($parts[1]) + 1;
            }
        }

        $nomorAntrian = $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        $antrian = Antrian::create([
            'jadwal_id' => $jadwal->id,
            'user_id' => $user->id,
            'nomor_antrian' => $nomorAntrian,
            'status' => 'menunggu',
            'waktu_daftar' => now(),
            'jenis_layanan' => $jenisLayanan,
            'sumber' => 'online',
        ]);

        return [
            'status' => 'Berhasil membuat antrian',
            'nomor_antrian' => $nomorAntrian,
            'jenis_layanan' => $jenisLayanan,
            'tanggal_jadwal' => Carbon::parse($jadwal->tanggal)->format('d F Y')
        ];
    }

    private function handleInputLaporanMandiri(Request $request, $args)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return ['error' => 'Gagal menyimpan laporan. Pengguna belum login.'];
        }

        $beratBadan   = $args['berat_badan']   ?? null;
        $tinggiBadan  = $args['tinggi_badan']  ?? null;
        $lingkarPerut = $args['lingkar_perut'] ?? null;
        $lila         = $args['lila']          ?? null;
        $tensi        = $args['tensi']         ?? null;
        $gulaDarah    = $args['gula_darah']    ?? null;
        $catatan      = $args['catatan']       ?? '';

        if (!$beratBadan && !$tinggiBadan) {
            return ['error' => 'Data tidak cukup. Minimal berat badan atau tinggi badan harus diisi.'];
        }

        $jadwal = Jadwal::latest()->first();

        // Hitung IMT jika ada BB & TB
        $imt = null;
        $statusGizi = null;
        if ($beratBadan && $tinggiBadan && $tinggiBadan > 0) {
            $tbM = $tinggiBadan / 100;
            $imt = round($beratBadan / ($tbM * $tbM), 1);
            if ($imt < 18.5)      $statusGizi = 'Kurus';
            elseif ($imt < 25)    $statusGizi = 'Normal';
            elseif ($imt < 27)    $statusGizi = 'Overweight';
            else                  $statusGizi = 'Obesitas';
        }

        $catatanAkhir = trim('[Laporan Mandiri Warga] ' . $catatan);

        $pemeriksaan = \App\Models\Pemeriksaan::create([
            'user_id'       => $user->id,
            'jadwal_id'     => $jadwal?->id,
            'berat_badan'   => $beratBadan,
            'tinggi_badan'  => $tinggiBadan,
            'lingkar_perut' => $lingkarPerut,
            'lila'          => $lila,
            'tensi'         => $tensi,
            'gula_darah'    => $gulaDarah,
            'status_gizi'   => $statusGizi,
            'catatan'       => $catatanAkhir,
            'skrining_tbc'  => [false, false, false, false],
        ]);

        $result = [
            'status'      => 'Berhasil disimpan',
            'pesan'       => 'Laporan kesehatan mandiri berhasil dicatat dalam sistem.',
            'data_input'  => array_filter([
                'berat_badan'   => $beratBadan ? "{$beratBadan} kg" : null,
                'tinggi_badan'  => $tinggiBadan ? "{$tinggiBadan} cm" : null,
                'tensi'         => $tensi,
                'gula_darah'    => $gulaDarah ? "{$gulaDarah} mg/dL" : null,
            ]),
        ];

        if ($imt !== null) {
            $result['imt']        = $imt;
            $result['status_gizi'] = $statusGizi;
        }

        return $result;
    }

    private function handleRekomendasiVideo($args)
    {
        $topik = strtolower($args['topik'] ?? 'posyandu_umum');

        $videos = [
            'stunting' => [
                ['judul' => 'Apa itu Stunting? Penyebab dan Cara Pencegahannya', 'url' => 'https://www.youtube.com/watch?v=1hnYLu1fHJc', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Cara Mencegah Stunting pada Anak', 'url' => 'https://www.youtube.com/watch?v=gPnqTd3tWHc', 'sumber' => 'UNICEF Indonesia'],
                ['judul' => 'Stunting: Deteksi Dini & Penanganan', 'url' => 'https://www.youtube.com/watch?v=9VMmMXN-18g', 'sumber' => 'BKKBN'],
            ],
            'mpasi' => [
                ['judul' => 'Panduan MPASI Bayi 6 Bulan yang Benar', 'url' => 'https://www.youtube.com/watch?v=xnD5K14BNFE', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Resep MPASI Bergizi untuk Bayi', 'url' => 'https://www.youtube.com/watch?v=vJHOPpOaiFg', 'sumber' => 'IDAI'],
                ['judul' => 'MPASI Pertama: Apa yang Harus Disiapkan?', 'url' => 'https://www.youtube.com/watch?v=W5Yk3qbRbZc', 'sumber' => 'dr. Spesialis Anak'],
            ],
            'imunisasi' => [
                ['judul' => 'Jadwal Imunisasi Lengkap Bayi & Anak', 'url' => 'https://www.youtube.com/watch?v=uP0hJK8SLOE', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Pentingnya Imunisasi untuk Anak', 'url' => 'https://www.youtube.com/watch?v=Fz9DV2c6dKg', 'sumber' => 'IDAI'],
            ],
            'kms' => [
                ['judul' => 'Cara Membaca Kartu Menuju Sehat (KMS)', 'url' => 'https://www.youtube.com/watch?v=2gHE0cBTnD0', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Memahami Grafik Pertumbuhan Anak di KMS', 'url' => 'https://www.youtube.com/watch?v=KDkN9UEd4gI', 'sumber' => 'Posyandu Digital'],
            ],
            'asi' => [
                ['judul' => 'Cara Menyusui yang Benar untuk Ibu Baru', 'url' => 'https://www.youtube.com/watch?v=K7x1OEi6K8s', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Tips ASI Eksklusif 6 Bulan', 'url' => 'https://www.youtube.com/watch?v=uRx-4Y0dLRk', 'sumber' => 'IDAI'],
            ],
            'gizi_ibu_hamil' => [
                ['judul' => 'Nutrisi Penting untuk Ibu Hamil', 'url' => 'https://www.youtube.com/watch?v=StVjlOqFHpE', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Makanan yang Harus Dikonsumsi Ibu Hamil', 'url' => 'https://www.youtube.com/watch?v=8r9d_rrOPB0', 'sumber' => 'dr. Boyke'],
            ],
            'hipertensi' => [
                ['judul' => 'Cara Mengontrol Tekanan Darah Tinggi', 'url' => 'https://www.youtube.com/watch?v=kLpLhKdaRlc', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Diet untuk Penderita Hipertensi', 'url' => 'https://www.youtube.com/watch?v=Xn9_Vqm5oI8', 'sumber' => 'PERKI'],
            ],
            'diabetes' => [
                ['judul' => 'Mengenal Diabetes dan Cara Mencegahnya', 'url' => 'https://www.youtube.com/watch?v=8VIVObVYFJo', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Pola Makan Sehat untuk Penderita Diabetes', 'url' => 'https://www.youtube.com/watch?v=gXlE-dXfvbs', 'sumber' => 'PERKENI'],
            ],
            'tbc' => [
                ['judul' => 'Gejala dan Cara Pencegahan TBC', 'url' => 'https://www.youtube.com/watch?v=JwKRMH6R4kU', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'TBC Bisa Sembuh! Pentingnya Patuh Minum Obat', 'url' => 'https://www.youtube.com/watch?v=VRqj9tKH_VM', 'sumber' => 'Stop TB'],
            ],
            'posyandu_umum' => [
                ['judul' => 'Apa itu Posyandu dan Manfaatnya?', 'url' => 'https://www.youtube.com/watch?v=h-fv88AMKSU', 'sumber' => 'Kemenkes RI'],
                ['judul' => 'Layanan 6 Standar Posyandu Prima', 'url' => 'https://www.youtube.com/watch?v=lJkT0hgW2iM', 'sumber' => 'Kemenkes RI'],
            ],
        ];

        $daftarVideo = $videos[$topik] ?? $videos['posyandu_umum'];

        return [
            'status'  => 'Berhasil mendapatkan rekomendasi video',
            'topik'   => $topik,
            'videos'  => $daftarVideo,
            'catatan' => 'Sampaikan judul dan link video kepada warga dengan format yang mudah dibaca.',
        ];
    }
}

