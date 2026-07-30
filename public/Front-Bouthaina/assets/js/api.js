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

  return res.json();
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