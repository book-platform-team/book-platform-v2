<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $query = Author::query();

        if ($request->filled('q')) {
            $query->where('name', 'ILIKE', "%{$request->q}%");
        }

        $perPage = min((int) $request->get('per_page', 24), 48);
        $authors = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $authors->getCollection()->map(fn ($a) => $this->authorCard($a)),
            'meta' => [
                'current_page' => $authors->currentPage(),
                'last_page' => $authors->lastPage(),
                'per_page' => $authors->perPage(),
                'total' => $authors->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $author = Author::where(function ($q) use ($slug) {
            $q->where('slug', $slug);
            if (ctype_digit($slug)) {
                $q->orWhere('id', (int) $slug);
            }
        })->with(['books' => fn ($q) => $q->with(['author', 'category'])])->first();

        if (! $author) {
            return response()->json(['success' => false, 'message' => 'المؤلف غير موجود'], 404);
        }

        $data = array_merge($this->authorCard($author), [
            'bio' => $author->bio,
            'books' => $author->books->map(fn ($b) => [
                'id' => $b->id,
                'slug' => $b->slug,
                'title' => $b->title,
                'cover' => $b->cover,
                'author' => ['id' => $author->id, 'name' => $author->name, 'slug' => $author->slug],
                'category' => ['id' => $b->category->id, 'name' => $b->category->name, 'slug' => $b->category->slug],
                'publication_type' => $b->publication_type,
                'is_paid' => $b->is_paid,
                'price' => $b->price,
                'price_print' => $b->price_print,
                'price_digital' => $b->price_digital,
            ]),
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 🔒 لا email/phone/address/extra — القسم ٢+٤ من العقد
    private function authorCard(Author $author): array
    {
        return [
            'id' => $author->id,
            'name' => $author->name,
            'slug' => $author->slug,
            'photo' => $author->photo,
            'title' => $author->title,
            'books_count' => $author->books()->count(),
        ];
    }
}
