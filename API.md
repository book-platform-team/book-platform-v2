# API.md — العقد بين الفرونت والباك
**مشروع:** منصة سامي للطباعة والنشر والتوزيع
**النسخة:** 1.1 — **معتمَدة** (حُسمت نقطتا المؤلف والتصنيف)
**القاعدة:** هذا الملف هو المرجع. أي خلاف بين الفرونت والباك يُحسم هنا. أي تغيير يُناقش قبل تنفيذه.

---

## قواعد عامة

- **Base URL:** `/api` (نسبي — نفس الدومين، لا `localhost:8000` في أي مكان)
- **المصادقة:** Sanctum Bearer token في الهيدر
  ```
  Authorization: Bearer {token}
  Accept: application/json
  ```
- **لوحة الأدمن ليست في هذا الملف** — Filament يتعامل مع الـ Models مباشرة على `/admin`، بلا API.
- **كل endpoint عام يعيد الكتب المنشورة فقط** (`status = 'published'`).

### شكل الرد — موحَّد بلا استثناء

**نجاح:**
```json
{ "success": true, "data": { } }
```

**نجاح مع صفحات:**
```json
{
  "success": true,
  "data": [ ],
  "meta": { "current_page": 1, "last_page": 8, "per_page": 12, "total": 94 }
}
```

**خطأ:**
```json
{ "success": false, "message": "رسالة للمستخدم بالعربية", "errors": { "email": ["..."] } }
```

### أكواد الحالة

| الكود | المعنى |
|---|---|
| 200 | نجاح |
| 201 | أُنشئ |
| 401 | غير مسجَّل / توكن منتهٍ |
| 403 | مسجَّل لكن ممنوع |
| 404 | غير موجود |
| 422 | خطأ تحقّق (`errors` موجود) |
| 429 | تجاوز الحد |

---

## 1. المصادقة

### `POST /api/register`

```json
{
  "name": "بثينة",
  "gender": "female",
  "birth_date": "2003-05-14",
  "email": "b@example.com",
  "phone": null,
  "password": "********",
  "password_confirmation": "********"
}
```
> ⚠️ الفرونت يرسل `birth_date` والعمود في القاعدة `birthdate`. **قرار: الباك يقبل `birth_date` في الطلب ويخزّنه في `birthdate`.** لا تغيير في الفرونت.
> ⚠️ إما `email` أو `phone` مطلوب — وليس كلاهما اختيارياً كما هو الآن.

**201:**
```json
{
  "success": true,
  "data": {
    "token": "1|xxxxxxxxxxxxx",
    "user": { "id": 5, "name": "بثينة", "email": "b@example.com", "phone": null, "role": "reader", "avatar": null }
  }
}
```

### `POST /api/login`

```json
{ "email": "b@example.com", "password": "********" }
```
أو `{ "phone": "+213 555000000", "password": "..." }`

**200:** نفس شكل رد التسجيل.
**401:** `{ "success": false, "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة" }`

### `POST /api/logout` 🔒
**200:** `{ "success": true, "data": null }`

### `GET /api/me` 🔒
```json
{ "success": true, "data": { "id": 5, "name": "بثينة", "email": "...", "role": "author", "avatar": null, "author_id": 12 } }
```

---

## 2. الصفحة الرئيسية

### `GET /api/home`

endpoint واحد يغذّي `index.html` كاملة — بدل 5 طلبات.

```json
{
  "success": true,
  "data": {
    "latest": [ Book, ... ],
    "featured": [ Book, ... ],
    "house_editions": [ Book, ... ],
    "categories": [ Category, ... ],
    "authors": [ Author, ... ],
    "stats": { "books": 84, "authors": 21, "downloads": 15230 }
  }
}
```

---

## 3. الكتب

### `GET /api/books`

> ⚠️ **قاعدة التصنيف الشجري:** عند تمرير `category` لقسم **رئيسي**،
> يجب أن يشمل الردّ كتب القسم **وكتب كل فروعه**.
>
> مثال: `?category=novels` يُرجع كتب «الروايات» و«روايات عربية»
> و«روايات عالمية» و«قصص قصيرة».
>
> بدون ذلك يختفي كتاب مصنَّف في فرعٍ عند تصفّح أبيه، ويبدو القسم فارغاً.
> أما تمرير سلاگ فرع فيُرجع كتب ذلك الفرع وحده.

**باراميترات:**

