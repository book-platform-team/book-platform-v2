/* ========================================
   🖨️ دار سامي — طباعة كتاب
   ----------------------------------------
   ⚠️ الهيدر · الفوتر · الحالات  →  partials.js
   ----------------------------------------
   استمارة واحدة تُرسَل إلى الإدارة، فتردّ
   بعرض سعر على بريد مقدّم الطلب.

   لا مرفقات في هذه الاستمارة، فالإرسال JSON
   عادي لا multipart — أبسط على الطرفين.

   العقد: POST /api/contact  (type = print_request)
   ملاحظة للخادم: copies مصفوفة أعداد، لا رقماً.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form     = document.getElementById("printForm");
    const alertBox = document.getElementById("prAlert");
    const submit   = document.getElementById("prSubmit");
    const doneBox  = document.getElementById("prDone");

    if (!form) return;

    const MAX_QTY = 3;   // أقصى عدد كمّيات في الطلب الواحد


    /* ========================================
       ▾ مكوّن القائمة
       ----------------------------------------
       مكوّن واحد يخدم الحقلين. الأصلي <select>
       يبدو مختلفاً في كل متصفّح، و<select multiple>
       لا ينسدل أصلاً بل يبقى صندوقاً يُختار منه
       بـCtrl — فبُني الاثنان يدوياً ليتطابقا.

       التحديد يُعلَّم بصنفٍ من الـJS لا بـ:has()،
       فيعمل على متصفّحات أقدم دون شرط.
       ======================================== */

    function makeDrop(rootId, onChange) {
        const root   = document.getElementById(rootId);
        if (!root) return null;

        const toggle = root.querySelector(".drop-toggle");
        const panel  = root.querySelector(".drop-panel");
        const inputs = [...root.querySelectorAll("input")];
        const single = root.dataset.mode === "single";

        function open(state) {
            panel.hidden = !state;
            toggle.setAttribute("aria-expanded", String(state));
            root.classList.toggle("open", state);
        }

        toggle.addEventListener("click", () => open(panel.hidden));

        // النقر خارج القائمة يُغلقها — سلوك القوائم المعتاد
        document.addEventListener("click", e => {
            if (!root.contains(e.target)) open(false);
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !panel.hidden) {
                open(false);
                toggle.focus();
            }
        });

        inputs.forEach(inp => {
            inp.addEventListener("change", () => {
                inputs.forEach(i => i.closest(".drop-item")?.classList.toggle("on", i.checked));
                onChange?.();

                // الاختيار المفرد ينتهي بالاختيار، فنُغلق —
                // لكن بعد لحظة تكفي لرؤية علامة الصحّ تظهر
                if (single) setTimeout(() => open(false), 190);
            });
        });

        return { root, toggle, panel, inputs, open };
    }


    /* ---------- حجم الكتاب ---------- */

    const sizeLabelEl = document.getElementById("sizeLabel");

    const sizeDrop = makeDrop("sizeDrop", () => {
        const picked = sizeDrop.inputs.find(i => i.checked);

        if (sizeLabelEl) {
            sizeLabelEl.textContent = picked?.dataset.label || "اختر الحجم";
            sizeLabelEl.className   = picked ? "drop-label" : "drop-label placeholder";
        }

        sizeDrop.root.classList.remove("invalid");
        hideAlert();
    });

    function chosenSize() {
        return sizeDrop?.inputs.find(i => i.checked)?.value || "";
    }


    /* ---------- الكميات ---------- */

    const qtyLabelEl = document.getElementById("qtyLabel");
    const qtyCap     = document.getElementById("qtyCap");

    const qtyDrop = makeDrop("qtyDrop", syncQty);

    function chosenQty() {
        return qtyDrop ? qtyDrop.inputs.filter(b => b.checked).map(b => Number(b.value)) : [];
    }

    /* عند بلوغ الحدّ نُعطّل ما لم يُختَر بدل أن نمنع
       النقر بصمت: المستخدم يرى أنّ الباب أُغلق، ويبقى
       قادراً على إلغاء اختيارٍ ليفتح مكاناً. */
    function syncQty() {
        if (!qtyDrop) return;

        const picked = chosenQty();
        const full   = picked.length >= MAX_QTY;

        qtyDrop.inputs.forEach(b => {
            b.disabled = full && !b.checked;
            b.closest(".drop-item")?.classList.toggle("off", b.disabled);
        });

        if (qtyLabelEl) {
            if (picked.length === 0) {
                qtyLabelEl.textContent = "اختر الكميات";
                qtyLabelEl.className   = "drop-label placeholder";
            } else {
                qtyLabelEl.textContent = picked.map(arabize).join(" · ") + " نسخة";
                qtyLabelEl.className   = "drop-label";
            }
        }

        if (qtyCap) {
            qtyCap.textContent = full
                ? `بلغتَ الحدّ — ${arabize(MAX_QTY)} كمّيات`
                : `اختر حتى ${arabize(MAX_QTY)} كمّيات`;
            qtyCap.classList.toggle("full", full);
        }

        if (picked.length) {
            qtyDrop.root.classList.remove("invalid");
            hideAlert();
        }
    }


    /* ========================================
       ✅ التحقّق
       ======================================== */

    function validate() {
        clearMarks();

        const name  = v("pr_name");
        const email = v("pr_email");
        const book  = v("pr_book");
        const pages = Number(v("pr_pages"));

        if (!name)  return bad("pr_name",  "الرجاء كتابة الاسم واللقب");
        if (!email) return bad("pr_email", "الرجاء كتابة البريد الإلكتروني");
        if (!/^\S+@\S+\.\S+$/.test(email))
                    return bad("pr_email", "صيغة البريد غير صحيحة");
        if (!book)  return bad("pr_book",  "الرجاء كتابة اسم الكتاب");

        if (!pages || pages < 1)
            return bad("pr_pages", "الرجاء تحديد عدد الصفحات");

        // نفتح القائمة مع رسالة الخطأ — الإشارة إلى حقلٍ
        // مغلق لا تدلّ المستخدم على ما ينقصه
        if (!chosenSize()) {
            sizeDrop?.open(true);
            return badDrop("sizeDrop", "الرجاء اختيار حجم الكتاب");
        }

        if (chosenQty().length === 0) {
            qtyDrop?.open(true);
            return badDrop("qtyDrop", "الرجاء اختيار عدد النسخ المطلوبة — كمّية واحدة على الأقل");
        }

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
            const copies = chosenQty();
            const size   = chosenSize();

            /* نجمع البيانات في نصّ واحد مرتّب — الإدارة تقرأ
               رسالة واحدة مفهومة لا حقولاً متناثرة. */
            const message =
                `طلب طباعة كتاب\n\n` +
                `• اسم الكتاب: ${v("pr_book")}\n` +
                `• عدد الصفحات: ${v("pr_pages")}\n` +
                `• حجم الكتاب: ${sizeText(size)}\n` +
                `• الكميات المطلوب تسعيرها: ${copies.join(" · ")} نسخة\n`;

            await apiPost("/contact", {
                type:       "print_request",
                name:       v("pr_name"),
                email:      v("pr_email"),
                phone:      v("pr_phone"),
                subject:    `طلب طباعة: ${v("pr_book")}`,
                message,
                book_title: v("pr_book"),
                pages:      Number(v("pr_pages")),
                size,                  // A4 | A5 | 16x24
                copies,                // مصفوفة: حتى ثلاثة أعداد
            });

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
        hideAlert();
    });

    function v(id) { return document.getElementById(id)?.value.trim() || ""; }

    function arabize(n) {
        return String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
    }

    function sizeText(code) {
        return { "A4": "A4", "A5": "A5", "16x24": "١٦ × ٢٤ سم" }[code] || code;
    }

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

    /* القائمة ليست حقلاً واحداً، فلا تصلح عليها
       علامة invalid المعتادة — نُعلّم الحاوية كلّها */
    function badDrop(id, msg) {
        showAlert(msg);
        const box = document.getElementById(id);
        box?.classList.add("invalid");
        box?.scrollIntoView({ behavior: "smooth", block: "center" });
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

    function hideAlert() {
        if (alertBox) alertBox.hidden = true;
    }


    /* الحالة الابتدائية تُضبط قبل أن يلمس المستخدم شيئاً */
    syncQty();
});