# ملاحظات تقنية للفريق — قرارات اجتهادية أثناء التنفيذ

هذا الملف يوثق كل نقطة بنيتها بدون نص صريح فـ SCHEMA.md/API.md، باش الفريق يأكدها أو يصححها قبل التسليم النهائي.

## 1. `is_admin` على `users`
العقد ما يذكرش نظام أدوار (roles) — لكن Filament (لوحة الإدارة) تحتاج تمييز بين "مؤلف" و"أدمن". زدت عمود `is_admin` (boolean) على `users` لتفعيل `canAccessPanel()`. هذا لا يخالف العقد (العقد ما يمنعه صراحة)، لكنه إضافة تقنية بحتة.

## 2. `remember_token` على `users`
العقد يعدد أعمدة `users` بلا `remember_token`. لكن Laravel's Authenticatable trait و Filament's "Remember me" checkbox يتوقعوه بالافتراض — بدونه، تسجيل الدخول يطيح بـ500 error. زدته كعمود قياسي إجباري تقنيا.

## 3. `sale_email` verification flow
العقد يقول "`sale_email` لا يُنشر حتى يُؤكَّد برمز يصل إليه" — بلا تفاصيل الـAPI. بنيت:
- جدول `sale_email_verifications` (book_id, email, code hashed, expires_at, attempts)
- عمود `books.sale_email_verified` (boolean)
- `POST /api/books/{bookId}/sale-email/request` → يرسل كود 6 أرقام (صلاحية 15 دقيقة)
- `POST /api/books/{bookId}/sale-email/verify` → يتحقق، وعندها `sale_email` يظهر فـ `GET /api/books/{slug}`

⚠️ **أسئلة معلقة للفريق:**
- وين يُستدعى `request` — عند الـsubmission تلقائيا، ولا المؤلف يطلبه من حسابه بعدين؟
- الفرونت شافت هذا الـflow؟ محتاجة صفحة/فورم لإدخال الكود.
- إرسال البريد الفعلي (`Mail::to()`) لسه TODO — حاليا الكود يطبع فـ`storage/logs/laravel.log` للاختبار فقط.

## 4. `submissions` — أعمدة زائدة عن نص العقد
العقد يقول "احفظها كاملةً" بلا تعداد أعمدة صريح. زدت `user_id`, `book_id`, `status` (بالإضافة لكل حقول الفورم) — ضرورية عمليا باش Filament يربط submission بالحساب/الكتاب المتولدين عند الموافقة.

## 5. سبب الرفض (`rejection_reason`)
تم الاتفاق: **بلا** `rejection_reason` — الرفض غير تغيير حالة (`status: rejected`) بلا تفصيل مخزن. Filament تعرض زر "رفض" بلا خانة سبب.

## 6. XAMPP / PostgreSQL محليا
المشروع يخدم بـ PostgreSQL محليا (مطابق للعقد وللإنتاج المستقبلي على Render)، رغم أن XAMPP يوفر MySQL افتراضيا. PostgreSQL ثبت بشكل منفصل. لاحظي: بعض syntax يختلف بين MySQL/PostgreSQL (خاصة `ILIKE` للبحث، تعامل صارم مع مقارنة الأنواع فـ WHERE).

## 7. Front-Bouthaina — روابط مطلقة
لاحظت روابط `/assets/css/...` مطلقة فـ `Front-Bouthaina/*.html` — تخدم فقط لو الفرونت هي document root مباشرة على نفس الدومين تاع الباك. محليا (XAMPP) هذا يسبب 404. بلغت بثينة، بانتظار رد.
## 8. `.env` — production checklist
عند النشر الفعلي، خاص تتبدل:
- `APP_ENV=production`, `APP_DEBUG=false`
- `APP_URL` = دومين الإنتاج
- `DB_*` = بيانات Render (عبر متغيرات بيئة، ماشي `.env` مباشرة)
- `MAIL_MAILER=smtp` + بيانات SMTP حقيقية (ضروري لـ sale_email verification و password reset)
- `SANCTUM_STATEFUL_DOMAINS` و `SESSION_DOMAIN` = دومين الإنتاج فقط
## 10. تحديثات بثينة (بعد المراجعة) — 23 أوت 2026

- `has_sale_email`/`sale_email_verified` تأكدت في `GET /api/auth/me` (ضمن `books[]`)، الشكل النهائي:
  `{ id, slug, title, status, has_sale_email, sale_email_verified }` — منفذ ومختبر.
- العميل بدّل القرار: فقط "نشر كتاب" (`/api/submissions`) يمر بالباك. البقية (طباعة كتاب،
  "أرسل لنا"، بلاغ حقوق نشر) تروح مباشرة لبريد الدار من الفرونت. `POST /api/contact` **تبقى
  فعالة بلا حذف** (احتياط)، لكن الفرونت لن يستدعيها — `contact_messages` ستبقى فارغة، وهذا متوقع.
- بيانات الدار الحقيقية: `darsami39000@gmail.com`, هاتف `0668 00 59 70` — حُطّت في الفرونت من طرف بثينة.
- SMTP حقيقي مفعّل (Gmail App Password) — `forgotPassword()` و`sendVerificationCode()` يرسلان فعلياً.