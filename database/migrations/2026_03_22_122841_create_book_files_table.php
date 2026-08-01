<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('book_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            
            $table->enum('format', ['pdf', 'epub', 'txt', 'mobi']); // الصيغة
            $table->string('file_path');      // مسار الملف
            $table->integer('size_kb');       // الحجم بالكيلوبايت
            
            $table->integer('downloads')->default(0); // عدد التنزيلات لهذا الملف
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('book_files');
    }
};