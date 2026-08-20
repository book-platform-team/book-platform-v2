# عقد الواجهة الخلفية — دار سامي للطباعة والنشر والتوزيع

> **إلى كلود:** هذا عقد مُلزِم مستخرَج من كود واجهة **مكتملة وتعمل**، لا من تصوّر.
> الواجهة موجودة وتنتظر هذه المسارات بأسمائها وحقولها حرفياً.
>
> **ثلاث قواعد قبل أي سطر كود:**
>
> 1. **لا تضف ما ليس هنا.** كل حقل أو جدول أو مسار زائد سيُهمَل، وقد يكسر الواجهة.
>    اقرأ قسم «ما لا يُبنى» في الآخر — هو نصف المواصفة.
> 2. **لا تعِد تسمية شيء.** `price_print` ليس `print_price`. `copies` مصفوفة لا رقم.
>    الواجهة تقرأ هذه الأسماء بالضبط.
> 3. **حين تشكّ، اسأل.** لا تخمّن سلوكاً غير مذكور هنا.

---

## البيئة

Laravel 12 · PHP 8.2 · PostgreSQL · Filament (لوحة الدار) · Sanctum

الواجهة ملفات ثابتة تُقدَّم من `public/Front-Bouthaina/` على **نفس الدومين** — فلا CORS.

---

## ١ · نموذج المجال

### القرّاء بلا حسابات

لا تسجيل للقرّاء إطلاقاً. المفضّلة في `localStorage` عند المتصفّح ولا تُرسل إلى الخادم.

### المؤلفون لهم حسابات — تُولد من النشر

**لا توجد استمارة تسجيل.** الحساب يُنشأ حين يرسل المؤلف كتابه الأول:

```
مؤلف جديد   →  POST /api/submissions ومعه password
              →  أنشئ user + author، افتح الجلسة، أرجِع المستخدم

مؤلف عائد   →  POST /api/auth/login
              →  الواجهة تملأ الخطوة الأولى من بياناته
```

وقد يوجد **مؤلف بلا حساب**: الدار تنشئ سجلّات لمؤلفين قدامى (الطاهر وطار) من Filament.
لذلك **`authors.user_id` قابل للإفراغ**.

### إتاحة الكتاب تُستنتج ولا تُخزَّن

لا حقل `status` ولا `is_free` ولا `content_access`. الحالة تُقرأ من البيانات:

| ما هو موجود | ما يعنيه |
|---|---|
| ملف، بلا `price_digital` | يُنزَّل مجاناً |
| `price_digital` | النسخة الإلكترونية تُباع (بملف أو بدونه) |
| `price_print` | نسخ مطبوعة تُطلب |
| ملف + `price_print` | مجاني رقمياً ومباع ورقياً |
| لا ملف ولا سعر | تعريف بالكتاب فقط |

بيع النسخة الإلكترونية **لا يشترط رفع الملف** — المؤلف قد يرسلها بنفسه بعد الاتفاق.

---

## ٢ · الجداول

### `users`

```
id · name · email (unique) · password · email_verified_at · timestamps
```

لا حقول اجتماعية، لا `phone` للدخول. البريد هوية وحيدة.

### `authors`

```
id
user_id          nullable, FK → users, nullOnDelete   ⚠️ nullable إجباري
name             string
slug             string unique
title            enum('none','professor','doctor','researcher') default 'none'
bio              text
photo            string nullable
phone            string nullable      🔒 لا يُرجَع في أي endpoint عام
address          string nullable      🔒 لا يُرجَع في أي endpoint عام
extra            text nullable        🔒 لا يُرجَع في أي endpoint عام
timestamps
```

🔒 الثلاثة الأخيرة **لا تغادر الخادم إلى endpoint عام**. الواجهة وعدت المؤلف في شروط
النشر ألّا تُنشر، والوعد يُنفَّذ في الـResource لا في النيّة.

`title` تظهر للزوّار كـ«أستاذ / دكتور / باحث» فوق اسم المؤلف.

### `categories`

```
id · name · slug unique · icon (اسم أيقونة boxicons)
parent_id    nullable, self FK
is_fallback  boolean default false     (قسم «أخرى» — يُرتَّب أخيراً دائماً)
```

