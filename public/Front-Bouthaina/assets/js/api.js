/* ========================================
   ⚙️ مكتبة سامي الرقمية — طبقة الاتصال بالـ API
   ملف واحد لكل الطلبات. لا تكتبي fetch مباشرة في أي ملف آخر.
   ======================================== */

const API = {
  BASE: "",      // فارغ = نفس الدومين
  MOCK: false,   // ← حوّليها إلى true في اليوم الثالث عند استعمال /mocks
};

/* ---------- المصادقة ---------- */

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

/* ---------- المسارات ---------- */

function mockPath(path) {
  // /books/7/reviews  →  /mocks_books_7_reviews.json
  return "/mocks" + path.replace(/\//g, "_") + ".json";
}

/* ---------- الطلبات ---------- */

async function apiGet(path) {
  const url = API.MOCK ? mockPath(path) : API.BASE + "/api" + path;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw { status: res.status, message: "خطأ " + res.status };
  return res.json();
}

async function apiSend(method, path, body, isForm) {
  if (API.MOCK) {
    return { success: true, data: null, message: "وضع تجريبي — لم يُرسل شيء" };
  }

  const opts = { method: method, headers: headers() };

  if (isForm) {
    opts.body = body;                       // FormData: المتصفح يضبط Content-Type وحده
  } else {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(API.BASE + "/api" + path, opts);
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

function apiPost(path, body, isForm) { return apiSend("POST", path, body, isForm); }
function apiPut(path, body)          { return apiSend("PUT",  path, body); }
function apiDelete(path)             { return apiSend("DELETE", path); }