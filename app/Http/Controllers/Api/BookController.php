<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\BookFile;
use Illuminate\Support\Facades\Log;

class BookController extends Controller
{
    /**
     * عرض جميع الكتب (مع التصفية)
     */
    public function index(Request $request)
    {
        $query = Book::where('status', 'published')
                    ->with(['author', 'files'])
                    ->latest();

        // تصفية حسب اللغة
        if ($request->has('language')) {
            $query->where('language', $request->language);
        }

        // البحث
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $books = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $books
        ]);
    }

    /**
     * تفاصيل كتاب معين
     */
    public function show($id)
    {
        $book = Book::with(['author', 'files'])
                    ->findOrFail($id);

        // زيادة عدد المشاهدات
        $book->increment('views');

        return response()->json([
            'success' => true,
            'data' => $book
        ]);
    }

    /**
     * رفع كتاب جديد (للمؤلفين فقط)
     */
    public function store(Request $request)
    {
        try {
            // ✅ التحقق: هل المستخدم مسجل الدخول؟
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'يجب تسجيل الدخول لرفع كتاب'
                ], 401);
            }

            // التحقق من البيانات
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'cover_image' => 'nullable|image|max:2048', // 2MB
                'files.*' => 'required|file|mimes:pdf,epub|max:10240', // 10MB
            ]);

            // رفع صورة الغلاف
            $cover = null;
            if ($request->hasFile('cover_image')) {
                $cover = $request->file('cover_image')->store('books/covers', 'public');
            }

            // ✅ إنشاء الكتاب (باستخدام $request->user()->id)
            $book = Book::create([
                'author_id' => $user->id, // ✅ الآن صحيح 100%
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'cover_image' => $cover,
                'status' => 'draft', // بانتظار الموافقة
                'language' => 'ar', // افتراضي
            ]);

            // رفع الملفات
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('books/files', 'public');
                    
                    $book->files()->create([
                        'format' => $file->getClientOriginalExtension(),
                        'file_path' => $path,
                        'size_kb' => round($file->getSize() / 1024),
                    ]);
                }
            }

            Log::info('📚 تم رفع كتاب جديد', [
                'book_id' => $book->id,
                'title' => $book->title,
                'author_id' => $book->author_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم رفع الكتاب بنجاح. بانتظار الموافقة.',
                'data' => $book->load('files')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // خطأ في التحقق من البيانات
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // خطأ عام
            Log::error('❌ خطأ في رفع الكتاب', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء رفع الكتاب',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تنزيل ملف كتاب
     */
    public function download($bookId, $fileId)
    {
        try {
            $file = BookFile::where('book_id', $bookId)
                            ->where('id', $fileId)
                            ->firstOrFail();

            // زيادة عدد التنزيلات
            $file->increment('downloads');
            $file->book->increment('downloads');

            // إرجاع الملف للتنزيل
            $filePath = storage_path('app/public/' . $file->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'الملف غير موجود'
                ], 404);
            }

            return response()->download(
                $filePath,
                $file->book->title . '.' . $file->format
            );

        } catch (\Exception $e) {
            Log::error('❌ خطأ في تنزيل الكتاب', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تنزيل الكتاب'
            ], 500);
        }
    }
}