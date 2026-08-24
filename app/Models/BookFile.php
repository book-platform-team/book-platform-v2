<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'type',
        'path',
        'size',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function getSizeHumanAttribute(): string
    {
        return $this->size >= 1048576
            ? round($this->size / 1048576, 1) . ' MB'
            : round($this->size / 1024, 1) . ' KB';
    }
}