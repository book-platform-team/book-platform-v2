<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class SocialAuthController extends Controller
{
    /**
     * توجيه المستخدم لصفحة تسجيل الدخول بجوجل
     * 
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * معالجة العودة من جوجل وحفظ المستخدم في قاعدة البيانات
     * 
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            // 1. جلب بيانات المستخدم من جوجل
            $googleUser = Socialite::driver('google')->user();

            // تسجيل بيانات جوجل للتحقق
            Log::info('🔍 بيانات جوجل المستلمة:', [
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]);

            // 2. البحث عن المستخدم أولاً
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // 3. إنشاء مستخدم جديد
                Log::info('🆕 إنشاء مستخدم جديد...');

                $userData = [
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(24)),
                    'provider' => 'google',
                    'provider_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'phone' => null,
                    'birthdate' => null,
                    'gender' => null,
                ];

                // محاولة الحفظ مع التقاط أي خطأ
                $user = User::create($userData);

                Log::info('✅ تم إنشاء مستخدم جديد عبر جوجل', [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'provider' => $user->provider,
                    'provider_id' => $user->provider_id,
                ]);
            } else {
                // 4. تحديث بيانات المستخدم الموجود
                Log::info('🔄 تحديث مستخدم موجود...');

                $user->update([
                    'provider' => 'google',
                    'provider_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);

                Log::info('🔄 تم تحديث بيانات المستخدم عبر جوجل', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'provider_id' => $user->provider_id,
                ]);
            }

            // 5. إنشاء توكن للتوثيق
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('🔑 تم إنشاء التوكن بنجاح', [
                'user_id' => $user->id,
                'token_length' => strlen($token),
            ]);

            // 6. التوجيه لصفحة المكتبة مع التوكن
            $redirectUrl = url('/Front-Bouthaina/library.html') . '?token=' . urlencode($token) . '&user=' . urlencode(json_encode($user));

            Log::info('✅ التوجيه للواجهة', [
                'redirect_url' => $redirectUrl,
            ]);

            return redirect($redirectUrl);

        } catch (QueryException $e) {
            // خطأ في قاعدة البيانات (مثل: unique constraint)
            Log::error('❌ خطأ في قاعدة البيانات:', [
                'message' => $e->getMessage(),
                'sql_state' => $e->getCode(),
                'sql' => $e->getSql(),
            ]);

            return redirect(url('/Front-Bouthaina/register.html?error=database_error'));

        } catch (\Illuminate\Database\Eloquent\MassAssignmentException $e) {
            // خطأ: الحقول غير موجودة في $fillable
            Log::error('❌ خطأ في $fillable:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return redirect(url('/Front-Bouthaina/register.html?error=fillable_error'));

        } catch (\Exception $e) {
            // خطأ عام
            Log::error('❌ خطأ عام في تسجيل الدخول بجوجل:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect(url('/Front-Bouthaina/register.html?error=google_login_failed'));
        }
    }
}