<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = config('services.gemini.api_key');
echo "API Key is: " . $apiKey . "\n";

$response = Illuminate\Support\Facades\Http::timeout(30)
    ->withoutVerifying()
    ->withHeaders([
        'x-goog-api-key' => $apiKey,
        'Content-Type' => 'application/json',
    ])
    ->post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [['text' => 'Halo tes']]
                ]
            ]
        ]
    );

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";
