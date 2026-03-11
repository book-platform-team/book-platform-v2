<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{  
public function redirectToGoogle()
{
    // تحقق من وجود الجلسة
    if (session()->has('test')) {
        dd('الجلسة شغالة', session('test'));
    }
    
    session(['test' => 'session works!']);
    return redirect()->back();
}
       



public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            $user = User::where('provider_id', $googleUser->id)
                        ->where('provider', 'google')
                        ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'provider' => 'google',
                    'provider_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => Hash::make(Str::random(24)),
                    'gender' => null,
                    'birthdate' => null,
                    'phone' => null,
                    'is_verified' => true,
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // إعادة التوجيه للواجهة مع التوكن
            return redirect()->to('http://localhost:8000/Front-Bouthaina/login.html?token=' . $token . '&user=' . urlencode(json_encode($user)));

        } catch (\Exception $e) {
            return redirect()->to('http://localhost:8000/Front-Bouthaina/register.html?error=' . urlencode($e->getMessage()));
        }
    }
}