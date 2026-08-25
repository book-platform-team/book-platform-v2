/* ========================================
   ⚙️ مكتبة سامي الرقمية — طبقة الاتصال بالـ API
   ملف واحد لكل الطلبات. لا تُكتب fetch مباشرة في أي ملف آخر.
   ======================================== */

const API = {
  BASE: "",         // فارغ = نفس الدومين
  MOCK: false,       // ⭐ true = يقرأ من /mocks   |   false = يقرأ من السيرفر
  mockSend: null,   // معالج اختياري لمحاكاة الطلبات (يسجّله auth.js)
};


/* ========================================
   📨 الترويسات والجلسة
   ----------------------------------------
   🔒 الجلسة كوكي httpOnly عبر Sanctum — لا رمز
      في localStorage ولا ترويسة Authorization.

      السبب: الرمز المخزَّن في localStorage يقرؤه
      الجافاسكريبت، فثغرة XSS واحدة تكفي لسرقته.
      الكوكي httpOnly لا يصل إليه الجافاسكريبت
      أصلاً، فلا يُسرق بهذه الطريقة.

      وهذا يعني أنّ الواجهة لا تحمل شيئاً سرّياً
      إطلاقاً: كل الطلبات ترسل الكوكي وحدها بفضل
      credentials: "include".
   ======================================== */

