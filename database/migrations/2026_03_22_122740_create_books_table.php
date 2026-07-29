<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade'); // المؤلف
            
            $table->string('title');              // عنوان الكتاب
            $table->text('description')->nullable(); // وصف الكتاب
            $table->string('cover_image')->nullable(); // صورة الغلاف
            
            $table->integer('pages')->nullable(); // عدد الصفحات
            $table->string('isbn')->nullable();   // ISBN
            $table->string('language')->default('ar'); // اللغة (ar, en, fr)
            
            $table->enum('status', ['draft', 'published', 'rejected'])->default('draft');
            $table->enum('visibility', ['public', 'private'])->default('public'); // عام/خاص
            
            $table->integer('downloads')->default(0); // عدد التنزيلات
            $table->integer('views')->default(0);     // عدد المشاهدات
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('books');
    }
};