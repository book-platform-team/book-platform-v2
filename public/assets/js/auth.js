/* ========================================
   🔐 دار سامي — طبقة الحساب
   ----------------------------------------
   ⚠️ يُحمَّل بعد api.js وقبل partials.js.
   ----------------------------------------
   القرارات التي بُني عليها هذا الملف:

   ١ · الحسابات للمؤلفين وحدهم. القرّاء بلا
       حسابات، والمفضّلة تبقى في localStorage.

   ٢ · لا استمارة تسجيل منفصلة. الحساب يُولد من
       نشر الكتاب: المؤلف يملأ الخطوة الأولى مرّة
       واحدة، فيُنشأ حسابه. وفي المرّات التالية
       يسجّل الدخول فتُملأ بياناته تلقائياً.

   ٣ · الجلسة كوكي httpOnly عبر Sanctum. هذا
       الملف لا يخزّن رمزاً ولا يقرأ واحداً.

   ٤ · هوية الحساب هي البريد وحده — لا هاتف ولا
       جوجل ولا فيسبوك. لأنّ البريد هو ما يُملأ
       عند النشر، وما يصل عليه ردّ الدار، وما
       تُستعاد به كلمة السرّ. مسار هوية ثانٍ يعني
       احتمال حسابين لمؤلف واحد.
   ----------------------------------------
   العقد المطلوب من الخادم:
     GET  /api/auth/me
     POST /api/auth/login             { email, password }
     POST /api/auth/logout
     POST /api/auth/password/forgot   { email }
     POST /api/auth/password/verify   { email, code }
     POST /api/auth/password/reset    { email, code, password }
     PUT  /api/auth/profile           { ...بيانات المؤلف }
     POST /api/auth/password/change   { current_password, password }
   ======================================== */

