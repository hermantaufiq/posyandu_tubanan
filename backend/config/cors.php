<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*', 'Authorization', 'Content-Type', 'Accept', 'X-Requested-With', 'ngrok-skip-browser-warning', 'Bypass-Tunnel-Reminder'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
