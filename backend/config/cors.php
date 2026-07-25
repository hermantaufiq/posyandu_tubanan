<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:5179',
        'http://localhost:5180',
        'http://localhost:5181',
        // Akses dari HP via jaringan lokal
        'http://192.168.18.22:5173',
        'http://192.168.18.22:5174',
        'http://192.168.18.22:5175',
        'http://192.168.18.22:5176',
        'http://192.168.18.22:5177',
        'http://192.168.18.22:5178',
        'http://192.168.18.22:5179',
        'http://192.168.18.22:5180',
        'http://192.168.18.22:5181',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
