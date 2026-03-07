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
        // تحقق من الحقول كما JS يتوقع
        $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|unique:users,phone',
            'password' => 'required|min:6|confirmed',
        ]);

        // إنشاء المستخدم
        $user = User::create([
            'name' => $request->name,
            'gender' => $request->gender,
            'birthdate' => $request->birth_date,
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
        // تحقق من الحقول كما JS يتوقع
        $request->validate([
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'password' => 'required|string|min:6',
        ]);

        // تحديد نوع الاتصال
        $contactType = $request->email ? 'email' : 'phone';
        $contactValue = $request->$contactType;

        // البحث عن المستخدم
        $user = User::where($contactType, $contactValue)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة'
            ], 401);
        }

        // توكن مؤقت لتجربة JS
        $token = 'demo-token';

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $token,
            'user' => $user
        ]);
    }
}