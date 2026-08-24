<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $author = Author::where('slug', 'tahar-wattar')->first();
        $category = Category::where('slug', 'arabic-novels')->first();

        Book::create([
            'author_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'رحلة في ذاكرة الوطن',
            'slug' => 'rihla-fi-dhakirat-alwatan',
            'description' => 'رواية تستحضر تاريخ الجزائر عبر ذاكرة أجيال متعاقبة.',
            'language' => 'ar',
            'pages' => 248,
            'publication_year' => 2024,
            'legal_deposit' => '2024-1234',
            'publication_type' => 'house_edition',
            'price_print' => 900,
            'sale_email' => 'dar@example.dz',
            'status' => 'approved',
            'published_at' => now(),
        ]);

        Book::create([
            'author_id' => $author->id,
            'category_id' => $category->id,
            'title' => 'كتاب تجريبي مجاني',
            'slug' => 'free-test-book',
            'description' => 'كتاب بلا سعر — تنزيل مجاني للاختبار.',
            'language' => 'ar',
            'pages' => 120,
            'publication_type' => 'house_edition',
            'status' => 'approved',
            'published_at' => now(),
        ]);
    }
}
