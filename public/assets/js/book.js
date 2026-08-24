/* ========================================
   📕 دار سامي — صفحة الكتاب
   ----------------------------------------
   ⚠️ الهيدر · الفوتر · الحالات · كرت الكتاب ·
      المفضّلة  →  كلها في partials.js
   ----------------------------------------
   لا تقييم · لا مراجعات · لا اقتباسات.
   ----------------------------------------
   الشراء: الدار خارج المعاملة. الطلب يذهب من
   القارئ إلى المؤلف مباشرةً، ولا مال يمرّ عبر
   الموقع ولا رقم حساب يُعرض.

   وللكتاب سعران مستقلّان:
     price_digital  الملف — إن غاب فالتنزيل مجاني
     price_print    نسخة مطبوعة تُشحن

   فيمكن أن يكون الملف مجانياً والمطبوع بثمن.

   وجهة الطلب: sale_email وحده — البريد الذي
   كتبه المؤلف عمداً لتواصل الدفع. بريده الشخصي
   في الخطوة الأولى لا يُعرض أبداً (وعدناه بذلك
   في شروط النشر)، وبريد الدار لا علاقة له.
   فإن غاب sale_email، يُعطَّل زرّ الطلب.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(location.search);
    const ref    = params.get("slug") || params.get("id");

    /* ========================================
       🔒 وجهة الطلب
       ----------------------------------------
       استمارة النشر مفتوحة بلا حساب، فالبريد
       القادم منها بيانات غير موثوقة حتى تراجعها
       الدار. نتعامل معه على هذا الأساس:

       ١ — لا يُعرض إلا sale_email. البريد الشخصي
           للمؤلف لا يظهر أبداً، وبريد الدار لا
           علاقة له بالمعاملة.

       ٢ — يمرّ على تعبير صارم قبل أي استعمال.
           المرفوض هنا ليس الصيغ الغريبة فحسب، بل
           محاولة تهريب معاملات إلى رابط Gmail:
           «x@y.com&bcc=evil@x.com» يُرفض بسبب &.

       ٣ — يُكتب بـtextContent لا innerHTML.

       وهذه كلّها طبقة ثانية. الحاجز الأول أن
       يبقى الطلب pending حتى توافق عليه الدار،
       وأن يُؤكَّد البريد برابط — كلاهما في الخادم.
       ======================================== */

    const MAIL_RE = /^[^\s@<>"'`,;&=?/\\]+@[^\s@<>"'`,;&=?/\\]+\.[A-Za-z]{2,}$/;

    function orderEmail(b) {
        const mail = String(b?.sale_email || "").trim();
        if (!mail || mail.length > 254) return "";
        return MAIL_RE.test(mail) ? mail : "";
    }

    let book = null;

    if (!ref) {
        fail("لم يتم تحديد الكتاب");
        return;
    }

    load();


    /* ========================================
       📥 التحميل
       ======================================== */

    async function load() {
        try {
            const res = await apiGet(`/books/${ref}`);
            book = res.data;
            if (!book) throw new Error("رد فارغ");

            render(book);
            loadAuthor(book);
            loadRelated(book);

        } catch (error) {
            console.error("Error loading book:", error);
            fail(error.status === 404
                ? "هذا الكتاب غير موجود"
                : "تعذّر تحميل الكتاب");
        }
    }

    function fail(msg) {
        setText("bookTitle", msg);
        setText("crumbBook", "—");
        setText("bookDescription", "تحقّقي من الرابط أو من الاتصال بالسيرفر.");

        // لا معنى لعرض أقسام فارغة لكتاب لم يُحمَّل
        ["authorSection", "shareSection", "moreByAuthor", "relatedSection", "descSection"]
            .forEach(id => document.getElementById(id)?.remove());
        document.getElementById("bookActions")?.remove();
    }


    /* ========================================
       🎨 الرسم
       ======================================== */

    function render(b) {
        const author = b.author   || {};
        const cat    = b.category || {};
        const file   = (b.files || [])[0];

        document.title = `${b.title} - مكتبة سامي الرقمية`;
        updateShareTags(b);

        /* ---------- المسار ---------- */
        setText("crumbBook", b.title);
        const crumbCat = document.getElementById("crumbCat");
        if (crumbCat && cat.slug) {
            crumbCat.textContent = cat.name;
            crumbCat.href = `/index.html?category=${encodeURIComponent(cat.slug)}`;
        }

        /* ---------- الغلاف ---------- */
        const box = document.getElementById("bookCoverBox");
        if (box) {
            box.innerHTML = b.cover
                ? `<img src="${escapeAttr(b.cover)}" alt="${escapeAttr(b.title)}">`
                : `<div class="cover-fallback"><span>${escapeText(b.title)}</span></div>`;
        }

        /* ---------- العنوان والمؤلف ---------- */
        setText("bookTitle", b.title);
        setText("bookAuthorName", titleLabel(author.title) + (author.name || "—"));

        const authorLink = document.getElementById("bookAuthorLink");
        if (authorLink && author.slug) {
            authorLink.href = `/author-profile.html?slug=${encodeURIComponent(author.slug)}`;
        }

        /* ---------- المعطيات ---------- */
        setText("factLang",  languageLabel(b.language));
        setText("factPages", b.pages ? `${b.pages}` : "—");
        setText("factYear",  b.publication_year || "—");

        const factCat = document.getElementById("factCat");
        if (factCat) {
            factCat.textContent = cat.name || "—";
            if (cat.slug) factCat.href = `/index.html?category=${encodeURIComponent(cat.slug)}`;
        }

        setText("bookDescription", b.description || "لا يوجد وصف لهذا الكتاب.");

        renderActions(b, file);
        initFavButton(b);
        initShare(b);
        initBuyModal(b);
    }


    /* ========================================
       🎬 أزرار الإجراء
       ----------------------------------------
       الكتاب المدفوع لا يُعرض له زرّ تنزيل أصلاً —
       إخفاؤه أوضح من عرضه ثمّ منعه.
       ======================================== */

    /* ========================================
       💰 قراءة السعرين
       ----------------------------------------
       ⚠️ الفرق بين undefined و null حاسم هنا:

         undefined = الخادم قديم لا يعرف الحقلين،
                     فنعود إلى is_paid/price
         null      = الخادم يعرفهما ويقول «لا سعر»

       بـ?? وحده كان null يُفهم غياباً، فيسقط إلى
       price ويعرض نسخة إلكترونية بسعر النسخة
       الورقية — كتابٌ مطبوع يُباع مرّتين.
       ======================================== */

    function prices(b) {
        const knows = b.price_print !== undefined || b.price_digital !== undefined;

        return {
            digital: Number(knows ? b.price_digital : (b.is_paid ? b.price : 0)) || 0,
            paper:   Number(b.price_print) || 0,
        };
    }


    function renderActions(b, file) {
        const box = document.getElementById("bookActions");
        if (!box) return;

        const { digital, paper } = prices(b);
        const canOrder = !!orderEmail(b);
        const parts    = [];

        /* ---------- النسخة الإلكترونية ---------- */

        if (digital > 0) {
            // مدفوعة: لا زرّ تنزيل — إخفاؤه أوضح من عرضه ثمّ منعه
            parts.push(`
                <div class="offer">
                    <div class="offer-top">
                        <i class='bx bx-file'></i>
                        <span>النسخة الإلكترونية</span>
                        <b class="offer-price">${formatPrice(digital)}</b>
                    </div>
                    ${canOrder ? `
                        <button class="btn-act primary" data-buy="digital" type="button">
                            <i class='bx bx-cart-alt'></i> اطلب النسخة الإلكترونية
                        </button>` : `
                        <button class="btn-act disabled" disabled>
                            <i class='bx bx-envelope'></i> الطلب غير متاح حالياً
                        </button>`}
                </div>`);

        } else if (file) {
            const url = file.url || `/api/books/${b.id}/download/${file.id}`;
            parts.push(`
                <div class="offer free">
                    <div class="offer-top">
                        <i class='bx bx-file'></i>
                        <span>النسخة الإلكترونية</span>
                        <b class="offer-price free">مجاناً</b>
                    </div>
                    <div class="offer-btns">
                        <a class="btn-act primary" href="${escapeAttr(url)}" download>
                            <i class='bx bx-download'></i> تحميل الكتاب
                        </a>
                        <a class="btn-act ghost" href="${escapeAttr(url)}" target="_blank" rel="noopener">
                            <i class='bx bx-book-open'></i> قراءة
                        </a>
                    </div>
                    ${file.size_human ? `
                        <p class="act-hint">
                            <i class='bx bx-file'></i>
                            <span>${escapeText(String(file.type || "").toUpperCase())} · ${escapeText(file.size_human)}</span>
                        </p>` : ""}
                </div>`);
        }

        /* ---------- النسخة الورقية ---------- */

        if (paper > 0) {
            parts.push(`
                <div class="offer">
                    <div class="offer-top">
                        <i class='bx bx-book'></i>
                        <span>النسخة الورقية</span>
                        <b class="offer-price">${formatPrice(paper)}</b>
                    </div>
                    ${canOrder ? `
                        <button class="btn-act primary" data-buy="print" type="button">
                            <i class='bx bx-cart-alt'></i> اطلب النسخة الورقية
                        </button>
                        <p class="act-hint">
                            <i class='bx bx-info-circle'></i>
                            <span>حدّد عدد النسخ، ثم أرسل طلبك إلى المؤلف مباشرةً</span>
                        </p>` : `
                        <button class="btn-act disabled" disabled>
                            <i class='bx bx-envelope'></i> الطلب غير متاح حالياً
                        </button>`}
                </div>`);
        }

        if (parts.length === 0) {
            box.innerHTML = `
                <button class="btn-act disabled" disabled>
                    <i class='bx bx-x'></i> غير متوفّر للتنزيل
                </button>`;
            return;
        }

        if ((digital > 0 || paper > 0) && !canOrder) {
            parts.push(`
                <p class="act-hint">
                    <i class='bx bx-info-circle'></i>
                    <span>
                        بيانات التواصل مع المؤلف غير متوفّرة —
                        <a href="/about.html#contact">راسل الدار</a> للاستفسار
                    </span>
                </p>`);
        }

        box.innerHTML = parts.join("");
    }


    /* ========================================
       ❤️ المفضّلة
       ======================================== */

    function initFavButton(b) {
        const btn = document.getElementById("bookFav");
        if (!btn) return;

        paint(isFavorite(b.id));

        btn.addEventListener("click", () => paint(toggleFavorite(b.id)));

        function paint(on) {
            btn.classList.toggle("on", on);
            btn.innerHTML = on
                ? `<i class='bx bxs-heart'></i><span>في المفضّلة</span>`
                : `<i class='bx bx-heart'></i><span>أضف للمفضّلة</span>`;
        }
    }


    /* ========================================
       ✍️ عن المؤلف + كتبه
       ======================================== */

    async function loadAuthor(b) {
        const slug = b.author?.slug;
        if (!slug) return;

        try {
            const res = await apiGet(`/authors/${slug}`);
            const a   = res.data;
            if (!a) return;

            const sec = document.getElementById("authorSection");
            if (sec) sec.hidden = false;

            setText("authorFullName", titleLabel(a.title) + a.name);

            const photo = document.getElementById("authorPhoto");
            if (photo) {
                photo.innerHTML = a.photo
                    ? `<img src="${escapeAttr(a.photo)}" alt="${escapeAttr(a.name)}">`
                    : escapeText((a.name || "؟").charAt(0));
            }

            /* الرتبة وعدد الكتب — الجنسية والسنوات
               لم تعودا تُجمَعان في استمارة النشر */
            const bits = [];
            const rank = { professor: "أستاذ", doctor: "دكتور", researcher: "باحث" }[a.title];
            if (rank) bits.push(rank);
            if (a.books_count) {
                bits.push(`${a.books_count} ${Number(a.books_count) === 1 ? "كتاب" : "كتباً"} في المكتبة`);
            }
            setText("authorMeta", bits.join(" · "));

            const bio = document.getElementById("authorBio");
            if (bio) {
                bio.textContent = a.bio || "";
                bio.hidden = !a.bio;
            }

            const link = document.getElementById("authorPageLink");
            if (link) link.href = `/author-profile.html?slug=${encodeURIComponent(slug)}`;

            renderAuthorBooks(a, b);

        } catch (error) {
            console.error("Error loading author:", error);
        }
    }

    function renderAuthorBooks(a, current) {
        const others = (a.books || []).filter(x => String(x.id) !== String(current.id));
        const grid   = document.getElementById("authorBooksGrid");
        const sec    = document.getElementById("moreByAuthor");

        // لا نعرض القسم أصلاً إن لم يكن للمؤلف كتاب آخر —
        // عنوان فوق فراغ أسوأ من غياب القسم
        if (others.length === 0 || !grid) return;

        sec.hidden = false;
        renderBookGrid(grid, others.slice(0, 4));

        const all = document.getElementById("allAuthorBooks");
        if (all) all.href = `/author-profile.html?slug=${encodeURIComponent(a.slug)}`;
    }


    /* ========================================
       🔗 كتب من نفس القسم
       ======================================== */

    async function loadRelated(b) {
        const grid = document.getElementById("relatedGrid");
        const sec  = document.getElementById("relatedSection");
        if (!grid) return;

        const slug = b.category?.slug;
        if (!slug) { sec?.remove(); return; }

        showLoading(grid, 4);

        const all = document.getElementById("allCatBooks");
        if (all) all.href = `/index.html?category=${encodeURIComponent(slug)}`;

        try {
            const res = await apiGet(`/books?category=${encodeURIComponent(slug)}&per_page=8`);

            const list = (res.data || [])
                .filter(x => String(x.id) !== String(b.id))
                .slice(0, 4);

            if (list.length === 0) { sec?.remove(); return; }

            renderBookGrid(grid, list);

        } catch (error) {
            console.error("Error loading related books:", error);
            sec?.remove();
        }
    }


    /* ========================================
       🛒 نافذة الطلب
       ----------------------------------------
       الدار ليست وسيطاً: لا حساب بريدي ولا وصل
       تحويل. القارئ يحدّد عدد النسخ، فتُبنى له
       رسالة جاهزة تذهب إلى بريد المؤلف.

       أسعار الجملة التي حدّدها المؤلف عند النشر
       (price_2 · price_3 · price_4) تُطبَّق هنا —
       وإلّا كانت بيانات تُجمَع ولا تُستعمل.
       ======================================== */

    function initBuyModal(b) {
        const { digital, paper } = prices(b);
        if (!digital && !paper) return;

        const overlay = document.getElementById("buyOverlay");
        if (!overlay) return;

        const target = orderEmail(b);
        if (!target) return;

        const qtyInput = document.getElementById("buyQty");
        const qtyBox   = document.getElementById("buyQtyBox");
        const totalBox = document.getElementById("buyTotal");
        const btAmount = document.getElementById("btAmount");
        const btLabel  = document.getElementById("btLabel");
        const btSave   = document.getElementById("btSave");
        const mailBtn  = document.getElementById("mailBtn");
        const copyMsg  = document.getElementById("copyMsgBtn");

        const MAXQ = 99;
        let kind = paper ? "print" : "digital";

        setText("buyBookTitle", b.title);
        setText("targetEmail", target);

        const unit = () => (kind === "print" ? paper : digital);

        // أسعار الجملة للورقية وحدها — لا معنى لشراء
        // ثلاث نسخ من ملفٍ إلكتروني واحد
        function tierPrice(q) {
            if (kind !== "print") return 0;
            const t = Number(b[`price_${q}`] || 0);
            return t > 0 ? t : 0;
        }

        function totalFor(q) { return tierPrice(q) || unit() * q; }

        function qty() {
            if (kind === "digital") return 1;
            const n = Math.floor(Number(qtyInput?.value) || 1);
            return Math.min(Math.max(n, 1), MAXQ);
        }

        function sync() {
            const q = qty();
            if (qtyInput && kind === "print") qtyInput.value = q;

            const isPrint = kind === "print";

            setText("buyKind", isPrint ? "النسخة الورقية" : "النسخة الإلكترونية");
            setText("buyUnitPrice", formatPrice(unit()));
            setText("buyUnitNote", isPrint ? "للنسخة الواحدة" : "نسخة واحدة");

            const icon = document.getElementById("buyIcon");
            if (icon) icon.className = isPrint ? "bx bx-book" : "bx bx-file";

            if (qtyBox)   qtyBox.hidden   = !isPrint;
            if (totalBox) totalBox.hidden = !(isPrint && q >= 2);

            const total = totalFor(q);
            const plain = unit() * q;

            if (btLabel)  btLabel.textContent  = `المجموع · ${q} نسخ`;
            if (btAmount) btAmount.textContent = formatPrice(total);

            if (btSave) {
                const save = plain - total;
                if (save > 0) {
                    const pct = Math.round((save / plain) * 100);
                    btSave.textContent = `سعر جملة حدّده المؤلف — توفير ${formatPrice(save)} (${pct}٪)`;
                    btSave.hidden = false;
                } else {
                    btSave.hidden = true;
                }
            }

            buildMessage(q, total);
        }

        let subject = "", body = "";

        function buildMessage(q, total) {
            const label = kind === "print" ? "نسخة ورقية" : "نسخة إلكترونية";
            subject = `طلب كتاب: ${b.title}`;
            body =
                `السلام عليكم،\n\n` +
                `أرغب في الحصول على الكتاب التالي:\n\n` +
                `• اسم الكتاب: ${b.title}\n` +
                `• اسم المؤلف: ${b.author?.name || "—"}\n` +
                `• الصيغة المطلوبة: ${label}\n` +
                (kind === "print" ? `• عدد النسخ المطلوبة: ${q}\n` : "") +
                `• المبلغ الإجمالي: ${formatPrice(total)}\n\n` +
                `أرجو إعلامي بطريقة الدفع والتسليم.`;

            if (mailBtn) {
                mailBtn.href =
                    `https://mail.google.com/mail/?view=cm&fs=1` +
                    `&to=${encodeURIComponent(target)}` +
                    `&su=${encodeURIComponent(subject)}` +
                    `&body=${encodeURIComponent(body)}`;
                mailBtn.target = "_blank";
                mailBtn.rel    = "noopener";
            }
        }

        document.getElementById("qtyMinus")?.addEventListener("click", () => {
            if (qtyInput) qtyInput.value = Math.max(1, qty() - 1);
            sync();
        });

        document.getElementById("qtyPlus")?.addEventListener("click", () => {
            if (qtyInput) qtyInput.value = Math.min(MAXQ, qty() + 1);
            sync();
        });

        qtyInput?.addEventListener("input", sync);
        qtyInput?.addEventListener("blur",  sync);

        copyMsg?.addEventListener("click", () => {
            navigator.clipboard.writeText(
                `إلى: ${target}\nالموضوع: ${subject}\n\n${body}`
            ).then(() => flash(copyMsg,
                `<i class='bx bx-check'></i><span>نُسخت الرسالة</span>`, 2200));
        });

        copyBtn("mailCopy", () => target);

        const close = () => { overlay.hidden = true; document.body.style.overflow = ""; };

        // كل زرّ طلب يفتح النافذة على نوعه
        document.querySelectorAll("[data-buy]").forEach(btn => {
            btn.addEventListener("click", () => {
                kind = btn.dataset.buy;
                if (qtyInput) qtyInput.value = 1;
                sync();
                overlay.hidden = false;
                document.body.style.overflow = "hidden";
            });
        });

        document.getElementById("buyClose")?.addEventListener("click", close);
        overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !overlay.hidden) close();
        });

        sync();
    }


    function copyBtn(id, getText) {
        const btn = document.getElementById(id);
        btn?.addEventListener("click", () => {
            navigator.clipboard.writeText(getText())
                .then(() => flash(btn, `<i class='bx bx-check'></i>`, 1600));
        });
    }

    function flash(btn, html, ms) {
        const old = btn.innerHTML;
        btn.innerHTML = html;
        btn.classList.add("done");
        setTimeout(() => {
            btn.innerHTML = old;
            btn.classList.remove("done");
        }, ms);
    }


    /* ========================================
       🔗 المشاركة
       ======================================== */

    function initShare(b) {
        const url   = () => location.href;
        const text  = () => `${b.title}${b.author?.name ? ` — ${b.author.name}` : ""}`;

        popup("shareWhatsApp", () => `https://wa.me/?text=${encodeURIComponent(text() + "\n" + url())}`);
        popup("shareFacebook", () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`);
        popup("shareTelegram", () => `https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(text())}`);

        document.getElementById("copyLink")?.addEventListener("click", (e) => {
            navigator.clipboard.writeText(url()).then(() => {
                const btn = e.currentTarget;
                btn.innerHTML = `<i class='bx bx-check'></i>`;
                setTimeout(() => { btn.innerHTML = `<i class='bx bx-link'></i>`; }, 1600);
            });
        });
    }

    function popup(id, build) {
        document.getElementById(id)?.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(build(), "_blank", "width=600,height=420,noopener");
        });
    }


    /* ========================================
       🔖 وسوم المشاركة
       ----------------------------------------
       ⚠️ واتساب وفيسبوك يقرآن الوسوم من HTML قبل
       تشغيل الجافاسكريبت، فهذا لا يُغيّر البطاقة.
       الحلّ الحقيقي في الخادم (انظري API.md).
       ======================================== */

    function updateShareTags(b) {
        const title = `${b.title}${b.author?.name ? ` — ${b.author.name}` : ""}`;
        const desc  = (b.description || "").slice(0, 155).trim();
        const img   = b.cover
            ? new URL(b.cover, location.origin).href
            : `${location.origin}/assets/img/og-default.png`;

        meta("property", "og:title",       title);
        meta("property", "og:description", desc);
        meta("property", "og:image",       img);
        meta("property", "og:url",         location.href);
        meta("name",     "description",    desc);
        meta("name",     "twitter:title",  title);
        meta("name",     "twitter:image",  img);

        document.querySelector('link[rel="canonical"]')?.setAttribute("href", location.href);
    }

    function meta(attr, key, value) {
        if (!value) return;
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.setAttribute("content", value);
    }


    /* ---------- مساعدات ---------- */

    function setText(id, v) {
        const el = document.getElementById(id);
        if (el) el.textContent = v ?? "—";
    }

    function languageLabel(c) {
        return { ar: "العربية", en: "الإنجليزية", fr: "الفرنسية" }[c] || c || "العربية";
    }

    function titleLabel(t) {
        return { professor: "أ. ", doctor: "د. ", researcher: "" }[t] || "";
    }
});