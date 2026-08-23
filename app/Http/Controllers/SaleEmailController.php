<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Scopes\ApprovedScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class SaleEmailController extends Controller
{
    public function sendVerificationCode(Book $book): void
    {
        if (! $book->sale_email) {
            return;
        }

        $code = random_int(100000, 999999);

        DB::table('sale_email_verifications')->insert([
            'book_id' => $book->id,
            'email' => $book->sale_email,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::raw(
            "رمز تأكيد بريد البيع لكتابك \"{$book->title}\" هو: {$code}\nصالح لمدة 15 دقيقة.",
            fn ($message) => $message->to($book->sale_email)->subject('تأكيد بريد البيع — دار سامي')
        );
    }

    public function requestCode(Request $request, int $bookId)
    {
        $book = Book::withoutGlobalScope(ApprovedScope::class)->findOrFail($bookId);

        if (! $book->sale_email) {
            return response()->json(['success' => false, 'message' => 'لا يوجد بريد بيع لهذا الكتاب'], 422);
        }

        $this->sendVerificationCode($book);

        return response()->json(['success' => true, 'data' => null]);
    }

    public function verifyCode(Request $request, int $bookId)
    {
        $data = $request->validate(['code' => 'required|string']);

        $book = Book::withoutGlobalScope(ApprovedScope::class)->findOrFail($bookId);

        $record = DB::table('sale_email_verifications')
            ->where('book_id', $bookId)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if (! $record || now()->gt($record->expires_at) || $record->attempts >= 5) {
            return response()->json(['success' => false, 'message' => 'الرمز غير صالح أو منتهي'], 422);
        }

        if (! Hash::check($data['code'], $record->code)) {
            DB::table('sale_email_verifications')->where('id', $record->id)->increment('attempts');
            return response()->json(['success' => false, 'message' => 'الرمز غير صحيح'], 422);
        }

        DB::table('sale_email_verifications')->where('id', $record->id)->update(['verified_at' => now()]);
        $book->update(['sale_email_verified' => true]);

        return response()->json(['success' => true, 'data' => null]);
    }
}