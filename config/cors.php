<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'], // ← أضفنا sanctum/csrf-cookie

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // ← غيرنا من false لـ true (مهم جداً للتوكنات)
];