<?php

use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

// ✅ routes جوجل داخل مجموعة 'web' middleware (مهم جداً)
Route::middleware('web')->group(function () {
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
});

// route عام (في الأسفل دائماً)
Route::get('/{any}', function () {
    return response()->json(['error' => 'Page not found'], 404);
})->where('any', '.*');