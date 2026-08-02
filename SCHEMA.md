# SCHEMA.md — بنية قاعدة البيانات
**مشروع:** منصة سامي للطباعة والنشر والتوزيع
**النسخة:** 1.1 — **معتمَدة** (حُسمت نقطتا المؤلف والتصنيف في 1 أوت 2026)
**المسؤولة:** الباك-إند

---

## المبادئ الثلاثة (لا تتغيّر بعد الاتفاق)

1. **المؤلف ≠ المستخدم.** جدول `authors` منفصل تماماً عن `users`.

   الدار تنشر كتباً لمؤلفين متوفّين (الطاهر وطار · مولود فرعون · مالك بن نبي).
   لن يكون لهم حساب أبداً، ولا يجوز أن نصنع لهم حسابات وهمية.

   المستخدم الذي يصبح مؤلفاً يُربط بسجل في `authors` عبر `users.author_id`.
   والكتاب يرتبط بـ`author_id` **لا** بـ`user_id`.

   ✅ **قرار نهائي — 1 أوت 2026**

2. **الحالة ليست boolean.** الكتاب يمرّ بآلة حالات صريحة، وليس `is_approved = 0/1`. السبب: يجب التفريق بين "لم يُراجع بعد" و"رُفض"، ويجب أن يعرف المؤلف **سبب** الرفض.

3. **تصنيف واحد لكل كتاب.** عمود `category_id` في `books` — لا جدول وسيط.

   بحجم الدار الحالي (عشرات الكتب)، التصنيف المتعدّد يجعل الزائر يرى
   نفس الكتاب في كل قسم يفتحه، ويجعل مجموع عدّادات الأقسام أكبر من
   عدد الكتب الفعلي.

   المؤلف يختار التصنيف بنفسه عند رفع الكتاب — قرار تحريري واضح.

   إذا احتجنا التصنيف المتعدّد لاحقاً، نضيف جدول وسوم (`tags`)
   **إلى جانب** `category_id` لا بدلاً منه: القسم للتنظيم، والوسوم للاكتشاف.

   ⛔ **جدول `book_category` غير مطلوب — يُحذف إن وُجد.**

   ✅ **قرار نهائي — 1 أوت 2026**

4. **أنبوب واحد للمسارين.** كتاب يرفعه الأدمن وكتاب يرسله مؤلف يمرّان من **نفس الجدول ونفس الحالات**. الفرق الوحيد: كتاب الأدمن يبدأ مباشرة في `published`. لا يوجد جدولان منفصلان.

---

## آلة حالات الكتاب

```
                    ┌──────────┐
   إرسال المؤلف →   │ pending  │  ← في انتظار مراجعة الأدمن
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
        ┌───────────┐         ┌──────────┐
        │ published │         │ rejected │ + rejection_reason
        └─────┬─────┘         └──────────┘
              │                     │
              ↓                     ↓ (تعديل المؤلف)
        ┌──────────┐            pending
        │ archived │
        └──────────┘

   رفع الأدمن → published مباشرة
   draft → مسودة الأدمن غير منشورة بعد
```

| الحالة | المعنى | ظاهر للعموم؟ |
|---|---|---|
| `draft` | مسودة أدمن، غير مكتملة | ❌ |
| `pending` | أرسلها مؤلف، تنتظر المراجعة | ❌ |
| `published` | موافق عليه ومنشور | ✅ |
| `rejected` | مرفوض + سبب | ❌ (يراه صاحبه فقط) |
| `archived` | كان منشوراً وسُحب | ❌ |

**ملاحظة:** لا نستعمل حالة `approved` منفصلة عن `published`. الموافقة **هي** النشر. إضافة حالة وسيطة تعقيد بلا فائدة في هذا الحجم.

---

## الجداول

### `users`

| العمود | النوع | ملاحظات |
|---|---|---|
| id | bigint PK | |
| name | string | |
| email | string nullable **unique** | إما هذا أو phone مطلوب |
| phone | string nullable **unique** | |
| password | string | hashed |
| birthdate | date nullable | ⚠️ الاسم `birthdate` وليس `birth_date` |
| gender | enum('male','female') nullable | |
| role | enum('reader','author','admin') default 'reader' | |
| author_id | bigint FK→authors nullable | يُملأ عند ترقية المستخدم لمؤلف |
| avatar | string nullable | |
| email_verified_at | timestamp nullable | |

