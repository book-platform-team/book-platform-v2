<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        // مؤلف بلا حساب (متوفى) — كيما نص العقد
        Author::updateOrCreate(
            ['slug' => 'tahar-wattar'],
            [
                'name' => 'الطاهر وطار',
                'title' => 'doctor',
                'bio' => 'روائي جزائري بارز، من أهم أعلام الأدب الجزائري المعاصر.',
            ]
        );
    }
}