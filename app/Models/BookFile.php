<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'format',
        'file_path',
        'size_kb',
        'downloads',
    ];

    protected $casts = [
        'size_kb' => 'integer',
        'downloads' => 'integer',
    ];

    // العلاقة
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    // مسار كامل للملف
    public function getFullPathAttribute()
    {
        return storage_path('app/public/books/' . $this->file_path);
    }
}