> ⛔ **لا حقول لتسجيل الدخول بجوجل** (`google_id` · `provider` · `avatar_url` …).
> الميزة مؤجَّلة بقرار — إن أُضيفت لاحقاً تُدرَج في العقد أولاً.
| remember_token, timestamps | | |

**قواعد التحقق عند التسجيل:**
```php
'email' => 'nullable|email|unique:users,email|required_without:phone',
'phone' => 'nullable|string|unique:users,phone|required_without:email',
'password' => 'required|min:8|confirmed',
```
> الحالي يقبل حساباً بلا إيميل وبلا هاتف — حساب مستحيل الدخول إليه. و`min:6` ضعيف لمشروع عميل.

---

### `authors`

| العمود | النوع | ملاحظات |
|---|---|---|
| id | bigint PK | |
| name | string | |
| slug | string **unique** | للروابط `/author/tahar-wattar` |
| bio | text nullable | |
| photo | string nullable | |
| nationality | string nullable | |
| birth_year | smallint nullable | |
| death_year | smallint nullable | لدعم المؤلفين القدامى |
| is_house_author | boolean default false | مؤلف تابع للدار |
| books_count | int default 0 | مُحدَّث تلقائياً (denormalized) |
| timestamps | | |

---

### `categories`

| العمود | النوع | ملاحظات |
|---|---|---|
| id | bigint PK | |
| name | string | |
| slug | string **unique** | |
| parent_id | bigint FK→categories nullable | تصنيفات فرعية |
| description | text nullable | |
| icon | string nullable | اسم أيقونة Boxicons |
| sort_order | int default 0 | |
| books_count | int default 0 | |
| timestamps | | |

**التصنيفات الأولية** (من الفرونت الحالي): الروايات والقصص الأدبية · الحياة الإسلامية · التاريخ · التنمية البشرية وتطوير الذات · العلوم السياسية

---

### `books` — الجدول الأساسي

| العمود | النوع | ملاحظات |
|---|---|---|
| id | bigint PK | |
| slug | string **unique** | ⚠️ من الآن، تغييره لاحقاً يكسر الروابط |
| title | string | |
| subtitle | string nullable | |
| description | text | |
| author_id | bigint FK→authors | |
| category_id | bigint FK→categories | ⭐ **واحد فقط** — لا علاقة many-to-many |
| isbn | string nullable | |
| language | string default 'ar' | |
| pages | int nullable | |
| publication_year | smallint nullable | |
| edition | string nullable | الطبعة |
| **publication_type** | enum('house_edition','author_submission') | ⭐ إصدار الدار vs نشر مؤلف |
| **status** | enum('draft','pending','published','rejected','archived') default 'pending' | |
| cover | string nullable | إن غاب → placeholder مولَّد |
| submitted_by | bigint FK→users nullable | null = أضافه الأدمن |
| reviewed_by | bigint FK→users nullable | من وافق/رفض |
| reviewed_at | timestamp nullable | |
| rejection_reason | text nullable | إجباري عند الرفض |
| published_at | timestamp nullable | |
| downloads_count | int default 0 | |
| views_count | int default 0 | |
| ratings_avg | decimal(3,2) default 0 | |
| ratings_count | int default 0 | |
| is_featured | boolean default false | للعرض في الرئيسية |
| timestamps, softDeletes | | |

**الفهارس المطلوبة:**
```php
$table->index(['status', 'published_at']);
$table->index('category_id');
$table->index('author_id');
$table->index('publication_type');
$table->fullText(['title', 'description']); // للبحث
```

---

### `book_files`

| العمود | النوع | ملاحظات |
|---|---|---|
| id | bigint PK | |
| book_id | bigint FK→books cascade | |
| type | enum('pdf','epub','docx','sample') | كتاب واحد = عدة ملفات |
| path | string | مسار داخل القرص الخاص |
| original_name | string | الاسم الأصلي للعرض فقط |
| size | bigint | بايت |
| mime | string | من فحص السيرفر لا من الامتداد |
| downloads_count | int default 0 | |
| timestamps | | |

**قواعد أمن الملفات — غير قابلة للتفاوض في مشروع عميل:**

