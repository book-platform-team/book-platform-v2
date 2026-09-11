<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
  'allowed_origins' => [
    'https://book-platform-v2.onrender.com',
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];