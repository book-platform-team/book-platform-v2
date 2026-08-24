<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $novels = Category::create([
            'name' => 'الروايات والقصص الأدبية',
            'slug' => 'novels',
            'icon' => 'bx-book',
        ]);

        Category::create([
            'name' => 'روايات عربية',
            'slug' => 'arabic-novels',
            'icon' => 'bx-book-open',
            'parent_id' => $novels->id,
        ]);

        Category::create(['name' => 'الحياة الإسلامية', 'slug' => 'islamic-life', 'icon' => 'bx-moon']);
        Category::create(['name' => 'التاريخ', 'slug' => 'history', 'icon' => 'bx-time-five']);
        Category::create(['name' => 'التنمية البشرية', 'slug' => 'self-development', 'icon' => 'bx-trending-up']);

        Category::create([
            'name' => 'أخرى',
            'slug' => 'other',
            'icon' => 'bx-dots-horizontal',
            'is_fallback' => true,
        ]);
    }
}