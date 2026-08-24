<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->orderBy('name')])
            ->orderBy('is_fallback') // "أخرى" آخر واحد
            ->orderBy('name')
            ->get();

        $data = $categories->map(fn ($cat) => $this->formatCategory($cat));

        return response()->json(['success' => true, 'data' => $data]);
    }

    private function formatCategory(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'icon' => $category->icon,
            'books_count' => $this->approvedBooksCount($category),
            'is_fallback' => $category->is_fallback,
            'children' => $category->children->map(fn ($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'slug' => $child->slug,
                'books_count' => $child->books()->count(), // Global Scope يصفي approved تلقائي
            ]),
        ];
    }

    private function approvedBooksCount(Category $category): int
    {
        $ids = $category->allChildIds();
        return \App\Models\Book::whereIn('category_id', $ids)->count();
    }
}