/* ========================================
   🔐 دار سامي — صفحة الدخول
   ----------------------------------------
   ⚠️ الترتيب: api → auth → auth-ui → partials → هذا
   ----------------------------------------
   الصفحة نفسها لا تحتوي منطق مصادقة: النموذج
   من auth-ui.js والجلسة من auth.js. هنا فقط
   التحويل بعد الدخول.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const mount = document.getElementById("loginMount");
    const done  = document.getElementById("alreadyIn");


    /* ========================================
       ↩️ وجهة ما بعد الدخول
       ----------------------------------------
       ?next=/upload-book.html يعيد المؤلف إلى حيث
       كان. لكن القيمة تأتي من العنوان — أي من
       المستخدم أو من رابط أرسله له أحد.

       فنقبل المسارات الداخلية وحدها: يبدأ بشرطة
       واحدة ولا يبدأ بشرطتين. بدون هذا الشرط
       يصير الرابط
         login.html?next=//evil.com
       تحويلاً إلى موقع خارجي يقلّد الدار.
       ======================================== */

    function safeNext() {
        const raw = new URLSearchParams(location.search).get("next") || "";
        if (!raw.startsWith("/") || raw.startsWith("//")) return "/account.html";
        return raw;
    }

    function go() {
        location.href = safeNext();
    }


    /* ---------- داخل أصلاً ---------- */

    Auth.onReady(user => {
        if (user) {
            if (mount) mount.hidden = true;
            if (done)  done.hidden  = false;
            setTimeout(go, 700);
            return;
        }

        AuthUI.mount(mount, { onDone: go });
    });
});
