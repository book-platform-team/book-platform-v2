<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'title',
        'bio',
        'photo',
        'phone',
        'address',
        'extra',
        'verified_sale_emails',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }
    public function hasVerifiedSaleEmail(string $email): bool
{
    return in_array($email, $this->verified_sale_emails ?? []);
}

public function addVerifiedSaleEmail(string $email): void
{
    $emails = $this->verified_sale_emails ?? [];
    if (! in_array($email, $emails)) {
        $emails[] = $email;
        $this->update(['verified_sale_emails' => $emails]);
    }
}
protected $casts = [
    'verified_sale_emails' => 'array',
];
}