شجرة من مستويين فقط: أب وأبناء. لا عمق ثالث.

### `books`

```
id
author_id        FK → authors
category_id      FK → categories
title            string
slug             string unique
description      text
cover            string nullable
language         enum('ar','fr','en') default 'ar'
pages            integer nullable
publication_year integer nullable
edition          string nullable
isbn             string nullable
legal_deposit    string nullable
publication_type enum('house_edition','author_submission')

-- التسعير: كلّها nullable
price_digital    integer nullable    فارغ = تنزيل مجاني
price_print      integer nullable    سعر النسخة المطبوعة الواحدة
price_2          integer nullable    سعر نسختين ورقيتين (مجموعاً)
price_3          integer nullable
price_4          integer nullable
sale_email       string  nullable    ⚠️ مطلوب متى وُجد أي سعر

status           enum('pending','approved','rejected') default 'pending'
published_at     timestamp nullable
downloads_count  integer default 0
views_count      integer default 0
timestamps
```

**تحقّق إجباري في الخادم:** كل سعر جملة يجب أن **يقلّ** عن `price_print × العدد`،
وإلّا فليس تخفيضاً. الواجهة تمنعه، لكن الواجهة ليست حاجزاً.

الأسعار بالدينار الجزائري **أعداد صحيحة** — لا كسور.

### `book_files`

```
id · book_id FK · type enum('pdf','epub') · path · size (bytes) · timestamps
```

### `submissions`

طلبات النشر قبل الموافقة. احفظها كاملةً مع `ip` و`user_agent`، وحوّلها إلى
`books` عند الموافقة من Filament.

### `contact_messages`

```
id · type · name · email · phone nullable · subject · message
book_title nullable · pages nullable · size nullable · copies jsonb nullable
ip · timestamps
```

`type` من: `general` · `publish_request` · `order` · `other` · `copyright` · `print_request`

### `password_reset_codes`

```
id · email · code (6 أرقام، مُجزّأ) · expires_at · used_at nullable · attempts
```

صلاحية ١٥ دقيقة، وحدّ أقصى ٥ محاولات، ثم يُبطَل الرمز.

---

## ٣ · شكل الرد — موحّد في كل مسار

```json
{ "success": true, "data": ..., "meta": { ... } }
```

الخطأ:

```json
{ "success": false, "message": "نصّ عربي يُعرض للمستخدم", "errors": { "field": ["..."] } }
```

⚠️ **`message` يُعرض للمستخدم مباشرةً** — اكتبه بالعربية ومفهوماً، لا `The given data was invalid`.

---

## ٤ · المسارات العامّة

### `GET /api/categories`

```json
{ "success": true, "data": [
  { "id": 1, "name": "الروايات والقصص الأدبية", "slug": "novels",
    "icon": "bx-book", "books_count": 4, "is_fallback": false,
    "children": [
      { "id": 11, "name": "روايات عربية", "slug": "arabic-novels",
        "books_count": 1, "is_fallback": false }
    ]}
]}
```

`books_count` يعدّ **الكتب المعتمَدة فقط**، وعدّاد الأب = كتبه المباشرة + كتب أبنائه.

### `GET /api/books`

معاملات تدعمها الواجهة: `q` · `category` (slug) · `author` (slug) ·
`type` · `sort` · `limit` · `per_page` · `page`

`sort` من: `latest` · `title` · `trending` (بـ`views_count`). **لا `rating` ولا `popular`.**

⚠️ **التصفية بقسم أب يجب أن تشمل كتب أبنائه** — وإلّا اختفت كتب «روايات عربية»
عند تصفّح «الروايات».

يُرجع **BookCard** — هذه الحقول لا غير:

```json
{ "success": true,
  "data": [{
    "id": 1, "slug": "rihla-fi-dhakirat-alwatan", "title": "رحلة في ذاكرة الوطن",
    "cover": null,
    "author":   { "id": 101, "name": "الطاهر وطار", "slug": "tahar-wattar" },
    "category": { "id": 11, "name": "روايات عربية", "slug": "arabic-novels" },
    "publication_type": "house_edition",
    "is_paid": false,
    "price": 900,
    "price_print": 900,
    "price_digital": null
  }],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 24, "total": 12 }
}
```

