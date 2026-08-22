<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'parent_id',
        'is_fallback',
    ];

    protected $casts = [
        'is_fallback' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function allChildIds(): array
    {
        return $this->children()->pluck('id')
            ->merge($this->children->flatMap(fn ($c) => $c->allChildIds()))
            ->push($this->id)->toArray();
    }
}