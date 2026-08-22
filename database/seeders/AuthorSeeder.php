<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        // مؤلف بلا حساب (متوفى) — كيما نص العقد
        Author::create([
            'name' => 'الطاهر وطار',
            'slug' => 'tahar-wattar',
            'title' => 'none',
            'bio' => 'روائي جزائري بارز، من أهم أعلام الأدب الجزائري المعاصر.',
        ]);
    }
}
