/* ========================================
   🖨️ دار سامي — طباعة كتاب
   ----------------------------------------
   ⚠️ الهيدر · الفوتر · الحالات  →  partials.js
   ----------------------------------------
   استمارة واحدة تُرسَل إلى الإدارة، فتردّ
   بعرض سعر على بريد مقدّم الطلب.

   العقد: POST /api/contact  (type = print_request)
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form     = document.getElementById("printForm");
    const alertBox = document.getElementById("prAlert");
    const submit   = document.getElementById("prSubmit");
    const doneBox  = document.getElementById("prDone");

    if (!form) return;

    const MAX_FILE  = 50 * 1024 * 1024;   // ملف الكتاب
    const MAX_COVER =  5 * 1024 * 1024;   // صورة الغلاف


    /* ========================================
       🖼️ صورة الغلاف
       ----------------------------------------
       معاينة فورية: صاحب الطلب يرى ما أرسله
       قبل أن يضغط إرسال.
       ======================================== */

    const coverInput = document.getElementById("pr_cover");
    const coverZone  = document.getElementById("coverZone");
    const coverDone  = document.getElementById("coverDone");

    coverInput?.addEventListener("change", () => {
        const f = coverInput.files?.[0];
        if (!f) return;

        const img = document.getElementById("coverPreview");
        if (img) {
            // نُحرّر الرابط السابق حتى لا تتراكم في الذاكرة
            if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
            const url = URL.createObjectURL(f);
            img.src = url;
            img.dataset.url = url;
        }

        setText("coverName", f.name);
        setText("coverSize", humanSize(f.size));

        if (coverZone) coverZone.hidden = true;
        if (coverDone) coverDone.hidden = false;
    });

    document.getElementById("coverRemove")?.addEventListener("click", () => {
        coverInput.value = "";
        if (coverZone) coverZone.hidden = false;
        if (coverDone) coverDone.hidden = true;
    });


    /* ========================================
       📄 ملف الكتاب
       ======================================== */

    const fileInput = document.getElementById("pr_file");
    const fileZone  = document.getElementById("fileZone");
    const fileDone  = document.getElementById("fileDone");

    fileInput?.addEventListener("change", showFile);

    function showFile() {
        const f = fileInput.files?.[0];
        if (!f) return;

        setText("fileName", f.name);
        setText("fileSize", humanSize(f.size));

        if (fileZone) fileZone.hidden = true;
        if (fileDone) fileDone.hidden = false;
    }

    document.getElementById("fileRemove")?.addEventListener("click", () => {
        fileInput.value = "";
        if (fileZone) fileZone.hidden = false;
        if (fileDone) fileDone.hidden = true;
    });

    /* السحب والإفلات */
    ["dragenter", "dragover"].forEach(ev =>
        fileZone?.addEventListener(ev, e => {
            e.preventDefault();
            fileZone.classList.add("over");
        }));

    ["dragleave", "drop"].forEach(ev =>
        fileZone?.addEventListener(ev, e => {
            e.preventDefault();
            fileZone.classList.remove("over");
        }));

    fileZone?.addEventListener("drop", e => {
        const f = e.dataTransfer?.files?.[0];
        if (!f) return;
        fileInput.files = e.dataTransfer.files;
        showFile();
    });


    /* ========================================
       ✅ التحقّق
       ======================================== */

    function validate() {
        clearMarks();

        const name    = v("pr_name");
        const email   = v("pr_email");
        const book    = v("pr_book");
        const author  = v("pr_author");
        const pages   = Number(v("pr_pages"));
        const copies  = Number(v("pr_copies"));

        if (!name)   return bad("pr_name",   "الرجاء كتابة الاسم واللقب");
        if (!email)  return bad("pr_email",  "الرجاء كتابة البريد الإلكتروني");
        if (!/^\S+@\S+\.\S+$/.test(email))
                     return bad("pr_email",  "صيغة البريد غير صحيحة");
        if (!book)   return bad("pr_book",   "الرجاء كتابة اسم الكتاب");
        if (!author) return bad("pr_author", "الرجاء كتابة اسم الكاتب");

        if (!pages  || pages  < 1) return bad("pr_pages",  "الرجاء تحديد عدد الصفحات");
        if (!copies || copies < 1) return bad("pr_copies", "الرجاء تحديد عدد النسخ المطلوبة");

        const cov = coverInput?.files?.[0];
        if (!cov) return bad("pr_cover", "الرجاء اختيار صورة الكتاب");
        if (cov.size > MAX_COVER)
            return bad("pr_cover", `حجم الصورة ${humanSize(cov.size)} — الحدّ الأقصى ٥ ميجابايت`);

        const f = fileInput?.files?.[0];
        if (!f) return bad("pr_file", "الرجاء اختيار ملف الكتاب");
        if (f.size > MAX_FILE)
            return bad("pr_file", `حجم الملف ${humanSize(f.size)} — الحدّ الأقصى ٥٠ ميجابايت`);

        return true;
    }


    /* ========================================
       📤 الإرسال
       ======================================== */

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // مصيدة السبام: البشر لا يرون هذا الحقل.
        // نتظاهر بالنجاح حتى لا يعرف الروبوت أنه كُشِف.
        if (document.getElementById("pr_trap")?.value) return showDone();

        if (!validate()) return;

        const original = submit.innerHTML;
        submit.disabled  = true;
        submit.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جارٍ الإرسال...`;

        try {
            const fd = new FormData();

            fd.append("type",    "print_request");
            fd.append("name",    v("pr_name"));
            fd.append("email",   v("pr_email"));
            fd.append("phone",   v("pr_phone"));
            fd.append("subject", `طلب طباعة: ${v("pr_book")}`);

            /* نجمع البيانات في نصّ واحد مرتّب — الإدارة تقرأ
               رسالة واحدة مفهومة لا حقولاً متناثرة. */
            fd.append("message",
                `طلب طباعة كتاب\n\n` +
                `• اسم الكتاب: ${v("pr_book")}\n` +
                `• اسم الكاتب: ${v("pr_author")}\n` +
                `• عدد الصفحات: ${v("pr_pages")}\n` +
                `• عدد النسخ المطلوبة: ${v("pr_copies")}\n` +
                (v("pr_notes") ? `\nملاحظات:\n${v("pr_notes")}\n` : "")
            );

            fd.append("book_title",  v("pr_book"));
            fd.append("book_author", v("pr_author"));
            fd.append("pages",       v("pr_pages"));
            fd.append("copies",      v("pr_copies"));

            if (coverInput?.files?.[0]) fd.append("cover", coverInput.files[0]);
            if (fileInput?.files?.[0])  fd.append("file",  fileInput.files[0]);

            await apiPost("/contact", fd, true);
            showDone();

        } catch (error) {
            console.error("Error sending print request:", error);

            const msg = error.errors
                ? Object.values(error.errors).flat().join(" · ")
                : (error.message || "تعذّر إرسال المعلومات، حاول مرة أخرى");

            showAlert(msg);
            submit.disabled  = false;
            submit.innerHTML = original;
        }
    });


    function showDone() {
        setText("doneEmail", v("pr_email"));
        form.hidden = true;
        if (doneBox) doneBox.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }


    /* ---------- مساعدات ---------- */

    form.addEventListener("input", e => {
        e.target.classList.remove("invalid");
        if (alertBox) alertBox.hidden = true;
    });

    function v(id) { return document.getElementById(id)?.value.trim() || ""; }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function bad(id, msg) {
        showAlert(msg);
        const el = document.getElementById(id);
        el?.classList.add("invalid");
        el?.focus();
        return false;
    }

    function clearMarks() {
        form.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
    }

    function showAlert(text) {
        if (!alertBox) return;
        alertBox.hidden = false;
        alertBox.className = "alert err";
        alertBox.innerHTML = `<i class='bx bx-error-circle'></i><span>${escapeText(text)}</span>`;
        alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function humanSize(bytes) {
        if (!bytes) return "٠ بايت";
        const units = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    }
});