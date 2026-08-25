<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\SubmissionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SaleEmailController;

Route::post('/books/{bookId}/sale-email/request', [SaleEmailController::class, 'requestCode'])
    ->middleware('throttle:3,1');
Route::post('/books/{bookId}/sale-email/verify', [SaleEmailController::class, 'verifyCode'])
    ->middleware('throttle:10,1');

// عام — بلا حماية إضافية (قراءة فقط)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{slug}', [BookController::class, 'show']);
Route::get('/books/{bookId}/download/{fileId}', [BookController::class, 'download']);
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{slug}', [AuthorController::class, 'show']);

// المصادقة
Route::get('/auth/me', [AuthController::class, 'me']);

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware(['web', 'throttle:5,1']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::post('/auth/password/forgot', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:3,1');

Route::post('/auth/password/verify', [AuthController::class, 'verifyResetCode'])
    ->middleware('throttle:10,1'); // محاولات verify أكثر تساهلاً (كود يدوي، أخطاء طباعة واردة)

Route::post('/auth/password/reset', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::post('/auth/password/change', [AuthController::class, 'changePassword'])
        ->middleware('throttle:5,1');
});

// النشر والتواصل — الأكثر حساسية (spam/abuse)
Route::post('/submissions', [SubmissionController::class, 'store'])
    ->middleware(['web', 'throttle:3,60']);
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1');