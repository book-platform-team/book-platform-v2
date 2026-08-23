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

    $author = $book->author;

    // البريد مؤكد من قبل لنفس المؤلف → تأكيد فوري بلا كود
    if ($author && $author->hasVerifiedSaleEmail($book->sale_email)) {
        $book->update(['sale_email_verified' => true]);
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

    $this->mailVerificationCode($book, $code);
}

private function mailVerificationCode(Book $book, int $code): void
{
    $authorName = $book->author->name ?? 'عزيزنا المؤلف';

    $body = "السلام عليكم {$authorName}،\n\n"
        . "يسرّنا إخبارك بأنّ هيئة القراءة وافقت على نشر كتابك «{$book->title}»\n\n"
        . "بقيت خطوة واحدة: تأكيد بريد التواصل مع المشترين — وهو البريد الذي سيراه القرّاء في صفحة كتابك ويراسلونك عليه لطلبه.\n\n"
        . "رمز التأكيد: {$code}\n\n"
        . "ادخل إلى حسابك ← صفحة «حسابي» ← قسم «كتبي» ← بجانب كتابك خانة «أكّد بريد البيع».\n"
        . "الرابط: https://sami-library.com/account.html\n\n"
        . "الرمز صالح 15 دقيقة. إن انتهت صلاحيته، اضغط «لم يصلني الرمز — أعد الإرسال» في نفس المكان ويصلك رمز جديد فوراً.\n\n"
        . "وحتى تؤكّد البريد، لن يظهر في صفحة كتابك ولن يتمكّن القرّاء من طلبه.\n\n"
        . "— دار سامي للطباعة والنشر والتوزيع";

    Mail::raw($body, fn ($message) => $message
        ->to($book->sale_email)
        ->subject('تمّت الموافقة على نشر كتابك — خطوة أخيرة'));
}
   public function requestCode(Request $request, int $bookId)
{
    $book = Book::withoutGlobalScope(ApprovedScope::class)->findOrFail($bookId);

    if (! $book->sale_email) {
        return response()->json(['success' => false, 'message' => 'لا يوجد بريد بيع لهذا الكتاب'], 422);
    }

    $this->sendVerificationCode($book);

    if ($book->fresh()->sale_email_verified) {
        return response()->json(['success' => true, 'data' => ['already_verified' => true]]);
    }

    return response()->json(['success' => true, 'data' => ['already_verified' => false]]);
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
        if ($book->author) {
    $book->author->addVerifiedSaleEmail($book->sale_email);
}

        return response()->json(['success' => true, 'data' => null]);
    }
}