- الملفات تُخزَّن في `storage/app/private/books/` — **خارج `public/`**
- اسم الملف المخزَّن **عشوائي** (`Str::uuid()`)، لا يُستعمل اسم المستخدم أو العنوان أبداً
- التحميل يمرّ عبر controller يتحقق من `status === 'published'` ثم `Storage::download()`
- التحقق من **MIME الحقيقي** (`$file->getMimeType()`) لا من الامتداد — تغيير `.exe` إلى `.pdf` يستغرق ثانية
- **حد أقصى للحجم: 50 MB** (`max:51200`) ✅ **محسوم**

  ⚠️ **قيد تقني قبل الرقم:** PHP يفرض حدّين افتراضيين أصغر بكثير.
  بدون تعديلهما في `php.ini` سيفشل الرفع عند 8 MB مهما كتبنا في Laravel:
  ```ini
  upload_max_filesize = 50M
  post_max_size = 55M      ; أكبر قليلاً — يشمل باقي حقول النموذج
  max_execution_time = 300 ; رفع 50MB على اتصال بطيء يحتاج وقتاً
  ```
  ويجب توثيق هذا لمن سينشر المشروع على الخادم.
- امتدادات مسموحة صريحة: `mimes:pdf,epub,docx`

---

### `reviews`

| العمود | النوع | ملاحظات |
|---|---|---|
| id | bigint PK | |
| book_id | FK→books cascade | |
| user_id | FK→users cascade | |
| content | text | |
| status | enum('pending','approved','rejected') default 'pending' | ⭐ المراجعات تُراجع أيضاً |
| helpful_count | int default 0 | |
| timestamps | | |

`unique(book_id, user_id)` — مراجعة واحدة لكل مستخدم لكل كتاب.

> **لماذا مراجعة المراجعات؟** أنت دار نشر بهوية تجارية، لا منتدى. تعليق مسيء تحت كتاب من إصداراتك يضرّ العلامة. Filament يعطيك شاشة موافقة جاهزة بلا كود إضافي.

---

### `quotes`

| العمود | النوع | ملاحظات |
|---|---|---|
| id, book_id, user_id | | |
| content | text | |
| page | int nullable | رقم الصفحة |
| status | enum('pending','approved','rejected') | |
| likes_count | int default 0 | |
| timestamps | | |

---

### `ratings`

| العمود | النوع |
|---|---|
| id, book_id, user_id | |
| value | tinyint (1–5) |
| timestamps | |

`unique(book_id, user_id)` — تقييم واحد، يُحدَّث لا يُكرَّر.
عند كل تغيير: أعِد حساب `books.ratings_avg` و `ratings_count` (Observer).

---

### `user_library`

| العمود | النوع | ملاحظات |
|---|---|---|
| id, user_id, book_id | | |
| shelf | enum('want_to_read','reading','read') | ⭐ **حالة واحدة** لا مجموعة |
| is_favorite | boolean default false | ⭐ مستقلّ عن الرف |
| downloaded_at | timestamp nullable | يُملأ تلقائياً عند أول تنزيل |
| timestamps | | |

**`unique(user_id, book_id)`** ← رف واحد لكل كتاب لكل مستخدم.

> ⚠️ **تصحيح مهم (1 أوت 2026):** كان القيد `unique(user_id, book_id, shelf)`
> وهو يسمح بوجود الكتاب نفسه في «للقراءة لاحقاً» و«أقرأ حالياً»
> و«أنهيتُه» في آنٍ واحد — وهذا مستحيل منطقياً.
>
> الرف **حالة** تتبدّل لا علامة تُضاف، تماماً كـ`status` في `books`.
> ونقل الكتاب بين الرفوف = `UPDATE` لا `INSERT` + `DELETE`.
>
> و`favorite` لم يعد رفّاً بل عموداً: يمكن أن يكون الكتاب مفضّلاً
> وأنتِ تقرئينه أو أنهيتِه — فهما بُعدان مختلفان.
> وكذلك `downloaded` صار طابعاً زمنياً لا رفّاً.

---

### `notifications`

جدول Laravel القياسي: `php artisan notifications:table`

**الإشعارات المطلوبة:**
- `BookApproved` → للمؤلف عند نشر كتابه
- `BookRejected` → للمؤلف + السبب
- `NewBookSubmitted` → للأدمن عند وصول كتاب جديد
- `NewReview` → لصاحب الكتاب

---

### `contact_messages`

لأن هذه دار نشر حقيقية ولها عملاء:

| العمود | النوع |
|---|---|
| id, name, email, phone nullable | |
| subject, message | |
| type | enum('general','publish_request','order','other') |
| status | enum('new','read','replied','closed') default 'new' |
| timestamps | |

---

## العلاقات (Eloquent)