`is_paid` = هل من سعر؟ · `price` = `price_digital ?? price_print` (للعرض في الكرت).

### `GET /api/books/{slug}`

يقبل `slug` أو `id`. يُرجع BookCard مضافاً إليه:

```json
{ "success": true, "data": {
  "...": "كل حقول BookCard",
  "subtitle": null, "description": "…", "language": "ar",
  "pages": 248, "publication_year": 2024, "edition": "…", "isbn": "…",
  "published_at": "2026-01-14T10:00:00Z",
  "downloads_count": 1412, "views_count": 8930,

  "price_digital": null,
  "price_print": 900,
  "price_2": 1700, "price_3": 2400, "price_4": null,
  "sale_email": "author@example.dz",

  "files": [
    { "id": 22, "type": "pdf", "size": 4380000,
      "size_human": "4.2 MB", "url": "…" }
  ]
}}
```

- `size_human` **يُحسب في الخادم** — الواجهة تعرضه كما هو.
- `files[].url` اختياري: إن أُرسل استعملته الواجهة (مفيد للروابط الموقَّتة)،
  وإلّا رجعت إلى `/api/books/{id}/download/{fileId}`.
- كتاب `status != approved` → **404**، لا 403.

### `GET /api/authors`

```json
{ "success": true, "data": [
  { "id": 101, "name": "الطاهر وطار", "slug": "tahar-wattar",
    "photo": null, "title": "none", "books_count": 1 }
]}
```

### `GET /api/authors/{slug}`

نفس ما سبق + `bio` + `books` (مصفوفة BookCard).

🔒 **لا تُرجع** `email` ولا `phone` ولا `address` ولا `extra`. أبداً.

### `GET /api/books/{id}/download/{fileId}`

يُنزّل الملف ويزيد `downloads_count`.
يرفض إن كان `price_digital` موجوداً — النسخة الإلكترونية المدفوعة لا تُنزَّل من هنا.

---

## ٥ · استمارة النشر

### `POST /api/submissions` — `multipart/form-data`

| الحقل | النوع | مطلوب |
|---|---|---|
| `author_name` | نصّ | ✅ |
| `author_title` | `none\|professor\|doctor\|researcher` | — |
| `author_email` | بريد | ✅ |
| `author_phone` | نصّ | ✅ |
| `author_address` | نصّ | ✅ |
| `author_bio` | نصّ | ✅ |
| `author_extra` | نصّ | — |
| `author_photo` | صورة | — |
| `password` | نصّ، ٨ أحرف فأكثر | ✅ **للمؤلف الجديد وحده** |
| `book_title` | نصّ | ✅ |
| `book_description` | نصّ | ✅ |
| `category_id` | رقم | ✅ |
| `language` | `ar\|fr\|en` | — |
| `pages` | رقم ≥ ١ | ✅ |
| `publication_year` | رقم | — |
| `legal_deposit` | نصّ | ✅ |
| `cover` | صورة ≤ ٥ م.ب | ✅ **دائماً** |
| `file` | pdf/epub ≤ ٥٠ م.ب | — |
| `price_print` | رقم > ٠ | — |
| `price_digital` | رقم > ٠ | — |
| `price_2` `price_3` `price_4` | رقم > ٠ | — لا تُرسل إلا مع `price_print` |
| `sale_email` | بريد | ✅ **متى وُجد أي سعر** |
| `rights_confirmed` | `"1"` | ✅ |

**السلوك المطلوب:**

- **البريد مسجَّل سلفاً؟** أرجِع `422` برسالة صريحة:
  «هذا البريد له حساب — سجّل الدخول أولاً»، والواجهة تعرضها كما هي.
- **مؤلف جديد** → أنشئ `user` + `author`، **افتح الجلسة**، وأرجِع:

```json
{ "success": true, "data": { "user": { ...بيانات المؤلف } },
  "message": "وصل طلبك" }
```

