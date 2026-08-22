<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();

            $table->string('author_name');
            $table->enum('author_title', ['none', 'professor', 'doctor', 'researcher'])->default('none');
            $table->string('author_email');
            $table->string('author_phone');
            $table->string('author_address');
            $table->text('author_bio');
            $table->text('author_extra')->nullable();
            $table->string('author_photo')->nullable();

            $table->string('book_title');
            $table->text('book_description');
            $table->foreignId('category_id')->constrained('categories');
            $table->enum('language', ['ar', 'fr', 'en'])->nullable();
            $table->integer('pages');
            $table->integer('publication_year')->nullable();
            $table->string('legal_deposit');
            $table->string('cover');
            $table->string('file')->nullable();

            $table->integer('price_print')->nullable();
            $table->integer('price_digital')->nullable();
            $table->integer('price_2')->nullable();
            $table->integer('price_3')->nullable();
            $table->integer('price_4')->nullable();
            $table->string('sale_email')->nullable();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('book_id')->nullable()->constrained('books')->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->string('ip')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};