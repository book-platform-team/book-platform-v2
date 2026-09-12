<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $novels = Category::firstOrCreate(
            ['slug' => 'novels'],
            ['name' => 'الروايات والقصص الأدبية', 'icon' => 'bx-book']
        );

        Category::firstOrCreate(
            ['slug' => 'arabic-novels'],
            ['name' => 'روايات عربية', 'icon' => 'bx-book-open', 'parent_id' => $novels->id]
        );

        Category::firstOrCreate(['slug' => 'islamic-life'], ['name' => 'الحياة الإسلامية', 'icon' => 'bx-moon']);
        Category::firstOrCreate(['slug' => 'history'], ['name' => 'التاريخ', 'icon' => 'bx-time-five']);
        Category::firstOrCreate(['slug' => 'self-development'], ['name' => 'التنمية البشرية', 'icon' => 'bx-trending-up']);

        Category::firstOrCreate(
            ['slug' => 'other'],
            ['name' => 'أخرى', 'icon' => 'bx-dots-horizontal', 'is_fallback' => true]
        );
    }
}