/* ========================================
   📕 دار سامي — صفحة الكتاب
   ----------------------------------------
   ⚠️ الهيدر · الفوتر · الحالات · كرت الكتاب ·
      المفضّلة  →  كلها في partials.js
   ----------------------------------------
   لا تقييم · لا مراجعات · لا اقتباسات.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(location.search);
    const ref    = params.get("slug") || params.get("id");

    /* بيانات الدار — تُضبط من الخادم لاحقاً عبر /api/settings.
       ⚠️ أرقام مؤقّتة: يجب استبدالها ببيانات الدار الحقيقية
       قبل النشر، وإلّا حوّل الزوّار إلى حساب غير موجود. */
    const HOUSE = {
        email:  "contact@sami-library.com",
        ccp:    "0000000000 00",              // رقم بريدي موب
        holder: "دار سامي للطباعة والنشر والتوزيع",
    };



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
        ["authorSection", "moreByAuthor", "relatedSection", "descSection"]
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
        setText("factSize",  file?.size_human || "—");
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

    function renderActions(b, file) {
        const box = document.getElementById("bookActions");
        if (!box) return;

        if (b.is_paid) {
            box.innerHTML = `
                <div class="price-tag">
                    <i class='bx bx-purchase-tag'></i>
                    <span>${formatPrice(b.price)}</span>
                </div>
                <button class="btn-act primary" id="buyBtn" type="button">
                    <i class='bx bx-envelope'></i> احصل على الكتاب
                </button>
                <p class="act-hint">
                    <i class='bx bx-info-circle'></i>
                    تُرسَل النسخة إلى بريدك بعد تأكيد التحويل
                </p>
            `;
            return;
        }

        if (!file) {
            box.innerHTML = `
                <button class="btn-act disabled" disabled>
                    <i class='bx bx-x'></i> غير متوفّر للتنزيل
                </button>
            `;
            return;
        }

        const url = `/api/books/${b.id}/download/${file.id}`;

        box.innerHTML = `
            <a class="btn-act primary" href="${url}" download>
                <i class='bx bx-download'></i> تحميل الكتاب
            </a>
            <a class="btn-act ghost" href="${url}" target="_blank" rel="noopener">
                <i class='bx bx-book-open'></i> قراءة
            </a>
        `;
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

            // السطر التعريفي يُبنى ممّا توفّر فقط
            const bits = [];
            if (a.nationality) bits.push(a.nationality);
            if (a.birth_year)  bits.push(`${a.birth_year}${a.death_year ? ` — ${a.death_year}` : ""}`);
            if (a.books_count) bits.push(`${a.books_count} كتاباً في المكتبة`);
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
       💳 نافذة الشراء
       ----------------------------------------
       بدل مطالبة الزائر بكتابة رسالة من الصفر،
       نجهّزها له: العنوان والمتن مكتوبان، ولا يبقى
       عليه إلا إرفاق صورة الوصل. كلّ حقل يُطلب منه
       كتابته هو فرصة لخطأ أو انسحاب.
       ======================================== */

    function initBuyModal(b) {
        if (!b.is_paid) return;

        const overlay = document.getElementById("buyOverlay");
        if (!overlay) return;

        setText("buyBookTitle", b.title);
        setText("buyPrice", formatPrice(b.price));
        setText("ribHolder", HOUSE.holder);
        setText("ribNumber", HOUSE.ccp);
        setText("houseEmail", HOUSE.email);

        /* الرسالة الجاهزة */
        const subject = `طلب كتاب: ${b.title}`;
        const body =
            `السلام عليكم،\n\n` +
            `حوّلت مبلغ الكتاب التالي وأرفقت وصل التسديد:\n\n` +
            `• اسم الكتاب: ${b.title}\n` +
            `• اسم المؤلف: ${b.author?.name || "—"}\n` +
            `• المبلغ المحوَّل: ${formatPrice(b.price)}\n\n` +
            `مرفق طيّه وصل تسديد المبلغ.\n\n` +
            `الاسم: \n` +
            `رقم الهاتف: \n\n` +
            `وشكراً.`;

            /* mailto يعتمد على برنامج بريد مثبَّت على الجهاز —
           ومعظم من يستعمل Gmail من المتصفّح لا يملك واحداً،
           فلا يحدث شيء عند النقر. لذلك نفتح Gmail مباشرة،
           ونترك النسخ كبديل مضمون في كل الحالات. */

        const gmailUrl =
            `https://mail.google.com/mail/?view=cm&fs=1` +
            `&to=${encodeURIComponent(HOUSE.email)}` +
            `&su=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        const mail = document.getElementById("mailBtn");
        if (mail) {
            mail.href   = gmailUrl;
            mail.target = "_blank";
            mail.rel    = "noopener";
        }

        // زرّ النسخ — يعمل بلا بريد ولا حساب جوجل
        const copyMsg = document.getElementById("copyMsgBtn");
        copyMsg?.addEventListener("click", () => {
            navigator.clipboard.writeText(
                `إلى: ${HOUSE.email}\nالموضوع: ${subject}\n\n${body}`
            ).then(() => {
                const old = copyMsg.innerHTML;
                copyMsg.innerHTML = `<i class='bx bx-check'></i><span>نُسخت الرسالة</span>`;
                copyMsg.classList.add("done");
                setTimeout(() => {
                    copyMsg.innerHTML = old;
                    copyMsg.classList.remove("done");
                }, 2200);
            });
        });
    

      

        const open  = () => { overlay.hidden = false; document.body.style.overflow = "hidden"; };
        const close = () => { overlay.hidden = true;  document.body.style.overflow = ""; };

        document.getElementById("buyBtn")?.addEventListener("click", open);
        document.getElementById("buyClose")?.addEventListener("click", close);

        overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && !overlay.hidden) close();
        });

        copyBtn("ribCopy",  () => HOUSE.ccp);
        copyBtn("mailCopy", () => HOUSE.email);
    }

    function copyBtn(id, getText) {
        const btn = document.getElementById(id);
        btn?.addEventListener("click", () => {
            navigator.clipboard.writeText(getText()).then(() => {
                const old = btn.innerHTML;
                btn.innerHTML = `<i class='bx bx-check'></i>`;
                btn.classList.add("done");
                setTimeout(() => {
                    btn.innerHTML = old;
                    btn.classList.remove("done");
                }, 1600);
            });
        });
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
