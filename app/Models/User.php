<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة (mass assignable)
     */
    protected $fillable = [
        'name',      // ممكن نخليه نفس البريد لو المستخدم ما عطاش اسم
        'email',
        'phone',
        'password',
    ];

    /**
     * الحقول المخفية عند الـ serialization
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * casts
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}