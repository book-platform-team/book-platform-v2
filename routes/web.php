<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    $path = public_path(request()->path() === '/' ? 'index.html' : request()->path());

    if (file_exists($path) && ! is_dir($path)) {
        return response()->file($path);
    }

    return response()->file(public_path('index.html'));
})->where('any', '^(?!api|admin|storage|sanctum).*$');