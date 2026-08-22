<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        if (! $request->user()) {
            return response()->json(['success' => false, 'message' => 'غير مسجل الدخول'], 401);
        }

        return response()->json(['success' => true, 'data' => $this->userPayload($request->user())]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($data)) {
            return response()->json([
                'success' => false,
                'message' => 'البريد أو كلمة السرّ غير صحيحة',
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json(['success' => true, 'data' => $this->userPayload(Auth::user())]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $code = random_int(100000, 999999);

            DB::table('password_reset_codes')->updateOrInsert(
                ['email' => $user->email],
                [
                    'code' => Hash::make($code),
                    'expires_at' => now()->addMinutes(15),
                    'used_at' => null,
                    'attempts' => 0,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

           
           // TODO: أرسل $code بالبريد (Mail::to($user->email)->send(...))
        }

        // ⚠️ نجاح دائماً — العقد يمنع تسريب "غير مسجل"
        return response()->json(['success' => true, 'data' => null]);
    }

    public function verifyResetCode(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $record = DB::table('password_reset_codes')->where('email', $data['email'])->first();

        if (! $record || $record->used_at || now()->gt($record->expires_at) || $record->attempts >= 5) {
            return response()->json(['success' => false, 'message' => 'الرمز غير صالح أو منتهي'], 422);
        }

        if (! Hash::check($data['code'], $record->code)) {
            DB::table('password_reset_codes')->where('email', $data['email'])->increment('attempts');
            return response()->json(['success' => false, 'message' => 'الرمز غير صحيح'], 422);
        }

        return response()->json(['success' => true, 'data' => null]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()->min(8)],
        ]);

        $record = DB::table('password_reset_codes')->where('email', $data['email'])->first();

        if (! $record || $record->used_at || now()->gt($record->expires_at) || ! Hash::check($data['code'], $record->code)) {
            return response()->json(['success' => false, 'message' => 'الرمز غير صالح أو منتهي'], 422);
        }

        User::where('email', $data['email'])->update(['password' => Hash::make($data['password'])]);

        DB::table('password_reset_codes')->where('email', $data['email'])->update(['used_at' => now()]);

        return response()->json(['success' => true, 'data' => null]);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'title' => 'sometimes|in:none,professor,doctor,researcher',
            'phone' => 'sometimes|string|nullable',
            'address' => 'sometimes|string|nullable',
            'bio' => 'sometimes|string|nullable',
            'extra' => 'sometimes|string|nullable',
        ]);

        $user = $request->user();

        if (isset($data['name'])) {
            $user->update(['name' => $data['name']]);
        }

        if ($user->author) {
            $user->author->update(collect($data)->except('name')->toArray());
        }

        return response()->json(['success' => true, 'data' => $this->userPayload($user->fresh())]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::defaults()->min(8)],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'كلمة السرّ الحالية غير صحيحة'], 422);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['success' => true, 'data' => null]);
    }

    private function userPayload(User $user): array
    {
        $author = $user->author;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'title' => $author->title ?? 'none',
            'phone' => $author->phone ?? null,
            'address' => $author->address ?? null,
            'bio' => $author->bio ?? null,
            'extra' => $author->extra ?? '',
            'photo' => $author->photo ?? null,
            'slug' => $author->slug ?? null,
            'books_count' => $author ? $author->books()->count() : 0,
        ];
    }
}