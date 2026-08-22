<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class SubmissionController extends Controller
{
    // ⚠️ العقد: يمنع & = ? / \ < > " ' والمسافات فالبريد (تسريب معامل لرابط Gmail)
    private const EMAIL_REGEX = '/^[^\s&=?\/\\\\<>\'"]+@[^\s&=?\/\\\\<>\'"]+$/';

    public function store(Request $request)
    {
        $isAuthenticated = (bool) $request->user();

        $data = $request->validate([
            'author_name' => 'required|string|max:255',
            'author_title' => 'nullable|in:none,professor,doctor,researcher',
            'author_email' => ['required', 'email', 'regex:'.self::EMAIL_REGEX],
            'author_phone' => 'required|string|max:50',
            'author_address' => 'required|string|max:255',
            'author_bio' => 'required|string',
            'author_extra' => 'nullable|string',
            'author_photo' => 'nullable|image|max:5120',

            'password' => $isAuthenticated
                ? 'nullable'
                : ['required', 'confirmed', Password::defaults()->min(8)],

            'book_title' => 'required|string|max:255',
            'book_description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'language' => 'nullable|in:ar,fr,en',
            'pages' => 'required|integer|min:1',
            'publication_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 1),
            'legal_deposit' => 'required|string|max:255',
            'cover' => 'required|image|max:5120',
            'file' => 'nullable|mimes:pdf,epub|max:51200',

            'price_print' => 'nullable|integer|min:1',
            'price_digital' => 'nullable|integer|min:1',
            'price_2' => 'nullable|integer|min:1|required_with:price_3,price_4',
            'price_3' => 'nullable|integer|min:1',
            'price_4' => 'nullable|integer|min:1',
            'sale_email' => [
                Rule::requiredIf(fn () => $request->filled('price_print') || $request->filled('price_digital')),
                'nullable', 'email', 'regex:'.self::EMAIL_REGEX,
            ],

            'rights_confirmed' => 'required|in:1',
        ]);

        // price_2/3/4 يتطلبون price_print (القسم ٢ من العقد)
        foreach (['price_2' => 2, 'price_3' => 3, 'price_4' => 4] as $field => $count) {
            if ($request->filled($field) && ! $request->filled('price_print')) {
                throw ValidationException::withMessages([$field => "لا يمكن تحديد $field بدون price_print"]);
            }
            // تحقق: سعر الجملة أقل من (سعر الواحد × العدد)، وإلا فليس تخفيضاً
            if ($request->filled($field) && $request->filled('price_print')) {
                if ((int) $data[$field] >= (int) $data['price_print'] * $count) {
                    throw ValidationException::withMessages([
                        $field => "سعر $count نسخ يجب أن يقل عن سعر النسخة الواحدة × $count",
                    ]);
                }
            }
        }

        // البريد مسجل سلفاً؟ (ماشي المستخدم الحالي نفسه لو authenticated)
        $existingUser = User::where('email', $data['author_email'])->first();
        if ($existingUser && ! ($isAuthenticated && $request->user()->email === $data['author_email'])) {
            throw ValidationException::withMessages([
                'author_email' => 'هذا البريد له حساب — سجّل الدخول أولاً',
            ]);
        }

        return DB::transaction(function () use ($request, $data, $isAuthenticated) {
            // 1) تحديد/إنشاء المستخدم والمؤلف
            if ($isAuthenticated) {
                $user = $request->user();
                $author = $user->author;
            } else {
                $user = User::create([
                    'name' => $data['author_name'],
                    'email' => $data['author_email'],
                    'password' => Hash::make($data['password']),
                ]);

                $author = Author::create([
                    'user_id' => $user->id,
                    'name' => $data['author_name'],
                    'slug' => $this->uniqueSlug($data['author_name']),
                    'title' => $data['author_title'] ?? 'none',
                    'bio' => $data['author_bio'],
                    'phone' => $data['author_phone'],
                    'address' => $data['author_address'],
                    'extra' => $data['author_extra'] ?? null,
                ]);

                if ($request->hasFile('author_photo')) {
                    $author->update([
                        'photo' => $request->file('author_photo')->store('authors', 'public'),
                    ]);
                }
            }

            // 2) رفع الغلاف (إجباري) + الملف (اختياري)
            $coverPath = $request->file('cover')->store('covers', 'public');
            $filePath = $request->hasFile('file') ? $request->file('file')->store('submissions', 'local') : null;

            // 3) حفظ الـsubmission كاملة (للأرشيف ومراجعة Filament)
            $submission = Submission::create([
                'author_name' => $data['author_name'],
                'author_title' => $data['author_title'] ?? 'none',
                'author_email' => $data['author_email'],
                'author_phone' => $data['author_phone'],
                'author_address' => $data['author_address'],
                'author_bio' => $data['author_bio'],
                'author_extra' => $data['author_extra'] ?? null,
                'author_photo' => $author->photo ?? null,
                'book_title' => $data['book_title'],
                'book_description' => $data['book_description'],
                'category_id' => $data['category_id'],
                'language' => $data['language'] ?? 'ar',
                'pages' => $data['pages'],
                'publication_year' => $data['publication_year'] ?? null,
                'legal_deposit' => $data['legal_deposit'],
                'cover' => $coverPath,
                'file' => $filePath,
                'price_print' => $data['price_print'] ?? null,
                'price_digital' => $data['price_digital'] ?? null,
                'price_2' => $data['price_2'] ?? null,
                'price_3' => $data['price_3'] ?? null,
                'price_4' => $data['price_4'] ?? null,
                'sale_email' => $data['sale_email'] ?? null,
                'user_id' => $user->id,
                'status' => 'pending',
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // 4) الكتاب دائماً pending — بلا موافقة، ينتظر Filament (القسم ٥+٩)
            $book = Book::withoutGlobalScope(\App\Models\Scopes\ApprovedScope::class)->create([
                'author_id' => $author->id,
                'category_id' => $data['category_id'],
                'title' => $data['book_title'],
                'slug' => $this->uniqueBookSlug($data['book_title']),
                'description' => $data['book_description'],
                'cover' => $coverPath,
                'language' => $data['language'] ?? 'ar',
                'pages' => $data['pages'],
                'publication_year' => $data['publication_year'] ?? null,
                'legal_deposit' => $data['legal_deposit'],
                'publication_type' => 'author_submission',
                'price_print' => $data['price_print'] ?? null,
                'price_digital' => $data['price_digital'] ?? null,
                'price_2' => $data['price_2'] ?? null,
                'price_3' => $data['price_3'] ?? null,
                'price_4' => $data['price_4'] ?? null,
                'sale_email' => $data['sale_email'] ?? null,
                'status' => 'pending',
            ]);

            if ($filePath) {
                $book->files()->create([
                    'type' => pathinfo($filePath, PATHINFO_EXTENSION),
                    'path' => $filePath,
                    'size' => $request->file('file')->getSize(),
                ]);
            }

            $submission->update(['book_id' => $book->id]);

            // 5) مؤلف جديد → افتح الجلسة فورا (القسم ٥ من العقد)
            if (! $isAuthenticated) {
                Auth::login($user);
                $request->session()->regenerate();
            }

            return response()->json([
                'success' => true,
                'data' => ['user' => $this->userPayload($user)],
                'message' => 'وصل طلبك',
            ], 201);
        });
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Author::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }
        return $slug;
    }

    private function uniqueBookSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (Book::withoutGlobalScope(\App\Models\Scopes\ApprovedScope::class)->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }
        return $slug;
    }

    private function userPayload(User $user): array
    {
        $author = $user->author;
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'title' => $author->title ?? 'none',
            'phone' => $author->phone ?? null,
            'address' => $author->address ?? null,
            'bio' => $author->bio ?? null,
            'extra' => $author->extra ?? '',
            'photo' => $author->photo ?? null,
            'slug' => $author->slug ?? null,
            'books_count' => $author ? $author->books()->count() : 0,
        ];
    }
}