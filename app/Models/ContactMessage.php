<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'type', 'name', 'email', 'phone', 'subject', 'message',
        'book_title', 'pages', 'size', 'copies', 'ip',
    ];

    protected $casts = [
        'copies' => 'array',
    ];
}
