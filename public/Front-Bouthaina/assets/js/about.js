/* ========================================
   🏛️ دار سامي — صفحة عن الدار
   ----------------------------------------
   ⚠️ الهيدر · القائمة · الفوتر · observeReveals
      →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):  POST /api/contact
     { name, email, phone?, type, subject?, message }
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form    = document.getElementById("contactForm");
    const alertEl = document.getElementById("cfAlert");
    const submit  = document.getElementById("cfSubmit");

    if (!form) return;


    /* ---------- رسائل الحالة ---------- */

    function showAlert(kind, text) {
        if (!alertEl) return;
        alertEl.hidden = false;
        alertEl.className = `cf-alert ${kind}`;
        alertEl.innerHTML = `
            <i class='bx ${kind === "ok" ? "bx-check-circle" : "bx-error-circle"}'></i>
            <span>${escapeText(text)}</span>
        `;
        alertEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function clearAlert() {
        if (alertEl) alertEl.hidden = true;
    }


    /* ---------- التحقّق ---------- */

    function markInvalid(el, bad) {
        el?.classList.toggle("invalid", bad);
    }

    function validate(data, els) {
        clearAlert();

        markInvalid(els.name,    !data.name);
        markInvalid(els.email,   !data.email);
        markInvalid(els.message, !data.message);

        if (!data.name || !data.email || !data.message) {
            showAlert("err", "الرجاء تعبئة الحقول المطلوبة");
            (!data.name ? els.name : !data.email ? els.email : els.message)?.focus();
            return false;
        }

        // تحقّق بسيط من شكل البريد — السيرفر يتحقّق بجدّية
        if (!/^\S+@\S+\.\S+$/.test(data.email)) {
            markInvalid(els.email, true);
            showAlert("err", "صيغة البريد الإلكتروني غير صحيحة");
            els.email?.focus();
            return false;
        }

        return true;
    }


    /* ---------- الإرسال ---------- */

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const els = {
            name:    document.getElementById("cfName"),
            email:   document.getElementById("cfEmail"),
            type:    document.getElementById("cfType"),
            message: document.getElementById("cfMessage"),
            trap:    document.getElementById("cfWebsite"),
        };

        // مصيدة السبام: البشر لا يرون هذا الحقل، الروبوتات تملؤه.
        // نتظاهر بالنجاح حتى لا يعرف الروبوت أنه كُشِف.
        if (els.trap?.value) {
            showAlert("ok", "تم استلام رسالتك، سنتواصل معك قريباً");
            form.reset();
            return;
        }

        const data = {
            name:    els.name?.value.trim()    || "",
            email:   els.email?.value.trim()   || "",
            type:    els.type?.value           || "general",
            message: els.message?.value.trim() || "",
        };

        if (!validate(data, els)) return;

        const original = submit.innerHTML;
        submit.disabled  = true;
        submit.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i><span>جارٍ الإرسال...</span>`;

        try {
            await apiPost("/contact", data);

            showAlert("ok", "تم استلام رسالتك، سنتواصل معك قريباً");
            form.reset();
            [els.name, els.email, els.message].forEach(el => markInvalid(el, false));

        } catch (error) {
            console.error("Error sending contact form:", error);
            showAlert("err", error.message || "تعذّر إرسال الرسالة، حاولي مرة أخرى");

        } finally {
            submit.disabled  = false;
            submit.innerHTML = original;
        }
    });


    /* ---------- إزالة التعليم عند التصحيح ---------- */

    ["cfName", "cfEmail", "cfMessage"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", function () {
            this.classList.remove("invalid");
        });
    });
});