| الاسم | القيم | افتراضي |
|---|---|---|
| `q` | نص بحث | — |
| `category` | slug التصنيف | — |
| `author` | slug المؤلف | — |
| `type` | `house_edition` \| `author_submission` | الكل |
| `sort` | `latest` \| `popular` \| `rating` \| `title` | `latest` |
| `page` | رقم | 1 |
| `per_page` | رقم (≤48) | 12 |

**200:** مصفوفة `BookCard` + `meta`.

**`BookCard`** — النسخة المختصرة للشبكات:
```json
{
  "id": 7,
  "slug": "ayyam-al-jazair",
  "title": "أيام الجزائر",
  "cover": "/storage/covers/xxx.jpg",
  "author": { "id": 3, "name": "الطاهر وطار", "slug": "tahar-wattar" },
  "category": { "id": 1, "name": "الروايات والقصص الأدبية", "slug": "novels" },
  "ratings_avg": 4.6,
  "ratings_count": 18,
  "publication_type": "house_edition"
}
```
> `cover` قد يكون `null` — الفرونت يعرض placeholder.

### `GET /api/books/{slug}`

**200 — `BookFull`:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "slug": "ayyam-al-jazair",
    "title": "أيام الجزائر",
    "subtitle": null,
    "description": "نص الوصف...",
    "cover": "/storage/covers/xxx.jpg",
    "author": { "id": 3, "name": "الطاهر وطار", "slug": "tahar-wattar", "photo": null },
    "category": { "id": 1, "name": "الروايات والقصص الأدبية", "slug": "novels" },
    "language": "ar",
    "pages": 240,
    "publication_year": 2024,
    "edition": "الطبعة الثانية",
    "isbn": "978-9947-...",
    "publication_type": "house_edition",
    "published_at": "2026-01-14T10:00:00Z",
    "downloads_count": 412,
    "views_count": 1930,
    "ratings_avg": 4.6,
    "ratings_count": 18,
    "files": [
      { "id": 22, "type": "pdf", "size": 4380000, "size_human": "4.2 MB" }
    ],
    "my_rating": 5
  }
}
```
> `my_rating` = تقييم المستخدم الحالي، أو `null` إن لم يسجّل / لم يقيّم.
> **ملاحظة:** `files` لا تحتوي على `path` أبداً. التحميل يمرّ عبر endpoint مخصص.

### `GET /api/books/{id}/similar?limit=4`
**200:** مصفوفة `BookCard`.

### `GET /api/books/{id}/download/{file_id}` 🔒

يزيد العدّاد ثم يعيد الملف (`Content-Disposition: attachment`).

| الكود | الحالة |
|---|---|
| 401 | غير مسجَّل — **التحميل يتطلّب حساباً** |
| 403 | الكتاب ليس `published` |
| 404 | الملف غير موجود |

> الواجهة تعرض زر التنزيل للجميع، لكنها توجّه غير المسجَّل
> إلى `login.html?redirect=` بدل استدعاء هذا الـendpoint.

### `POST /api/books` 🔒 — إرسال كتاب من مؤلف

`multipart/form-data`:

| الحقل | النوع | إجباري |
|---|---|---|
| `title` | نص | ✅ |
| `description` | نص | ✅ |
| `category_id` | رقم | ✅ **يختاره المؤلف — تصنيف واحد فقط** |
| `author_name` | نص | ✅ (إن لم يكن للمستخدم `author_id`) |
| `cover` | ملف صورة | ❌ |
| `files[]` | ملفات pdf/epub | ✅ واحد على الأقل — **حد 50 MB للملف** |

**201:**
```json
{ "success": true, "data": { "id": 31, "status": "pending", "message": "تم إرسال كتابك، سيُراجَع خلال أيام" } }
```
> يُنشأ دائماً بـ `status = 'pending'` و `publication_type = 'author_submission'`. المستخدم **لا يستطيع** تحديدهما.

### `GET /api/my/books` 🔒 — كتب المؤلف وحالتها

```json
{
  "success": true,
  "data": [
    { "id": 31, "title": "...", "status": "pending",   "submitted_at": "...", "rejection_reason": null },
    { "id": 28, "title": "...", "status": "rejected",  "submitted_at": "...", "rejection_reason": "جودة الملف غير كافية" },
    { "id": 19, "title": "...", "status": "published", "published_at": "..." }
  ]
}
```

---

## 4. التقييمات

### `POST /api/books/{id}/rate` 🔒
```json
{ "value": 5 }
```
**200:** `{ "success": true, "data": { "ratings_avg": 4.7, "ratings_count": 19, "my_rating": 5 } }`
> إن كان المستخدم قد قيّم سابقاً → يُحدَّث، لا يُضاف سجل جديد.

---

## 5. المراجعات

### `GET /api/books/{id}/reviews?page=1`
```json
{
  "success": true,
  "data": [
    {
      "id": 91,
      "content": "نص المراجعة",
      "helpful_count": 4,
      "created_at": "2026-02-11T09:00:00Z",
      "user": { "id": 5, "name": "بثينة", "avatar": null },
      "rating": 5
    }
  ],
  "meta": { "current_page": 1, "last_page": 3, "total": 27 }
}
```
> المراجعات المعروضة هي `approved` فقط.

### `POST /api/books/{id}/reviews` 🔒
```json
{ "content": "نص المراجعة" }
```
**201:**
```json
{ "success": true, "data": { "id": 92, "status": "pending" },
  "message": "شكراً لك، ستظهر مراجعتك بعد المراجعة" }