const Auth = (() => {

    let user    = null;     // بيانات المؤلف الداخل، أو null
    let ready   = false;
    let loading = null;     // وعد التحميل الجاري — يمنع الطلبات المكرّرة
    const waiters = [];


    /* ========================================
       📥 حالة الجلسة
       ======================================== */

    /** يجلب المستخدم الحالي مرّة واحدة ويحتفظ به */
    function load() {
        if (loading) return loading;

        // في وضع mock لا خادم يقرأ الكوكي — الجلسة في
        // sessionStorage، وقد قُرئت في أسفل الملف
        if (typeof API !== "undefined" && API.MOCK) {
            ready = true;
            loading = Promise.resolve();
            waiters.splice(0).forEach(fn => fn(user));
            return loading;
        }

        loading = apiGet("/auth/me")
            .then(res => { user = res?.data || null; })
            .catch(() => { user = null; })      // 401 ليس خطأً — يعني زائراً
            .finally(() => {
                ready = true;
                waiters.splice(0).forEach(fn => fn(user));
            });

        return loading;
    }

    /** ينفّذ الدالة حين تُعرف حالة الجلسة */
    function onReady(fn) {
        if (ready) { fn(user); return; }
        waiters.push(fn);
        load();
    }

    function current()  { return user; }
    function isIn()     { return !!user; }


    /* ========================================
       🚪 الدخول والخروج
       ======================================== */

    async function login(email, password) {
        const res = await apiPost("/auth/login", { email, password });
        user  = res?.data || null;
        ready = true;
        return user;
    }

    async function logout() {
        try { await apiPost("/auth/logout", {}); }
        finally {
            user = null;
            if (API.MOCK) sessionStorage.removeItem(MOCK_KEY);
        }
    }

    /** يُستدعى بعد نشر أول كتاب — الخادم أنشأ الحساب */
    function adopt(data) {
        user  = data || null;
        ready = true;
        if (API.MOCK && user) {
            sessionStorage.setItem(MOCK_KEY, JSON.stringify(user));
        }
    }


    /* ========================================
       🔑 استعادة كلمة السرّ
       ----------------------------------------
       رمز من ٦ خانات لا رابط: الرابط يحتاج صفحة
       مستقلّة يُفتح فيها، والرمز يُكتب في نفس
       النافذة — فلا تُضاف صفحة إلى الموقع.
       ======================================== */

    function forgotStart(email)             { return apiPost("/auth/password/forgot", { email }); }
    function forgotVerify(email, code)      { return apiPost("/auth/password/verify", { email, code }); }
    function forgotReset(email, code, pass) {
        return apiPost("/auth/password/reset", { email, code, password: pass });
    }


    /* ========================================
       ✏️ الملف الشخصي
       ======================================== */

    async function saveProfile(data) {
        const res = await apiPut("/auth/profile", data);
        if (res?.data) user = res.data;
        if (API.MOCK && user) sessionStorage.setItem(MOCK_KEY, JSON.stringify(user));
        return user;
    }

    function changePassword(current_password, password) {
        return apiPost("/auth/password/change", { current_password, password });
    }


    /* ========================================
       💪 قوّة كلمة السرّ
       ----------------------------------------
       نقيس الطول والتنوّع معاً. الطول أهمّ: كلمة
       من ١٢ حرفاً صغيراً أصعب على التخمين من
       ثمانية أحرف بها رمز ورقم.
       ======================================== */

    const MIN_LEN = 8;

    function passwordScore(v) {
        const s = String(v || "");
        if (!s) return { score: 0, label: "", ok: false };

        let n = 0;
        if (s.length >= MIN_LEN) n++;
        if (s.length >= 12)      n++;
        if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++;
        if (/\d/.test(s))        n++;
        if (/[^\w\s]/.test(s))   n++;

        // متتالية واضحة أو تكرار حرف واحد يُسقط النتيجة
        if (/^(.)\1+$/.test(s) || /12345|qwerty|password|000000/i.test(s)) n = 1;

        const label = ["ضعيفة جداً", "ضعيفة", "متوسّطة", "جيّدة", "قوية", "قوية جداً"][n] || "";
        return { score: n, label, ok: s.length >= MIN_LEN && n >= 3 };
    }

    function passwordProblem(v) {
        const s = String(v || "");
        if (s.length < MIN_LEN) return `كلمة السرّ يجب ألّا تقلّ عن ${MIN_LEN} أحرف`;
        if (!passwordScore(s).ok) return "كلمة السرّ ضعيفة — أضف حروفاً كبيرة أو أرقاماً أو رموزاً";
        return "";
    }


    /* ========================================
       🧪 محاكاة الخادم — وضع mock فقط
       ----------------------------------------
       ⚠️ هذه الكتلة لا تعمل إطلاقاً حين API.MOCK
          يساوي false. ليست بديلاً عن مصادقة، بل
          أداة اختبار تسمح بتجربة الخطأ والنجاح
          قبل جاهزية الخادم.

       حساب التجربة:  author@test.com  /  Test12345
       رمز الاستعادة: 123456
       ======================================== */

    const MOCK_KEY  = "sami_mock_author";
    const MOCK_MAIL = "author@test.com";
    const MOCK_PASS = "Test12345";
    const MOCK_CODE = "123456";

    const MOCK_USER = {
        id: 501,
        name: "أحمد بن يوسف",
        email: MOCK_MAIL,
        title: "doctor",
        phone: "+213 555 12 34 56",
        address: "الوادي، الجزائر",
        bio: "باحث في التاريخ الاجتماعي للجنوب الجزائري، له مقالات في دوريات محكّمة.",
        extra: "",
        photo: null,
        slug: "ahmed-benyoussef",
        books_count: 3,

        /* ثلاث حالات لتُختبر الواجهة كلّها:
           واحد ينتظر التأكيد، وواحد مؤكَّد، وواحد
           ما زال قيد المراجعة فلا رمز له بعد */
        books: [
            { id: 7,  slug: "tarikh-aljazair-alhadith", title: "تاريخ الجزائر الحديث",
              status: "approved", has_sale_email: true,  sale_email_verified: false },
            { id: 12, slug: "alandalus-almafquda",      title: "الأندلس المفقودة",
              status: "approved", has_sale_email: true,  sale_email_verified: true  },
            { id: 21, slug: null,                        title: "كتاب قيد المراجعة",
              status: "pending",  has_sale_email: true,  sale_email_verified: false },
        ],
    };

    if (typeof API !== "undefined" && API.MOCK) {

        // جلسة محفوظة في sessionStorage — تختفي بإغلاق التبويب
        try {
            const saved = sessionStorage.getItem(MOCK_KEY);
            if (saved) { user = JSON.parse(saved); ready = true; loading = Promise.resolve(); }
        } catch { /* تجاهل */ }

        API.mockSend = async (method, path, body) => {
            const fail = (status, message, errors) =>
                ({ ok: false, json: { success: false, status, message, ...(errors ? { errors } : {}) } });
            const done = (data, message) =>
                ({ ok: true, json: { success: true, data: data ?? null, ...(message ? { message } : {}) } });

            if (path === "/auth/login") {
                const mail = String(body?.email || "").trim().toLowerCase();
                const pass = String(body?.password || "");

                if (mail !== MOCK_MAIL || pass !== MOCK_PASS) {
                    return fail(401, "البريد أو كلمة السرّ غير صحيحة");
                }

                sessionStorage.setItem(MOCK_KEY, JSON.stringify(MOCK_USER));
                return done(MOCK_USER);
            }

            if (path === "/auth/logout") {
                sessionStorage.removeItem(MOCK_KEY);
                return done(null);
            }

            if (path === "/auth/password/forgot") {
                const mail = String(body?.email || "").trim().toLowerCase();
                if (mail !== MOCK_MAIL) {
                    // الخادم الحقيقي يجب أن يردّ نجاحاً دائماً هنا،
                    // وإلّا صار النموذج أداةً لمعرفة من له حساب
                    return done(null, "إن كان لهذا البريد حساب فسيصله رمز");
                }
                return done(null, "أُرسل رمز إلى بريدك");
            }

            if (path === "/auth/password/verify") {
                return String(body?.code || "") === MOCK_CODE
                    ? done(null)
                    : fail(422, "الرمز غير صحيح أو انتهت صلاحيته");
            }

            if (path === "/auth/password/reset") {
                if (String(body?.code || "") !== MOCK_CODE) {
                    return fail(422, "الرمز غير صحيح أو انتهت صلاحيته");
                }
                return done(null, "تم تغيير كلمة السرّ");
            }

            /* محاكاة تأكيد بريد البيع — رمز التجربة 654321 */
            const sale = path.match(/^\/books\/([^/]+)\/sale-email\/(request|verify)$/);
            if (sale) {
                const [, id, action] = sale;

                if (action === "request") {
                    return done(null, "أُرسل رمز جديد إلى بريد البيع");
                }

                if (String(body?.code || "") !== "654321") {
                    return fail(422, "الرمز غير صحيح أو انتهت صلاحيته");
                }

                const b = (user?.books || []).find(x => String(x.id) === String(id));
                if (b) {
                    b.sale_email_verified = true;
                    sessionStorage.setItem(MOCK_KEY, JSON.stringify(user));
                }
                return done(null, "تم تأكيد بريد البيع");
            }

            if (path === "/auth/profile" && method === "PUT") {
                const next = { ...(user || MOCK_USER), ...(body || {}) };
                sessionStorage.setItem(MOCK_KEY, JSON.stringify(next));
                return done(next, "حُفظت البيانات");
            }

            if (path === "/auth/password/change") {
                if (String(body?.current_password || "") !== MOCK_PASS) {
                    return fail(422, "كلمة السرّ الحالية غير صحيحة");
                }
                return done(null, "تم تغيير كلمة السرّ");
            }

            return null;   // غير معالَج — يعود إلى النجاح الصامت
        };
    }


    return {
        load, onReady, current, isIn,
        login, logout, adopt,
        forgotStart, forgotVerify, forgotReset,
        saveProfile, changePassword,
        passwordScore, passwordProblem,
        MIN_LEN,
    };
})();