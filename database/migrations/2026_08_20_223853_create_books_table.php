<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('authors');
            $table->foreignId('category_id')->constrained('categories');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('cover')->nullable();
            $table->enum('language', ['ar', 'fr', 'en'])->default('ar');
            $table->integer('pages')->nullable();
            $table->integer('publication_year')->nullable();
            $table->string('edition')->nullable();
            $table->string('isbn')->nullable();
            $table->string('legal_deposit')->nullable();
            $table->enum('publication_type', ['house_edition', 'author_submission']);

            $table->integer('price_digital')->nullable();
            $table->integer('price_print')->nullable();
            $table->integer('price_2')->nullable();
            $table->integer('price_3')->nullable();
            $table->integer('price_4')->nullable();
            $table->string('sale_email')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('published_at')->nullable();
            $table->integer('downloads_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('category_id');
            $table->index('author_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};