```php
User    → belongsTo(Author)          // author_id
        → hasMany(Book, 'submitted_by')
        → hasMany(Review), hasMany(Quote), hasMany(Rating)
        → belongsToMany(Book, 'user_library')->withPivot('shelf')

Author  → hasMany(Book)
        → hasOne(User)

Category→ hasMany(Book)
        → belongsTo(Category, 'parent_id')  // parent
        → hasMany(Category, 'parent_id')    // children

Book    → belongsTo(Author), belongsTo(Category)
        → belongsTo(User, 'submitted_by'), belongsTo(User, 'reviewed_by')
        → hasMany(BookFile), hasMany(Review), hasMany(Quote), hasMany(Rating)
        → scopePublished($q) => $q->where('status','published')
```

**قاعدة صارمة:** كل استعلام عام يمرّ عبر `->published()`. أي endpoint عام ينسى هذا = تسريب كتب غير موافق عليها.

---

## ✅ قرارات محسومة — لا تُناقَش مجدداً

| # | القرار | التاريخ | الأثر على الخادم |
|---|---|---|---|
| 1 | `authors` جدول منفصل عن `users` | 1 أوت 2026 | هجرة `authors` + `users.author_id` + `books.author_id` |
| 2 | تصنيف واحد لكل كتاب | 1 أوت 2026 | **حذف `book_category`** + `books.category_id` |
| 3 | المؤلف يختار التصنيف عند الرفع | 1 أوت 2026 | `category_id` مطلوب في `POST /api/books` |
| 4 | الترقية إلى مؤلف فورية بلا موافقة | 1 أوت 2026 | `POST /api/user/become-author` يرقّي مباشرة |
| 5 | الترقية في اتجاه واحد (لا رجوع) | 1 أوت 2026 | لا endpoint للرجوع إلى قارئ |
| 6 | لوحة الأدمن بـ Filament | 1 أوت 2026 | لا `/api/admin/*` |
| 7 | **التحميل يتطلّب تسجيل دخول** | 1 أوت 2026 | `GET /books/{id}/download/{file}` محمي بـSanctum |
| 8 | **عدّاد التحميلات ظاهر للعموم** | 1 أوت 2026 | `downloads_count` في رد `GET /books/{slug}` |
| 9 | **حد الملف 50 MB** | 1 أوت 2026 | `max:51200` + تعديل `php.ini` |
| 10 | **تسجيل جوجل مؤجَّل — يُحذف الآن** | 1 أوت 2026 | حذف `SocialAuthController` وحقوله وروتاته |
| 11 | **رف واحد لكل كتاب** — `unique(user_id, book_id)` | 1 أوت 2026 | النقل بين الرفوف `UPDATE` لا `INSERT`+`DELETE` |
| 12 | **`is_favorite` عمود لا رف** | 1 أوت 2026 | مستقلّ عن الرف تماماً |

---

## قائمة إصلاحات الكود الحالي

| # | المشكلة | الملف | الإصلاح |
|---|---|---|---|
| 1 | `$token = 'demo-token'` مكتوب يدوياً في register و login | `AuthController.php` | `$user->createToken('auth')->plainTextToken` |
| 2 | `$casts` يكتب `birth_date` والعمود اسمه `birthdate` — bug صامت | `User.php` | صحّح إلى `'birthdate' => 'date'` |
| 3 | التسجيل يقبل حساباً بلا إيميل وبلا هاتف | `AuthController.php` | `required_without` في الاتجاهين |
| 4 | `min:6` لكلمة السر | `AuthController.php` | `min:8` + `Password::defaults()` |
| 5 | لا يوجد عمود `role` رغم أن الفرونت فيه قارئ/مؤلف/أدمن | migration | أضِف `role` |
| 6 | Sanctum مثبَّت وغير مستعمَل | — | فعّله على كل الروتات المحمية |
| 7 | لا يوجد `logout` | `routes/api.php` | `POST /api/logout` |
| 8 | جدول `authors` غير موجود | migration | أضِفه — القاعدة الأولى |
| 9 | `book_category` many-to-many | migration | **احذفه** وأضِف `books.category_id` |
| 10 | `bootstrap/cache/*.php` مرفوعة في Git | `.gitignore` | ملفات مؤقتة يولّدها Laravel |

---

## ترتيب البناء المقترح

1. migrations (كل الجداول دفعة واحدة)
2. Models + العلاقات + الـ scopes
3. Sanctum حقيقي + إصلاحات AuthController الـ7
4. Seeders: التصنيفات + مستخدم أدمن + 5 كتب تجريبية
5. Filament + الموارد
6. الـ API العامة (حسب `API.md`)