```
> ⚠️ **مهم للفرونت:** المراجعة **لا تظهر فوراً**. اعرضي رسالة "قيد المراجعة" بدل إضافتها للقائمة.

### `POST /api/reviews/{id}/helpful` 🔒
**200:** `{ "success": true, "data": { "helpful_count": 5 } }`

---

## 6. الاقتباسات

### `GET /api/books/{id}/quotes`
```json
{
  "success": true,
  "data": [
    { "id": 44, "content": "نص الاقتباس", "page": 87, "likes_count": 12,
      "user": { "id": 5, "name": "بثينة" }, "created_at": "..." }
  ]
}
```

### `POST /api/books/{id}/quotes` 🔒
```json
{ "content": "نص الاقتباس", "page": 87 }
```
**201:** نفس منطق المراجعات — `status: pending` + رسالة.

---

## 7. المؤلفون

### `GET /api/authors?q=&page=`
```json
{
  "success": true,
  "data": [
    { "id": 3, "name": "الطاهر وطار", "slug": "tahar-wattar", "photo": null,
      "books_count": 6, "is_house_author": true }
  ],
  "meta": { }
}
```

### `GET /api/authors/{slug}`
```json
{
  "success": true,
  "data": {
    "id": 3, "name": "الطاهر وطار", "slug": "tahar-wattar",
    "bio": "...", "photo": null, "nationality": "الجزائر",
    "birth_year": 1936, "death_year": 2010,
    "is_house_author": true, "books_count": 6,
    "books": [ BookCard, ... ]
  }
}
```

---

## 8. التصنيفات

### `GET /api/categories`
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "الروايات والقصص الأدبية", "slug": "novels",
      "icon": "bx-book", "books_count": 23,
      "children": [ { "id": 9, "name": "الرواية الجزائرية", "slug": "algerian-novel", "books_count": 7 } ] }
  ]
}
```

---

## 9. الملف الشخصي

### `GET /api/user/profile` 🔒
```json
{
  "success": true,
  "data": {
    "id": 5, "name": "بثينة", "email": "...", "phone": null,
    "birthdate": "2003-05-14", "gender": "female",
    "role": "author", "avatar": null,
    "stats": { "books_count": 3, "avg_rating": 4.5, "views_count": 820 }
  }
}
```

### `PUT /api/user/profile` 🔒
```json
{ "name": "...", "email": "...", "phone": "...", "avatar": "(ملف)" }
```

### `POST /api/user/become-author` 🔒
طلب ترقية من قارئ إلى مؤلف.
**200:** `{ "success": true, "data": { "role": "author" } }`
> **قرار مطلوب مع صاحبة المشروع:** هل الترقية فورية أم تحتاج موافقة أدمن؟ إن كانت بموافقة، الرد يكون `{ "status": "pending" }` والحسم في Filament.

---

## 10. مكتبتي

### `GET /api/my/library?shelf=` 🔒

`shelf` = `want_to_read` | `reading` | `read` — أو `favorites` للمفضّلة.

**200:** مصفوفة `BookCard` مع حقلين إضافيين لكل كتاب:
```json
{
  "id": 7, "slug": "...", "title": "...",
  "shelf": "reading",
  "is_favorite": true
}
```

### `PUT /api/my/library` 🔒 — إضافة أو نقل

```json
{ "book_id": 7, "shelf": "reading" }
```

