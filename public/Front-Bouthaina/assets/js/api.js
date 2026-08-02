/* ========================================
   ⚙️ مكتبة سامي الرقمية — طبقة الاتصال بالـ API
   ملف واحد لكل الطلبات. لا تُكتب fetch مباشرة في أي ملف آخر.
   ======================================== */

const API = {
  BASE: "",      // فارغ = نفس الدومين
  MOCK: true,    // ⭐ true = يقرأ من /mocks   |   false = يقرأ من السيرفر
};


/* ========================================
   🔐 المصادقة
   ======================================== */

function authToken() {
  return localStorage.getItem("auth_token");
}

function isLoggedIn() {
  return !!authToken();
}

function headers() {
  const h = { "Accept": "application/json" };
  const t = authToken();
  if (t) h["Authorization"] = "Bearer " + t;
  return h;
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
   📥 القراءة
   ======================================== */

async function apiGet(path) {
  const url = API.MOCK ? mockPath(path) : API.BASE + "/api" + path;

  const res = await fetch(url, { headers: headers() });

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
  return API.MOCK ? applyMockQuery(path, json) : json;
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

  /* ---------- تصنيف ---------- */
  const category = params.get("category");
  if (category) {
    data = data.filter(item => item.category?.slug === category);
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

  /* ---------- الترتيب ---------- */
  const sort = params.get("sort");
  if (sort === "popular") {
    data.sort((a, b) => (b.ratings_count || 0) - (a.ratings_count || 0));
  } else if (sort === "rating") {
    data.sort((a, b) => (b.ratings_avg || 0) - (a.ratings_avg || 0));
  } else if (sort === "trending") {
    data.sort((a, b) => (b.views_count || b.ratings_count || 0) - (a.views_count || a.ratings_count || 0));
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

  // في وضع mock لا نرسل شيئاً — نرجّع نجاحاً صامتاً
  if (API.MOCK) {
    console.info(`[MOCK] ${method} ${path}`, body);
    await delay(400);   // محاكاة زمن الشبكة
    return { success: true, data: null, message: "وضع تجريبي — لم يُرسل شيء" };
  }

  const opts = { method, headers: headers() };

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