الواجهة تعتمد هذا المستخدم فوراً وتُظهر «حسابي» في الهيدر. بدونه يظنّ المؤلف
أنّ الحساب لم يُنشأ.

- **مؤلف داخل** → لا يُرسل `password`، اربط الكتاب بحسابه.
- الكتاب يُحفظ `pending` **دائماً**.

---

## ٦ · المصادقة

Sanctum SPA بكوكي `httpOnly`. **لا `createToken`.**
الواجهة ترسل `credentials: "include"` و`X-XSRF-TOKEN`، ولا تخزّن أي رمز.

| المسار | الحمولة | الرد |
|---|---|---|
| `GET /api/auth/me` | — | `{data: user}` أو **401** للزائر |
| `POST /api/auth/login` | `email, password` | `{data: user}` · **401** بنصّ «البريد أو كلمة السرّ غير صحيحة» |
| `POST /api/auth/logout` | — | `{success:true}` |
| `POST /api/auth/password/forgot` | `email` | ⚠️ **نجاح دائماً** |
| `POST /api/auth/password/verify` | `email, code` | نجاح · **422** إن خطأ |
| `POST /api/auth/password/reset` | `email, code, password` | نجاح |
| `PUT /api/auth/profile` | `name, title, phone, address, bio, extra` | `{data: user}` |
| `POST /api/auth/password/change` | `current_password, password` | نجاح · **422** إن خطأ الحالية |

⚠️ **`password/forgot` يردّ نجاحاً حتى لو لم يوجد البريد.** لو ردّ «غير مسجّل»
صار النموذج أداةً مجّانية لمعرفة أي بريد له حساب في الدار.

⚠️ **`PUT /api/auth/profile` لا يقبل تغيير البريد** — هو هوية الحساب. تجاهله إن أُرسل.

شكل `user`:

```json
{ "id": 501, "name": "…", "email": "…", "title": "doctor",
  "phone": "…", "address": "…", "bio": "…", "extra": "",
  "photo": null, "slug": "…", "books_count": 1 }
```

هذا **الوحيد** الذي يحمل الحقول الخاصة، ويُرجَع لصاحبه فقط.

---

## ٧ · نماذج التواصل

### `POST /api/contact` — JSON

ثلاثة نماذج تستعمل نفس المسار وتتمايز بـ`type`:

**١ · تواصل عام** — `{ name, email, type, message }`
حيث `type` من `general` · `publish_request` · `order` · `other`

**٢ · بلاغ حقوق نشر** — `{ name, email, subject, message, type: "copyright" }`
`subject` = اسم الكتاب المُبلَّغ عنه.

**٣ · طلب طباعة** — `type: "print_request"`

```json
{ "type": "print_request", "name": "…", "email": "…", "phone": "…",
  "subject": "طلب طباعة: …", "message": "…",
  "book_title": "…", "pages": 240,
  "size": "A4",
  "copies": [100, 500, 1000] }
```

⚠️ **نقطتان تُسقطان كل طلب طباعة إن فاتتا:**

- `copies` **مصفوفة** من ١ إلى ٣ أعداد. `'copies' => 'integer'` يرفض كل طلب.
- `size` من ثلاث قيم فقط: `A4` · `A5` · `16x24`.

طلب الطباعة **بلا مرفقات** — JSON عادي، لا `multipart`.

---

## ٨ · الأمان — أهمّ قسم في هذا الملف

نموذج الشراء: **الدار ليست وسيطاً**. القارئ يراسل المؤلف على `sale_email` مباشرةً،
ولا مال يمرّ عبر الموقع.

هذا يخلق ثغرة **لا تحلّها الواجهة**: استمارة النشر مفتوحة، فيستطيع أي شخص رفع كتاب
باسم مؤلف معروف ووضع بريده هو. الحواجز الأربعة كلّها عندك:

**١ — المراجعة شرط برمجي لا عادة إدارية**

```php
Book::where('status', 'approved')   // في كل استعلام عام بلا استثناء
```

استعمل Global Scope حتى لا يُنسى السطر في استعلام واحد. **هذا أهمّ سطر في المشروع.**

**٢ — تأكيد بريد البيع**

