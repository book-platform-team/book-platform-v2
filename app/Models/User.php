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
        'name',
        'gender',      // جديد
        'birth_date',  // جديد
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
        'birth_date' => 'date', // لتسهيل التعامل مع التاريخ
    ];
}