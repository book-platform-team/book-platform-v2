<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
  public function download(string $bookId, int $fileId)
{
    $book = Book::where(function ($q) use ($bookId) {
        $q->where('slug', $bookId);
        if (ctype_digit($bookId)) {
            $q->orWhere('id', (int) $bookId);
        }
    })->first();

    if (! $book) {
        return response()->json(['success' => false, 'message' => 'الكتاب غير موجود'], 404);
    }

    $file = $book->files()->find($fileId);

    if (! $file) {
        return response()->json(['success' => false, 'message' => 'الملف غير موجود'], 404);
    }

    if ($book->price_digital) {
        return response()->json(['success' => false, 'message' => 'هذه النسخة مدفوعة، تواصل مع البائع'], 403);
    }

    $book->increment('downloads_count');

    return Storage::disk('local')->download($file->path, $book->slug.'.'.$file->type);
}



    public function index(Request $request)
    {
        $query = Book::query();

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(fn ($w) => $w->where('title', 'ILIKE', "%{$q}%")
                ->orWhere('description', 'ILIKE', "%{$q}%"));
        }

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->whereIn('category_id', $category->allChildIds());
            }
        }

        if ($request->filled('author')) {
            $query->whereHas('author', fn ($w) => $w->where('slug', $request->author));
        }

        if ($request->filled('type')) {
            $query->where('publication_type', $request->type);
        }

        match ($request->get('sort', 'latest')) {
            'title' => $query->orderBy('title'),
            'trending' => $query->orderByDesc('views_count'),
            default => $query->orderByDesc('published_at'),
        };

        $perPage = min((int) $request->get('per_page', $request->get('limit', 24)), 48);
        $books = $query->with(['author', 'category'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $books->getCollection()->map(fn ($b) => $this->bookCard($b)),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    public function show(string $slug)
{
    $book = Book::where(function ($q) use ($slug) {
        $q->where('slug', $slug);
        if (ctype_digit($slug)) {
            $q->orWhere('id', (int) $slug);
        }
    })
        ->with(['author', 'category', 'files'])
        ->first();

    if (! $book) {
        return response()->json(['success' => false, 'message' => 'الكتاب غير موجود'], 404);
    }

    $data = array_merge($this->bookCard($book), [
        'subtitle' => null,
        'description' => $book->description,
        'language' => $book->language,
        'pages' => $book->pages,
        'publication_year' => $book->publication_year,
        'edition' => $book->edition,
        'isbn' => $book->isbn,
        'published_at' => $book->published_at,
        'downloads_count' => $book->downloads_count,
        'views_count' => $book->views_count,
        'price_digital' => $book->price_digital,
        'price_print' => $book->price_print,
        'price_2' => $book->price_2,
        'price_3' => $book->price_3,
        'price_4' => $book->price_4,
        'sale_email' => $book->sale_email_verified ? $book->sale_email : null,
        'files' => $book->files->map(fn ($f) => [
            'id' => $f->id,
            'type' => $f->type,
            'size' => $f->size,
            'size_human' => $f->size_human,
        ]),
    ]);

    return response()->json(['success' => true, 'data' => $data]);
}

    private function bookCard(Book $book): array
    {
        return [
            'id' => $book->id,
            'slug' => $book->slug,
            'title' => $book->title,
            'cover' => $book->cover,
            'author' => [
                'id' => $book->author->id,
                'name' => $book->author->name,
                'slug' => $book->author->slug,
            ],
            'category' => [
                'id' => $book->category->id,
                'name' => $book->category->name,
                'slug' => $book->category->slug,
            ],
            'publication_type' => $book->publication_type,
            'is_paid' => $book->is_paid,
            'price' => $book->price,
            'price_print' => $book->price_print,
            'price_digital' => $book->price_digital,
        ];
    }
   
}
