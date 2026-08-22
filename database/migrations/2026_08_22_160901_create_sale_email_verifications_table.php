<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_email_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('code');
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at');
            $table->integer('attempts')->default(0);
            $table->timestamps();
        });

        Schema::table('books', function (Blueprint $table) {
            $table->boolean('sale_email_verified')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('sale_email_verified');
        });
        Schema::dropIfExists('sale_email_verifications');
    }
};