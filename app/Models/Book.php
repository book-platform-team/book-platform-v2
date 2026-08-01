<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'description',
        'cover_image',
        'pages',
        'isbn',
        'language',
        'status',
        'visibility',
        'downloads',
        'views',
    ];

    protected $casts = [
        'downloads' => 'integer',
        'views' => 'integer',
    ];

    // العلاقات
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function files()
    {
        return $this->hasMany(BookFile::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category');
    }
}