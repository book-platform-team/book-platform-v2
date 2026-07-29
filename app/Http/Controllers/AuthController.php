<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * تسجيل مستخدم جديد
     */
    public function register(Request $request)
    {


 // 🔹 تنظيف رقم الهاتف (إزالة +213، 00213، المسافات، والشرطات)
    $phone = $request->phone;
    
    if ($phone) {
        // إزالة +213 أو 00213 من البداية
        $phone = preg_replace('/^(\+213|00213)/', '', $phone);
        
        // إزالة المسافات والشرطات
        $phone = preg_replace('/[\s\-]/', '', $phone);
        
        // إذا الرقم بدون صفر في البداية، نضيفه
        if (strlen($phone) === 9 && in_array(substr($phone, 0, 1), ['5', '6', '7'])) {
            $phone = '0' . $phone;
        }
        
        // تحديث الطلب بالرقم النظيف
        $request->merge(['phone' => $phone]);
    }




        // التحقق من الحقول مع رسائل عربية مخصصة
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[\p{Arabic}a-zA-Z\s]+$/u' // يقبل العربية + الإنجليزية فقط
            ],
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date|before:-6 years', // أكبر من 6 سنة
            'email' => 'required_without:phone|nullable|email|unique:users,email',
            'phone' => [
                'required_without:email',
                'nullable',
                'regex:/^0(5|6|7)[0-9]{8}$/',
                'unique:users,phone'
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
        ], [
            // رسائل الأخطاء بالعربية
            'name.required' => 'الاسم مطلوب',
            'name.min' => 'الاسم يجب أن يحتوي على حرفين على الأقل',
            'name.regex' => 'الاسم يجب أن يحتوي على أحرف فقط (عربي أو إنجليزي)',
            'gender.required' => 'يرجى اختيار الجنس',
            'birth_date.required' => 'تاريخ الميلاد مطلوب',
            'birth_date.before' => 'يجب أن تكون أكبر من 13 سنة',
            'email.required_without' => 'يرجى إدخال إيميل أو رقم هاتف',
            'email.email' => 'صيغة الإيميل غير صحيحة',
            'email.unique' => 'هذا الإيميل مسجل مسبقاً',
            'phone.required_without' => 'يرجى إدخال إيميل أو رقم هاتف',
            'phone.regex' => 'صيغة رقم الهاتف غير صحيحة (يجب أن يبدأ بـ 05، 06، أو 07)',
            'phone.unique' => 'هذا الرقم مسجل مسبقاً',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'password.regex' => 'كلمة المرور يجب أن تحتوي على حرف كبير، صغير، ورقم',
        ]);

        // إذا فيه أخطاء ← نرجعها للمستخدم
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        // إنشاء المستخدم
        $user = User::create([
            'name' => $request->name,
            'gender' => $request->gender,
            'birthdate' => $request->birth_date, // تأكدي أن اسم الحقل في قاعدة البيانات هو "birthdate"
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // إنشاء توكن حقيقي (بدلاً من التوكن التجريبي)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الحساب بنجاح',
            'token' => $token,
            'user' => $user
        ], 201);
    }

    /**
     * تسجيل الدخول
     */
    public function login(Request $request)
    {
        
 // 🔹 تنظيف رقم الهاتف (إزالة +213، 00213، المسافات، والشرطات)
    $phone = $request->phone;
    
    if ($phone) {
        // إزالة +213 أو 00213 من البداية
        $phone = preg_replace('/^(\+213|00213)/', '', $phone);
        
        // إزالة المسافات والشرطات
        $phone = preg_replace('/[\s\-]/', '', $phone);
        
        // إذا الرقم بدون صفر في البداية، نضيفه
        if (strlen($phone) === 9 && in_array(substr($phone, 0, 1), ['5', '6', '7'])) {
            $phone = '0' . $phone;
        }
        
        // تحديث الطلب بالرقم النظيف
        $request->merge(['phone' => $phone]);
    }







        // التحقق من الحقول
        $validator = Validator::make($request->all(), [
            'email' => 'required_without:phone|nullable|email',
            'phone' => 'required_without:email|nullable',
            'password' => 'required|string|min:6',
        ], [
            'email.required_without' => 'يرجى إدخال إيميل أو رقم هاتف',
            'email.email' => 'صيغة الإيميل غير صحيحة',
            'phone.required_without' => 'يرجى إدخال إيميل أو رقم هاتف',
            'phone.regex' => 'صيغة رقم الهاتف غير صحيحة',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور قصيرة جداً',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        // تحديد نوع الاتصال (إيميل أو هاتف)
        $credentialsField = $request->email ? 'email' : 'phone';
        $credentialsValue = $request->{$credentialsField};

        // البحث عن المستخدم
        $user = User::where($credentialsField, $credentialsValue)->first();

        // التحقق من الباسوورد
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات الاعتماد غير صحيحة'
            ], 401);
        }

        // إنشاء توكن حقيقي
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $token,
            'user' => $user
        ], 200);
    }
}