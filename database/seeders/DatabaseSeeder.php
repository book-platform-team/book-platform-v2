<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (User::where('email', 'test@example.com')->exists()) {
            $this->command->info('البيانات موجودة أصلا، تخطي الـseeding.');
            return;
        }

        User::factory()->create([
            'name' => 'مستخدم تجريبي',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->call([
            CategorySeeder::class,
            AuthorSeeder::class,
            BookSeeder::class,
        ]);
    }
}