`sale_email` لا يُنشر حتى يُؤكَّد برمز يصل إليه.

**٣ — تقييد المعدّل**

`throttle` على `/api/submissions` و`/api/contact` و`/api/auth/login`
و`/api/auth/password/forgot`، مع تسجيل IP في كل طلب.

**٤ — التحقّق في الخادم**

كل ما تتحقّق منه الواجهة يُعاد التحقّق منه هنا: صيغة البريد، حدود الملفات،
أنواعها، الأسعار الموجبة، أسعار الجملة الأقلّ من ضرب العدد.

**البريد بالذات:** الواجهة ترفض ما فيه `& = ? / \ < > " '` أو مسافات، لأنّ بريداً
مثل `x@y.com&bcc=attacker@evil.com` كان يمكن أن يهرّب معاملاً إلى رابط Gmail.
**طبّق نفس الصرامة هنا.**

---

## ٩ · لوحة Filament

- **مراجعة الطلبات** — الأهمّ. عرض بيانات المؤلف والكتاب والملفات، مع قبول ورفض
  وسبب الرفض. القبول ينشئ `book` بحالة `approved`.
- إدارة الكتب والمؤلفين والأقسام.
- **إنشاء مؤلف بلا حساب** — للمؤلفين القدامى.
- رسائل التواصل مع فلترة بـ`type`.

الدار **لا تنشئ حسابات مؤلفين** — تراقبها فقط. الحسابات تُولد من استمارة النشر وحدها.

---

## ١٠ · ما لا يُبنى — اقرأ هذا مرّتين

هذه ليست نواقص، بل **قرارات عميل صريحة**. بناء أيٍّ منها عملٌ مرفوض:

- ❌ **التقييمات والمراجعات** — لا جداول، لا حقول، لا `ratings_avg`، لا `sort=rating`.
- ❌ **حسابات القرّاء** — لا تسجيل ولا مفضّلة على الخادم. `localStorage` فقط.
- ❌ **`POST /api/register`** — الحساب يُولد من `/api/submissions`.
- ❌ **الدخول بجوجل أو فيسبوك** — لا OAuth ولا `provider_id`.
- ❌ **الدخول بالهاتف أو OTP** — البريد هوية وحيدة.
- ❌ **رموز في `localStorage`** — كوكي `httpOnly` فقط.
- ❌ **بوّابة دفع** — لا Stripe ولا CIB ولا أي تكامل. المعاملة خارج الموقع.
- ❌ **حقل حالة الإتاحة** — تُستنتج من الملف والسعر.
- ❌ **حقل `price` مفرد** — سعران منفصلان.
- ❌ **`nationality` أو `birth_year` أو `death_year`** — لا تُجمع ولا تُعرض.
- ❌ **صفحة `library.html`** — دُمجت في `index.html`.
- ❌ **رفع الغلاف أو الملف في طلب الطباعة** — حُذفا من الاستمارة.

---

## ١١ · ترتيب العمل المقترح

1. الهجرات والنماذج والعلاقات
2. `GET /api/categories` و`/api/books` و`/api/books/{slug}` — بها تحيا الواجهة
3. `/api/authors` و`/api/authors/{slug}`
4. المصادقة الثمانية
5. `POST /api/submissions` مع إنشاء الحساب
6. `POST /api/contact` بأنواعه الثلاثة
7. Filament — المراجعة أولاً
8. الأمان: Global Scope ثم التقييد ثم تأكيد البريد

**بعد كل مرحلة:** غيّري `MOCK: false` في `Front-Bouthaina/assets/js/api.js` وجرّبي
الصفحات على الخادم الحقيقي. إن انكسر شيء، فالسبب اختلاف في اسم حقل أو شكل رد —
راجعي هذا الملف، لا الواجهة.

---

## ملاحظة أخيرة إلى كلود

إن وجدت في هذه المواصفة تناقضاً، أو رأيت أنّ قراراً هنا خاطئ تقنياً،
**قله صراحةً قبل أن تبني**. لكن لا تصلحه من عندك ولا تضف ما ليس مذكوراً:
الواجهة مكتملة، وكل حرية تأخذها هنا تكسر شيئاً هناك.