function headers() {
  return {
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
}

/* Sanctum يطلب رمز CSRF في كل طلب يغيّر البيانات.
   يُقرأ من كوكي XSRF-TOKEN التي يضعها الخادم. */
function csrfToken() {
  const hit = document.cookie
    .split("; ")
    .find(c => c.startsWith("XSRF-TOKEN="));
  return hit ? decodeURIComponent(hit.split("=")[1]) : "";
}

/* تُستدعى مرة قبل أول طلب يغيّر البيانات */
let _csrfReady = false;

async function ensureCsrf() {
  if (API.MOCK || _csrfReady) return;
  try {
    await fetch(API.BASE + "/sanctum/csrf-cookie", { credentials: "include" });
    _csrfReady = true;
  } catch (e) {
    console.warn("تعذّر جلب كوكي CSRF:", e);
  }
}


/* ========================================
   🗂️ تحويل مسار الـAPI إلى ملف mock
   ----------------------------------------
   /books                    →  /mocks/books.json
   /books/demo               →  /mocks/books_demo.json
   /books/demo/reviews?page=1→  /mocks/books_demo_reviews.json
   /user/profile             →  /mocks/user_profile.json
   ======================================== */

function mockPath(path) {
  const clean = path
    .split("?")[0]          // ✅ إزالة ?page=1 وغيرها
    .replace(/^\/+/, "")    // ✅ إزالة الشرطة الأولى
    .replace(/\/+$/, "")    // إزالة شرطة الآخر إن وُجدت
    .replace(/\//g, "_");   // تحويل باقي الشرطات إلى _

  return `/mocks/${clean}.json`;
}


/* ========================================
   🖼️ مسار الملفات المرفوعة
   ----------------------------------------
   Laravel يخزّن في storage/app/public ويعرضه
   على /storage. وقد يُرجع المسار نسبياً
   («covers/x.jpg») فيطلبه المتصفّح من جذر
   الصفحة — /covers/x.jpg — ولا يجده.

   نُصلحه هنا مرّة واحدة بدل أن نكرّر الإصلاح
   في كل موضع يعرض صورة.

   ⚠️ الأصحّ أن يرسله الخادم كاملاً بـStorage::url()
      — هذه شبكة أمان لا بديل عنه.
   ======================================== */

function fileUrl(path) {
    const p = String(path || "").trim();
    if (!p) return "";

    // رابط كامل أو مسار مطلق سليم — يُترك كما هو
    if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
    if (p.startsWith("data:")) return p;

    return "/storage/" + p.replace(/^storage\//, "");
}

/** يمرّ على الردّ ويُصلح كل مسار صورة أو ملف */
function fixPaths(json) {
    if (API.MOCK || !json) return json;

    const walk = (o) => {
        if (Array.isArray(o)) return o.forEach(walk);
        if (!o || typeof o !== "object") return;

        for (const k of ["cover", "photo", "url"]) {
            if (typeof o[k] === "string" && o[k]) o[k] = fileUrl(o[k]);
        }
        Object.values(o).forEach(walk);
    };

    walk(json.data);
    return json;
}


/* ========================================
   📥 القراءة
   ======================================== */

async function apiGet(path) {
  const url = API.MOCK ? mockPath(path) : API.BASE + "/api" + path;

  const res = await fetch(url, {
    headers: headers(),
    credentials: "include",   // الجلسة كوكي — لا بدّ من إرسالها
  });

  if (!res.ok) {
    throw {
      status: res.status,
      message: res.status === 404 ? "غير موجود" : `خطأ ${res.status}`
    };
  }

  const json = await res.json();

  // في وضع mock نطبّق الفلترة والترتيب محلياً
  // حتى تتصرّف الملفات الثابتة كأنها API حقيقي،
  // وتصبح كل الحالات (فارغ · نتائج · ترتيب) قابلة للاختبار الآن.
  if (!API.MOCK) return fixPaths(json);

  if (path.includes("category=")) await ensureCatTree();
  return applyMockQuery(path, json);
}


/* ========================================
   🌳 شجرة التصنيفات (وضع mock فقط)
   ----------------------------------------
   نحفظها مرة واحدة لنعرف فروع كل قسم،
   فالفلترة بقسم أب يجب أن تشمل كتب فروعه.
   ======================================== */

let _catTree = null;

async function ensureCatTree() {
  if (_catTree) return _catTree;
  try {
    const res = await fetch("/mocks/categories.json");
    const json = await res.json();
    _catTree = json.data || [];
  } catch {
    _catTree = [];
  }
  return _catTree;
}

/** يرجّع سلاگ القسم وكل فروعه */
function categoryFamily(slug) {
  const cats = _catTree || [];

  const parent = cats.find(c => c.slug === slug);
  if (parent) {
    return [slug, ...(parent.children || []).map(c => c.slug)];
  }

  return [slug];   // فرع — يُفلتر بنفسه فقط
}


/* ========================================
   🧪 محاكاة الفلترة في وضع mock
   ----------------------------------------
   يدعم: q · category · author · type · sort · limit
   ======================================== */

function applyMockQuery(path, json) {
  const qIndex = path.indexOf("?");
  if (qIndex === -1) return json;
  if (!Array.isArray(json?.data)) return json;

  const params = new URLSearchParams(path.slice(qIndex + 1));
  let data = [...json.data];

  /* ---------- بحث نصّي ---------- */
  const q = params.get("q");
  if (q) {
    const needle = q.trim().toLowerCase();
    data = data.filter(item => {
      const title  = (item.title || item.name || "").toLowerCase();
      const author = (item.author?.name || "").toLowerCase();
      return title.includes(needle) || author.includes(needle);
    });
  }

  /* ---------- تصنيف ----------
     القسم الأب يشمل كتب فروعه — وإلا اختفت
     كتب "روايات عربية" عند تصفّح "الروايات". */
  const category = params.get("category");
  if (category) {
    const family = categoryFamily(category);
    data = data.filter(item => family.includes(item.category?.slug));
  }

  /* ---------- مؤلف ---------- */
  const author = params.get("author");
  if (author) {
    data = data.filter(item => item.author?.slug === author);
  }

  /* ---------- نوع الإصدار ---------- */
  const type = params.get("type");
  if (type) {
    data = data.filter(item => item.publication_type === type);
  }

  /* ---------- رف المكتبة ---------- */
  const shelf = params.get("shelf");
  if (shelf === "favorites") {
    data = data.filter(item => item.is_favorite);
  } else if (shelf) {
    data = data.filter(item => item.shelf === shelf);
  }

  /* ---------- الترتيب ----------
     أُزيل sort=rating و sort=popular: كانا يعتمدان
     على ratings_avg و ratings_count، وقد ألغى العميل
     التقييمات فلم تعد الحقول موجودة أصلاً. ترتيبٌ
     بحقلٍ غير موجود يُرجع القائمة كما هي بصمت. */
  const sort = params.get("sort");
  if (sort === "trending") {
    data.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  } else if (sort === "title") {
    data.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "ar"));
  } else if (sort === "latest") {
    data.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  /* ---------- حد أقصى ---------- */
  const limit = parseInt(params.get("limit"), 10);
  if (limit > 0) data = data.slice(0, limit);

  /* ---------- تحديث meta ---------- */
  const meta = json.meta
    ? { ...json.meta, total: data.length, last_page: 1, current_page: 1 }
    : undefined;

  return { ...json, data, ...(meta ? { meta } : {}) };
}


/* ========================================
   📤 الإرسال
   ======================================== */

async function apiSend(method, path, body, isForm) {

  if (API.MOCK) {
    console.info(`[MOCK] ${method} ${path}`, body);
    await delay(400);   // محاكاة زمن الشبكة

    /* بعض المسارات تحتاج ردّاً حقيقياً لا نجاحاً صامتاً:
       تسجيل الدخول يجب أن يفشل بكلمة سرّ خاطئة، وإلّا
       لم نستطع اختبار حالات الخطأ أصلاً. auth.js يسجّل
       معالجاً هنا، ويبقى الباقي على النجاح الصامت. */
    if (typeof API.mockSend === "function") {
      const hit = await API.mockSend(method, path, body);
      if (hit) {
        if (hit.ok === false) throw hit.json;
        return hit.json;
      }
    }

    return { success: true, data: null, message: "وضع تجريبي — لم يُرسل شيء" };
  }

  await ensureCsrf();

  const opts = { method, headers: headers(), credentials: "include" };

  const xsrf = csrfToken();
  if (xsrf) opts.headers["X-XSRF-TOKEN"] = xsrf;

  if (isForm) {
    opts.body = body;   // FormData: المتصفح يضبط Content-Type وحده
  } else {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res  = await fetch(API.BASE + "/api" + path, opts);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw json;
  return json;
}

function apiPost(path, body, isForm) { return apiSend("POST",   path, body, isForm); }
function apiPut(path, body)          { return apiSend("PUT",    path, body); }
function apiDelete(path)             { return apiSend("DELETE", path); }


/* ========================================
   🔧 مساعد
   ======================================== */

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}