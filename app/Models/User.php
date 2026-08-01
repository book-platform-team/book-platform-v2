<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory;
    use HasApiTokens;
    use Notifiable;


    /**
     * الحقول القابلة للتعبئة (mass assignable)
     */
    protected $fillable = [
        'name',
        'gender',      // جديد
        'birthdate',  // جديد
        'email',
        'phone',
        'password',
         'provider',      // ← جديد
         'provider_id',   // ← جديد
         'avatar',
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