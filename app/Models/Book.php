<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\ApprovedScope);
    }

    protected $fillable = [
        'author_id',
        'category_id',
        'title',
        'slug',
        'description',
        'cover',
        'language',
        'pages',
        'publication_year',
        'edition',
        'isbn',
        'legal_deposit',
        'publication_type',
        'price_digital',
        'price_print',
        'price_2',
        'price_3',
        'price_4',
        'sale_email',
        'status',
        'published_at',
        'downloads_count',
        'views_count',
        'sale_email_verified',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'downloads_count' => 'integer',
        'views_count' => 'integer',
        'price_digital' => 'integer',
        'price_print' => 'integer',
        'price_2' => 'integer',
        'price_3' => 'integer',
        'price_4' => 'integer',
        'sale_email_verified' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function files()
    {
        return $this->hasMany(BookFile::class);
    }

    public function getIsPaidAttribute(): bool
    {
        return ! is_null($this->price_digital) || ! is_null($this->price_print);
    }

    public function getPriceAttribute(): ?int
    {
        return $this->price_digital ?? $this->price_print;
    }
}