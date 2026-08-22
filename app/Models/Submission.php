<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_name', 'author_title', 'author_email', 'author_phone',
        'author_address', 'author_bio', 'author_extra', 'author_photo',
        'book_title', 'book_description', 'category_id', 'language',
        'pages', 'publication_year', 'legal_deposit', 'cover', 'file',
        'price_print', 'price_digital', 'price_2', 'price_3', 'price_4',
        'sale_email', 'user_id', 'book_id', 'status', 'ip', 'user_agent',
    ];
}