> ⚠️ **`PUT` لا `POST`** — العملية idempotent: إن لم يكن الكتاب في
> المكتبة يُضاف، وإن كان يُنقل إلى الرف الجديد.
> الرف حالة واحدة، فلا يوجد «إضافة إلى رف ثانٍ».

**200:** `{ "success": true, "data": { "book_id": 7, "shelf": "reading" } }`

### `PUT /api/my/library/{book_id}/favorite` 🔒

```json
{ "is_favorite": true }
```

مستقلّ تماماً عن الرف — يمكن أن يكون الكتاب مفضّلاً في أي رف،
أو مفضّلاً دون أن يكون في المكتبة أصلاً (يُنشأ السجل بـ`shelf = want_to_read`).

**200:** `{ "success": true, "data": { "is_favorite": true } }`

### `DELETE /api/my/library/{book_id}` 🔒

يزيل الكتاب من المكتبة كلياً. لا حاجة لتمرير `shelf`.

---

## 11. الإشعارات

### `GET /api/notifications/count` 🔒
```json
{ "success": true, "data": { "unread": 3 } }
```

### `GET /api/notifications?page=1` 🔒
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "type": "BookApproved", "title": "تم نشر كتابك",
      "body": "كتابك «أيام الجزائر» أصبح منشوراً",
      "link": "/book.html?slug=ayyam-al-jazair",
      "read_at": null, "created_at": "..." }
  ]
}
```

### `POST /api/notifications/{id}/read` 🔒
### `POST /api/notifications/read-all` 🔒

---

## 12. تواصل مع الدار

### `POST /api/contact`
```json
{
  "name": "...", "email": "...", "phone": "...",
  "type": "publish_request",
  "subject": "...", "message": "..."
}
```
**201:** `{ "success": true, "data": null, "message": "تم استلام رسالتك، سنتواصل معك قريباً" }`
> يحتاج **throttle** (`throttle:5,60`) و **honeypot** — نموذج عام مفتوح للسبام.

---

## ملخص الـ Endpoints

| # | Method | Path | 🔒 |
|---|---|---|---|
| 1 | POST | `/api/register` | |
| 2 | POST | `/api/login` | |
| 3 | POST | `/api/logout` | 🔒 |
| 4 | GET | `/api/me` | 🔒 |
| 5 | GET | `/api/home` | |
| 6 | GET | `/api/books` | |
| 7 | GET | `/api/books/{slug}` | |
| 8 | GET | `/api/books/{id}/similar` | |
| 9 | GET | `/api/books/{id}/download/{file_id}` | |
| 10 | POST | `/api/books` | 🔒 |
| 11 | GET | `/api/my/books` | 🔒 |
| 12 | POST | `/api/books/{id}/rate` | 🔒 |
| 13 | GET | `/api/books/{id}/reviews` | |
| 14 | POST | `/api/books/{id}/reviews` | 🔒 |
| 15 | POST | `/api/reviews/{id}/helpful` | 🔒 |
| 16 | GET | `/api/books/{id}/quotes` | |
| 17 | POST | `/api/books/{id}/quotes` | 🔒 |
| 18 | GET | `/api/authors` | |
| 19 | GET | `/api/authors/{slug}` | |
| 20 | GET | `/api/categories` | |
| 21 | GET | `/api/user/profile` | 🔒 |
| 22 | PUT | `/api/user/profile` | 🔒 |
| 23 | POST | `/api/user/become-author` | 🔒 |
| 24 | GET | `/api/my/library?shelf=` | 🔒 |
| 25 | PUT | `/api/my/library` | 🔒 |
| 26 | PUT | `/api/my/library/{book_id}/favorite` | 🔒 |
| 27 | DELETE | `/api/my/library/{book_id}` | 🔒 |
| 27 | GET | `/api/notifications/count` | 🔒 |
| 28 | GET | `/api/notifications` | 🔒 |
| 29 | POST | `/api/notifications/{id}/read` | 🔒 |
| 30 | POST | `/api/notifications/read-all` | 🔒 |
| 31 | POST | `/api/contact` | |

**31 endpoint. لا يوجد `/api/admin/*` — Filament يتولّى ذلك.**

> ⛔ **تسجيل الدخول بجوجل مؤجَّل بقرار.** يُحذف `SocialAuthController`
> وحقوله وروتاته من الكود الآن. إن أُعيد لاحقاً، يُضاف إلى هذا العقد أولاً.

---

## ✅ قرارات محسومة

| # | القرار | التاريخ |
|---|---|---|
| 1 | `authors` منفصل عن `users` — الكتاب يرتبط بـ`author_id` | 1 أوت 2026 |
| 2 | **تصنيف واحد لكل كتاب** — `category` كائن مفرد لا مصفوفة | 1 أوت 2026 |
| 3 | المؤلف يختار التصنيف عند الرفع (`category_id` مطلوب) | 1 أوت 2026 |
| 4 | الترقية إلى مؤلف **فورية** بلا موافقة أدمن | 1 أوت 2026 |
| 5 | الترقية في اتجاه واحد — لا رجوع من مؤلف إلى قارئ | 1 أوت 2026 |
| 6 | المراجعات والاقتباسات تُراجَع قبل الظهور | 1 أوت 2026 |
| 7 | لوحة الأدمن بـ Filament — لا `/api/admin/*` | 1 أوت 2026 |
| 8 | **التحميل يتطلّب تسجيل دخول** 🔒 | 1 أوت 2026 |
| 9 | **عدّاد التحميلات ظاهر للعموم** | 1 أوت 2026 |
| 10 | **حد حجم الملف: 50 MB** | 1 أوت 2026 |
| 11 | **تسجيل جوجل مؤجَّل — يُحذف من الكود الآن** | 1 أوت 2026 |
| 12 | **رف واحد لكل كتاب** — النقل `PUT` لا `POST`+`DELETE` | 1 أوت 2026 |
| 13 | **`is_favorite` مستقلّ عن الرف** | 1 أوت 2026 |
| 14 | **القسم الأب يشمل كتب فروعه في الفلترة** | 2 أوت 2026 |

> ⚠️ الحقل `category` في كل الردود **كائن مفرد**:
> ```json
> "category": { "id": 1, "name": "التاريخ", "slug": "history" }
> ```
> وليس مصفوفة. الواجهة كلها مبنية على هذا.

---

---

## 🔖 متطلّبات SEO من الخادم

الواجهة صفحات ثابتة، ووسوم المشاركة تُقرأ من HTML **قبل** تشغيل
الجافاسكريبت. لذلك لا يمكن للواجهة وحدها أن تجعل بطاقة المشاركة
خاصّة بكل كتاب — يجب أن يولّدها الخادم.

### 1. وسوم ديناميكية لصفحتَي الكتاب والمؤلف

عندما يُطلب `/book.html?slug=x` من زاحف (واتساب · فيسبوك · جوجل)،
يجب أن يحقن الخادم في `<head>`:

```html
<meta property="og:title"       content="{عنوان الكتاب} — {اسم المؤلف}">
<meta property="og:description" content="{أول 155 حرفاً من الوصف}">
<meta property="og:image"       content="{رابط الغلاف الكامل}">
<meta property="og:url"         content="{الرابط الكامل}">
<link rel="canonical"           href="{الرابط الكامل}">
```

ونفس الشيء لـ`/author-profile.html?slug=x`.

> **بدون هذا:** كل روابط الكتب تظهر في واتساب ببطاقة واحدة عامّة —
> وهو ما يُفقد المشاركة قيمتها، والمشاركة جزء من عمل دار النشر.

### 2. خريطتا موقع ديناميكيتان

| الملف | المحتوى |
|---|---|
| `/sitemap-books.xml` | كل كتاب `published` مع `published_at` كـ`lastmod` |
| `/sitemap-authors.xml` | كل مؤلف له كتاب منشور |

و`/sitemap.xml` الثابتة موجودة في الواجهة وتغطّي الصفحات العامّة.

### 3. صفحة 404

`404.html` جاهزة في الواجهة. يربطها الخادم عبر `.htaccess`:

```apache
ErrorDocument 404 /404.html
```

---

## ⏳ نقاط تنتظر العميل

| # | المطلوب | يعطّل |
|---|---|---|
| 1 | نصوص: من نحن · الرسالة · الرؤية · شروط النشر | `about.html` |
| 2 | بيانات التواصل الحقيقية | الفوتر و `about.html` |
| 3 | أغلفة 5-6 كتب | مظهر المكتبة |
| 4 | شعار بجودة عالية | كل الصفحات |
| 5 | مراجعة شروط النشر قانونياً | النشر |

> **كل القرارات التقنية محسومة.** لم يبقَ ما يعطّل الخادم.