/* ========================================
   📤 دار سامي — نشر كتاب
   ----------------------------------------
   استمارة من ثلاث خطوات. لا حسابات — البريد
   هو قناة التواصل الوحيدة مع المؤلف.
   ----------------------------------------
   الإتاحة تُستنتج ولا تُسأل:
     ملف مرفوع  → يُنزَّل مجاناً
     سعر محدَّد  → يُعرض للبيع
     الاثنان     → الاثنان معاً
     لا شيء      → تعريفٌ بالكتاب فقط
   ----------------------------------------
   العقد: POST /api/submissions  (multipart)
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form      = document.getElementById("submitForm");
    const bar       = document.getElementById("stepsBar");
    const steps     = [...document.querySelectorAll(".step")];
    const alertBox  = document.getElementById("formAlert");
    const submitBtn = document.getElementById("submitBtn");
    const doneBox   = document.getElementById("doneBox");

    const MAX_BYTES  = 50 * 1024 * 1024;
    const MAX_COVER  = 5 * 1024 * 1024;
    const TIERS      = [2, 3, 4];
    let current = 1;


    /* ========================================
       📂 الأقسام
       ======================================== */

    (async function loadCategories() {
        const sel = document.getElementById("category_id");
        if (!sel) return;

        try {
            const res  = await apiGet("/categories");
            const cats = res.data || [];

            if (cats.length === 0) {
                sel.innerHTML = `<option value="">لا توجد أقسام</option>`;
                return;
            }

            // «أخرى» أخيراً دائماً — القسم الأخير الذي يُنظر إليه
            cats.sort((a, b) => (a.is_fallback ? 1 : 0) - (b.is_fallback ? 1 : 0));

            sel.innerHTML = `<option value="">اختر القسم</option>` + cats.map(c => {
                const subs = (c.children || [])
                    .slice()
                    .sort((a, b) => (a.is_fallback ? 1 : 0) - (b.is_fallback ? 1 : 0));

                if (subs.length === 0) {
                    return `<option value="${c.id}">${escapeText(c.name)}</option>`;
                }

                return `<optgroup label="${escapeAttr(c.name)}">
                    <option value="${c.id}">${escapeText(c.name)} — عام</option>
                    ${subs.map(s => `<option value="${s.id}">${escapeText(s.name)}</option>`).join("")}
                </optgroup>`;
            }).join("");

        } catch (error) {
            console.error("Error loading categories:", error);
            sel.innerHTML = `<option value="">تعذّر تحميل الأقسام</option>`;
        }
    })();


    /* ========================================
       🧭 التنقّل بين الخطوات
       ======================================== */

    function goTo(n) {
        current = n;

        steps.forEach(s => s.classList.toggle("active", +s.dataset.step === n));

        bar?.querySelectorAll(".step-dot").forEach(d => {
            const i = +d.dataset.step;
            d.classList.toggle("active", i === n);
            d.classList.toggle("done", i < n);      // الخطوات المنجزة تبقى مُعلَّمة
        });

        hideAlert();

        // نقيس بعد الرسم لا قبله — ارتفاع الخطوات مختلف،
        // والقياس قبل التبديل يعطي موضعاً قديماً فتقفز الصفحة.
        // و left مطلوب صراحةً: بدونه يعيد المتصفّح التمرير
        // الأفقي إلى الصفر، فتنزاح الصفحة في اتجاه RTL.
        requestAnimationFrame(() => {
            if (!bar) return;
            const top = bar.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({
                top: Math.max(top, 0),
                left: window.scrollX,
                behavior: "smooth"
            });
        });
    }


    /* ========================================
       📜 بوّابة شروط النشر
       ----------------------------------------
       الموافقة لا تُفعَّل إلا بعد الوصول لنهاية
       النصّ. صندوق موافقة يُنقر دون قراءة ليس
       موافقة — والدار مسؤولة عمّا تنشره باسمها.
       ======================================== */

    const termsOverlay = document.getElementById("termsOverlay");
    const agreeCheck   = document.getElementById("agree_terms");
    const agreeBtn     = document.getElementById("agreeBtn");
    const termsScroll  = document.getElementById("termsScroll");
    const scrollHint   = document.getElementById("scrollHint");

    let termsRead = false;

    document.getElementById("openTerms")?.addEventListener("click", () => {
        if (!termsOverlay) return;
        termsOverlay.hidden = false;
        document.body.style.overflow = "hidden";
        checkScrollEnd();
    });

    const closeTerms = () => {
        if (!termsOverlay) return;
        termsOverlay.hidden = true;
        document.body.style.overflow = "";
    };

    document.getElementById("termsClose")?.addEventListener("click", closeTerms);

    termsOverlay?.addEventListener("click", e => {
        if (e.target === termsOverlay) closeTerms();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && termsOverlay && !termsOverlay.hidden) closeTerms();
    });

    termsScroll?.addEventListener("scroll", checkScrollEnd);

    function checkScrollEnd() {
        if (!termsScroll || !agreeBtn) return;

        const atEnd =
            termsScroll.scrollTop + termsScroll.clientHeight >=
            termsScroll.scrollHeight - 24;

        // النصّ أقصر من الصندوق أصلاً — لا شيء يُنزَل إليه
        const noScroll = termsScroll.scrollHeight <= termsScroll.clientHeight + 8;

        if (atEnd || noScroll) {
            agreeBtn.disabled = false;
            if (scrollHint) scrollHint.hidden = true;
        }
    }

    agreeBtn?.addEventListener("click", () => {
        termsRead = true;

        if (agreeCheck) {
            agreeCheck.disabled = false;
            agreeCheck.checked  = true;
        }

        const hint = document.getElementById("agreeHint");
        if (hint) hint.textContent = "شكراً — يمكنك المتابعة";

        closeTerms();
    });


    document.querySelectorAll(".btn-next").forEach(b => {
        b.addEventListener("click", () => {
            if (validate(current)) goTo(+b.dataset.go);
        });
    });

    document.querySelectorAll(".btn-back").forEach(b => {
        b.addEventListener("click", () => goTo(+b.dataset.go));
    });

    // الرجوع إلى خطوة سابقة بالنقر على مؤشّرها
    bar?.querySelectorAll(".step-dot").forEach(d => {
        d.addEventListener("click", () => {
            const i = +d.dataset.step;
            if (i < current) goTo(i);
        });
    });


    /* ========================================
       💰 الإتاحة والتسعير
       ----------------------------------------
       لا سؤال «مجاني أم مدفوع». الملف والسعر
       اختياران مستقلّان، وحالة الكتاب تُقرأ
       منهما. هذا يسمح بحالة كانت مستحيلة في
       التصميم السابق: نسخة رقمية مجانية ونسخ
       مطبوعة تُباع في الوقت نفسه.
       ======================================== */

    const priceInput = document.getElementById("price");
    const tiersBlock = document.getElementById("tiersBlock");
    const availText  = document.getElementById("availText");
    const availNote  = document.getElementById("availNote");

    function unitPrice() {
        const n = Number(val("price"));
        return n > 0 ? n : 0;
    }

    function hasFile() {
        return !!document.getElementById("file")?.files?.[0];
    }

    function tierInput(qty) {
        return document.getElementById(`price_${qty}`);
    }

    function syncSale() {
        const unit = unitPrice();

        // لا تخفيض على سعرٍ غير موجود
        if (tiersBlock) tiersBlock.hidden = unit <= 0;

        if (unit <= 0) {
            // حقل مخفيّ لا يُترك محتفظاً بقيمته — وإلا أُرسل
            // سعر جملة لكتاب لم يعد يُباع أصلاً
            TIERS.forEach(q => {
                const el = tierInput(q);
                if (el) { el.value = ""; el.classList.remove("invalid"); }
            });
        }

        TIERS.forEach(q => updateTierHint(q, unit));
        syncSaleRequired();
        updateAvailNote();
    }

    /* التوفير يُحسب أمام المؤلف لحظةَ الكتابة —
       رقمٌ مجرّد لا يقول له إن كان عرضه مغرياً */
    function updateTierHint(qty, unit) {
        const el   = tierInput(qty);
        const hint = document.querySelector(`.tier-hint[data-hint="${qty}"]`);
        if (!el || !hint) return;

        const v    = Number(el.value);
        const full = unit * qty;

        if (!unit || !v) {
            hint.textContent = unit ? `بلا تخفيض: ${fmt(full)} دج` : "";
            hint.className   = "tier-hint";
            return;
        }

        if (v >= full) {
            hint.textContent = `أعلى من ${fmt(full)} دج — ليس تخفيضاً`;
            hint.className   = "tier-hint bad";
            return;
        }

        const save = full - v;
        const pct  = Math.round((save / full) * 100);
        hint.textContent = `توفير ${fmt(save)} دج (${pct}٪)`;
        hint.className   = "tier-hint good";
    }

    /* ملخّص حيّ: المؤلف يقرأ نتيجة اختياره قبل الإرسال،
       لا بعد أسبوع حين يجد صفحة كتابه بلا أي إجراء */
    function updateAvailNote() {
        if (!availText || !availNote) return;

        const f = hasFile();
        const p = unitPrice() > 0;

        let text, tone;

        if (f && p) {
            text = "سيُتاح كتابك للتنزيل مجاناً، وتُعرض نسخه المطبوعة للبيع.";
            tone = "ok";
        } else if (f) {
            text = "سيُتاح كتابك للتنزيل مجاناً من الموقع.";
            tone = "ok";
        } else if (p) {
            text = "سيُعرض كتابك للبيع، دون نسخة رقمية مجانية.";
            tone = "ok";
        } else {
            text = "لم ترفع ملفاً ولم تحدّد سعراً — سيُعرض التعريف بكتابك فقط، دون تنزيل أو بيع.";
            tone = "warn";
        }

        const changed = availText.textContent !== text;

        availText.textContent = text;
        availNote.className   = `avail-note ${tone}`;

        // إعادة تشغيل الحركة تحتاج قراءة تُجبر المتصفّح
        // على إعادة الحساب — وإلا لم يرَ الصنف قد أُزيل
        if (changed) {
            void availNote.offsetWidth;
            availNote.classList.add("flash");
        }
    }

    /* النجمة تظهر لحظة كتابة السعر — لا عند
       الضغط على «التالي» فيُفاجأ المؤلف */
    function syncSaleRequired() {
        const req = document.getElementById("saleReq");
        if (req) req.hidden = !unitPrice();
    }

    priceInput?.addEventListener("input", () => {
        syncSale();
        syncSaleRequired();
    });

    TIERS.forEach(q => {
        tierInput(q)?.addEventListener("input", () => updateTierHint(q, unitPrice()));
    });


    /* ========================================
       ✅ التحقّق — خطوة بخطوة
       ----------------------------------------
       نتحقّق عند الانتقال لا عند الإرسال، حتى لا
       يكتشف المؤلف خطأً في الخطوة الأولى بعد أن
       ملأ الثلاث.
       ======================================== */

    function validate(step) {
        clearMarks();

        if (step === 1) {
            if (!termsRead || !agreeCheck?.checked)
                return fail("agree_terms", "الرجاء قراءة شروط النشر والموافقة عليها");

            const name  = val("author_name");
            const email = val("author_email");

            if (!name)  return fail("author_name", "الرجاء كتابة الاسم واللقب");
            if (!email) return fail("author_email", "الرجاء كتابة البريد الإلكتروني");
            if (!isEmail(email))
                return fail("author_email", "صيغة البريد غير صحيحة");

            if (!val("author_phone"))   return fail("author_phone", "الرجاء كتابة رقم الهاتف");
            if (!val("author_address")) return fail("author_address", "الرجاء كتابة العنوان");
            if (!val("author_bio"))     return fail("author_bio", "الرجاء كتابة نبذة عنك");
        }

        if (step === 2) {
            if (!val("book_title"))  return fail("book_title", "الرجاء كتابة عنوان الكتاب");
            if (!val("category_id")) return fail("category_id", "الرجاء اختيار القسم");

            const pages = Number(val("pages"));
            if (!pages || pages < 1) return fail("pages", "الرجاء تحديد عدد الصفحات");

            if (!val("legal_deposit"))
                return fail("legal_deposit", "الرجاء كتابة رقم الإيداع القانوني");

            if (!val("book_description"))
                return fail("book_description", "الرجاء كتابة نبذة عن الكتاب");
        }

        if (step === 3) {

            /* ١ · الغلاف — الشيء الوحيد المطلوب */
            const cov = document.getElementById("cover")?.files?.[0];
            if (!cov) return fail("cover", "الرجاء اختيار صورة غلاف الكتاب");

            if (cov.size > MAX_COVER)
                return fail("cover", `حجم الغلاف ${humanSize(cov.size)} — الحدّ الأقصى ٥ ميجابايت`);

            /* ٢ · الملف — اختياري، لكن إن وُجد فله حدّ */
            const f = document.getElementById("file")?.files?.[0];
            if (f && f.size > MAX_BYTES)
                return fail("file", `حجم الملف ${humanSize(f.size)} — الحدّ الأقصى ٥٠ ميجابايت`);

            /* ٣ · السعر — اختياري، لكن الرقم السالب أو الصفر خطأ لا اختيار */
            const rawPrice = val("price");
            if (rawPrice && Number(rawPrice) <= 0)
                return fail("price", "سعر النسخة يجب أن يكون أكبر من صفر");

            /* بريد المشترين — مطلوب متى وُجد سعر.
               لم يعد له بديل: بريد الخطوة الأولى لا يُنشر
               (وعدنا المؤلف بذلك)، فكتابٌ بسعر بلا بريد
               يُعرض للبيع دون وسيلة شراء. */
            const mail = val("sale_email");

            if (unitPrice() && !mail)
                return fail("sale_email",
                    "حدّدتَ سعراً — الرجاء كتابة بريد التواصل مع المشترين");

            if (mail && !isEmail(mail))
                return fail("sale_email", "صيغة بريد التواصل غير صحيحة");

            /* ٤ · أسعار الجملة — يجب أن تكون تخفيضاً فعلياً */
            const unit = unitPrice();
            if (unit) {
                for (const q of TIERS) {
                    const el = tierInput(q);
                    const v  = Number(el?.value || 0);
                    if (!el?.value) continue;

                    if (v <= 0)
                        return fail(`price_${q}`, `سعر ${q} نسخ يجب أن يكون أكبر من صفر`);

                    if (v >= unit * q)
                        return fail(`price_${q}`,
                            `سعر ${q} نسخ (${fmt(v)} دج) يجب أن يقلّ عن ${fmt(unit * q)} دج — وإلّا فليس تخفيضاً`);
                }
            }

            if (!document.getElementById("rights_confirmed")?.checked)
                return fail("rights_confirmed", "لا يمكن إرسال الطلب دون الإقرار بحقوق النشر");
        }

        return true;
    }

    function val(id) { return document.getElementById(id)?.value.trim() || ""; }

    function isEmail(v) { return /^\S+@\S+\.\S+$/.test(v); }

    function fail(id, msg) {
        showAlert("err", msg);
        const el = document.getElementById(id);
        el?.classList.add("invalid");
        el?.focus();
        return false;
    }

    function clearMarks() {
        document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
    }

    form?.addEventListener("input", e => e.target.classList.remove("invalid"));


    /* ========================================
       📎 ملف الكتاب
       ======================================== */

    const fileInput  = document.getElementById("file");
    const dropZone   = document.getElementById("dropZone");
    const fileChosen = document.getElementById("fileChosen");

    fileInput?.addEventListener("change", showFile);

    function showFile() {
        const f = fileInput.files?.[0];
        if (!f) return;

        const nm = document.getElementById("fileName");
        const sz = document.getElementById("fileSize");
        if (nm) nm.textContent = f.name;
        if (sz) sz.textContent = humanSize(f.size);

        if (dropZone)   dropZone.hidden   = true;
        if (fileChosen) fileChosen.hidden = false;

        updateAvailNote();
    }

    document.getElementById("fileRemove")?.addEventListener("click", () => {
        fileInput.value = "";
        if (dropZone)   dropZone.hidden   = false;
        if (fileChosen) fileChosen.hidden = true;
        updateAvailNote();
    });

    /* السحب والإفلات */
    ["dragenter", "dragover"].forEach(ev =>
        dropZone?.addEventListener(ev, e => {
            e.preventDefault();
            dropZone.classList.add("over");
        }));

    ["dragleave", "drop"].forEach(ev =>
        dropZone?.addEventListener(ev, e => {
            e.preventDefault();
            dropZone.classList.remove("over");
        }));

    dropZone?.addEventListener("drop", e => {
        const f = e.dataTransfer?.files?.[0];
        if (!f) return;
        fileInput.files = e.dataTransfer.files;
        showFile();
    });


    /* ========================================
       🖼️ غلاف الكتاب
       ----------------------------------------
       نعرض معاينة فورية: المؤلف يرى غلافه كما
       سيظهر في المكتبة قبل أن يرسل.
       ======================================== */

    const coverInput  = document.getElementById("cover");
    const coverZone   = document.getElementById("coverZone");
    const coverChosen = document.getElementById("coverChosen");

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

        const nm = document.getElementById("coverName");
        const sz = document.getElementById("coverSize");
        if (nm) nm.textContent = f.name;
        if (sz) sz.textContent = humanSize(f.size);

        if (coverZone)   coverZone.hidden   = true;
        if (coverChosen) coverChosen.hidden = false;
    });

    document.getElementById("coverRemove")?.addEventListener("click", () => {
        coverInput.value = "";
        if (coverZone)   coverZone.hidden   = false;
        if (coverChosen) coverChosen.hidden = true;
    });


    /* ---------- صورة المؤلف ---------- */

    const photo = document.getElementById("author_photo");
    photo?.addEventListener("change", () => {
        const f = photo.files?.[0];
        const label = document.getElementById("photoLabel");
        if (label) label.textContent = f ? f.name : "اختر صورة — اختياري";
    });


    /* ========================================
       📤 الإرسال
       ----------------------------------------
       لا نرسل حقل حالة. الخادم يستنتج الإتاحة
       من وجود file ووجود price — فحقلٌ يصف ما
       تصفه الحقول الأخرى يفتح باب التناقض.
       ======================================== */

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validate(3)) return;

        const original = submitBtn.innerHTML;
        submitBtn.disabled  = true;
        submitBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جارٍ الإرسال...`;

        try {
            const fd = new FormData();

            [
                "author_name", "author_title", "author_email", "author_phone",
                "author_address", "author_bio", "author_extra",
                "book_title", "book_description", "category_id",
                "language", "pages", "publication_year", "legal_deposit",
            ].forEach(k => {
                const v = document.getElementById(k)?.value.trim();
                if (v) fd.append(k, v);
            });

            if (photo?.files?.[0])      fd.append("author_photo", photo.files[0]);
            if (coverInput?.files?.[0]) fd.append("cover", coverInput.files[0]);
            if (fileInput?.files?.[0])  fd.append("file", fileInput.files[0]);

            // التسعير — لا يُرسل منه إلا ما مُلئ فعلاً
            if (unitPrice()) {
                fd.append("price", String(unitPrice()));

                TIERS.forEach(q => {
                    const v = val(`price_${q}`);
                    if (v) fd.append(`price_${q}`, v);
                });

                fd.append("sale_email", val("sale_email"));
            }

            fd.append("rights_confirmed", "1");

            await apiPost("/submissions", fd, true);

            // نُظهر التأكيد بدل الاستمارة — الطلب انتهى
            form.hidden = true;
            if (bar) bar.hidden = true;

            const em = document.getElementById("doneEmail");
            if (em) em.textContent = val("author_email");

            if (doneBox) doneBox.hidden = false;
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (error) {
            console.error("Error submitting:", error);

            const msg = error.errors
                ? Object.values(error.errors).flat().join(" · ")
                : (error.message || "تعذّر إرسال الطلب، حاول مرة أخرى");

            showAlert("err", msg);
            submitBtn.disabled  = false;
            submitBtn.innerHTML = original;
        }
    });


    /* ---------- مساعدات ---------- */

    function showAlert(kind, text) {
        if (!alertBox) return;
        alertBox.hidden = false;
        alertBox.className = `alert ${kind}`;
        alertBox.innerHTML = `<i class='bx bx-error-circle'></i><span>${escapeText(text)}</span>`;
    }

    function hideAlert() {
        if (alertBox) alertBox.hidden = true;
    }

    function humanSize(bytes) {
        if (!bytes) return "٠ بايت";
        const units = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    }

    /* فاصل الآلاف مسافةٌ لا نقطة — «2.102» تُقرأ
       فاصلةً عشرية فيظنّ المؤلف السعر ديناريْن */
    function fmt(n) {
        return String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
    }


    /* الحالة الابتدائية تُضبط قبل أن يلمس المؤلف شيئاً */
    syncSale();
});