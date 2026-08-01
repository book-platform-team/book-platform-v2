<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\BookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes العامة (لا تحتاج توثيق)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/books', [BookController::class, 'index']);                    // عرض جميع الكتب
Route::get('/books/{id}', [BookController::class, 'show']);                // تفاصيل كتاب
Route::get('/books/{bookId}/download/{fileId}', [BookController::class, 'download']); // تنزيل كتاب

// Routes محمية (تتطلب توكن)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/books', [BookController::class, 'store']);               // رفع كتاب جديد
});