<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * تسجيل مستخدم جديد
     */
    public function register(Request $request)
    {
        // تحقق من الحقول كما JS بثينه متوقع
        $request->validate([
            'email' => 'required_without:phone|email|unique:users,email',
            'phone' => 'required_without:email|unique:users,phone',
            'password' => 'required|min:6|confirmed',
        ]);

        // إنشاء المستخدم
        $user = User::create([
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // توكن مؤقت لتجربة JS
        $token = 'demo-token';

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح',
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * تسجيل الدخول
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required_without:phone|email',
            'phone' => 'required_without:email',
            'password' => 'required|min:6',
        ]);

        // تحديد نوع الاتصال
        $contactType = $request->email ? 'email' : 'phone';
        $contactValue = $request->$contactType;

        $user = User::where($contactType, $contactValue)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة'
            ], 401);
        }

        $token = 'demo-token'; // مؤقت للتجربة

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $token,
            'user' => $user
        ]);
    }
}