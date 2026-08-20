/* ========================================
   🧩 مكتبة سامي الرقمية — العناصر المشتركة
   الهيدر · قائمة الجوال · مودال البحث · الفوتر
   ----------------------------------------
   ⚠️ هذا الملف يعمل فوراً (بدون DOMContentLoaded)
   لأنه يُحمَّل في نهاية <body> فتكون العناصر موجودة.
   هذا مقصود: يضمن أن الهيدر يوجد قبل أن تعمل ملفات الصفحات.
   ----------------------------------------
   ترتيب التحميل الإجباري في كل صفحة:
     api.js  →  partials.js  →  ملف الصفحة
   ======================================== */


/* ========================================
   1️⃣ الهيدر
   ======================================== */

const HEADER_HTML = `
<header class="header-anim">
    <div class="navbar">
        <div class="logo">
            <a href="/index.html">
                <img src="/assets/img/logo.png" alt="شعار دار سامي">
            </a>
        </div>

        <button class="hamburger-btn" id="hamburgerBtn" aria-label="القائمة">
            <i class='bx bx-menu'></i><i class='bx bx-x'></i>
        </button>

        <div class="nav-right desktop-nav">
            <ul class="link main-links">
                <li><a href="/index.html" class="nav-link" data-nav="home"><i class='bx bx-home-alt-2'></i> الرئيسية</a></li>
                <li><a href="/class.html" class="nav-link" data-nav="class"><i class='bx bx-category'></i> أقسام الكتب</a></li>
                <li><a href="/author.html" class="nav-link" data-nav="author"><i class='bx bx-user-pin'></i> المؤلفون</a></li>
                <li><a href="/upload-book.html" class="nav-link" data-nav="upload"><i class='bx bx-upload'></i> نشر كتاب</a></li>
                <li><a href="/print-book.html" class="nav-link" data-nav="print"><i class='bx bx-printer'></i> طباعة كتاب</a></li>
                <li><a href="/about.html" class="nav-link" data-nav="about"><i class='bx bx-buildings'></i> من نحن</a></li>
                
            </ul>
        </div>

        <div class="nav-left desktop-nav">
            <a href="/favorites.html" class="btn-fav-link" data-nav="favorites">
                <i class='bx bx-heart'></i>
                <span>مفضّلاتي</span>
                <b class="fav-count" id="favCount" hidden>0</b>
            </a>

            <!-- يظهر للمؤلف الداخل وحده — يُكشف من auth.js.
                 مخفيّ في الـHTML لا بعد الرسم، وإلّا ومض للزائر. -->
            <a href="/account.html" class="btn-acc-link" id="accLink" data-nav="account" hidden>
                <i class='bx bx-user-circle'></i>
                <span>حسابي</span>
            </a>
        </div>
    </div>
</header>

<div class="mobile-nav-overlay" id="mobileNavOverlay">
    <div class="mobile-nav">
        <div class="mobile-nav-header">
            <div class="logo"><a href="/index.html"><i class='bx bx-book-reader'></i> سامي</a></div>
            <button class="close-mobile-nav" id="closeMobileNav"><i class='bx bx-x'></i></button>
        </div>
        <ul class="mobile-links">
            <li><a href="/index.html" class="mobile-link" data-nav="home"><i class='bx bx-home-alt-2'></i> الرئيسية</a></li>
            <li><a href="/class.html" class="mobile-link" data-nav="class"><i class='bx bx-category'></i> أقسام الكتب</a></li>
            <li><a href="/author.html" class="mobile-link" data-nav="author"><i class='bx bx-user-pin'></i> المؤلفون</a></li>
            <li><a href="/upload-book.html" class="mobile-link" data-nav="upload"><i class='bx bx-upload'></i> نشر كتاب</a></li>
            <li><a href="/print-book.html" class="mobile-link" data-nav="print"><i class='bx bx-printer'></i> طباعة كتاب</a></li>
            <li><a href="/about.html" class="mobile-link" data-nav="about"><i class='bx bx-buildings'></i> من نحن</a></li>
            <li><a href="/favorites.html" class="mobile-link" data-nav="favorites"><i class='bx bx-heart'></i> مفضّلاتي</a></li>
            <li id="accLinkMobile" hidden><a href="/account.html" class="mobile-link" data-nav="account"><i class='bx bx-user-circle'></i> حسابي</a></li>
            
        </ul>
    </div>
</div>
`;


/* ========================================
   2️⃣ مودال البحث
   ملاحظة: أضفنا الكلاسين معاً (search-modal و search-modal-improved)
   لأن الصفحات كانت تستعمل تسميتين مختلفتين.
   ======================================== */

const SEARCH_MODAL_HTML = `
<div class="search-modal-overlay" id="searchModalOverlay">
    <div class="search-modal search-modal-improved">
        <button class="search-modal-close" id="searchModalClose">
            <i class='bx bx-x'></i>
        </button>

        <div class="search-modal-header">
            <h2>البحث عن كتاب</h2>
            <div class="search-underline"></div>
        </div>

        <div class="search-modal-content">
            <div class="search-input-wrapper">
                <input type="text" placeholder="ابحث عن كتاب او مؤلف او قسم كتب" id="modalSearchInput">
            </div>

            <button class="search-btn-large">
                <span>بحث</span>
                <i class='bx bx-search'></i>
            </button>

            <button class="publish-book-btn">
                <i class='bx bx-upload'></i>
                <span>نشر كتاب</span>
            </button>
        </div>
    </div>
</div>
`;


/* ========================================
   3️⃣ الفوتر
   ======================================== */

const FOOTER_HTML = `
<footer class="light-footer">
    <div class="footer-container">

        <!-- تنويه الحقوق + الإبلاغ -->
        <div class="footer-rights">
            <i class='bx bx-shield-quarter'></i>
            <div>
                <p>
                    حقوق الكتب المنشورة عبر منصّة دار سامي محفوظة لمؤلفيها وناشريها.
                </p>
                <p>
                               لا يُنشر أي كتاب دون موافقة صريحة من المؤلف أو الجهة المالكة للحقوق.

                </p>
                <p>
                    إن نُشر كتابك دون علمك أو دون إذنك، أبلغنا لإيقاف عرضه فوراً.
                </p>
                <button class="btn-report" id="openReport" type="button">
                    <i class='bx bx-flag'></i>
                    <span>الإبلاغ عن كتاب</span>
                </button>
            </div>
        </div>

        <div class="footer-grid">

            <div class="footer-column">
                <h3><i class='bx bx-message-square-detail'></i> تواصل معنا</h3>
                <ul class="contact-info">
                    <li><i class='bx bx-map'></i><span>الجزائر</span></li>
                    <li><i class='bx bx-envelope'></i><span>contact@sami-library.com</span></li>
                    <li><i class='bx bx-phone'></i><span dir="ltr">+213 555 123 456</span></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3><i class='bx bx-link-alt'></i> روابط سريعة</h3>
                <ul class="footer-links">
                    <li><a href="/index.html"><i class='bx bx-chevron-left'></i> الرئيسية</a></li>
                    <li><a href="/class.html"><i class='bx bx-chevron-left'></i> أقسام الكتب</a></li>
                    <li><a href="/author.html"><i class='bx bx-chevron-left'></i> المؤلفون</a></li>
                    <li><a href="/favorites.html"><i class='bx bx-chevron-left'></i> مفضّلاتي</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3><i class='bx bx-cog'></i> خدماتنا</h3>
                <ul class="footer-links">
                    <li><a href="/about.html"><i class='bx bx-chevron-left'></i> عن الدار</a></li>
                    <li><a href="/upload-book.html"><i class='bx bx-chevron-left'></i> نشر كتاب</a></li>
                    <li><a href="/print-book.html"><i class='bx bx-chevron-left'></i> طباعة كتاب</a></li>
                    <li><a href="/about.html#contact"><i class='bx bx-chevron-left'></i> تواصل معنا</a></li>
                </ul>
            </div>

        </div>

        <!-- أزرار التواصل الاجتماعي -->
        <div class="social-media-buttons">
            <!-- تُملأ من SOCIAL أدناه — الفارغ منها لا يُرسم -->
        </div>

        <div class="footer-bottom">
            <p>
                حقوق الملكية © <span id="currentYear">2026</span>
                <span class="gradient-text">مكتبة سامي الرقمية</span>
            </p>
            <nav class="footer-legal">
                <a href="/terms.html">شروط الاستخدام</a>
                <span>·</span>
                <a href="/privacy.html">سياسة الخصوصية</a>
            </nav>
        </div>

    </div>

    <button class="scroll-to-top" id="scrollToTop" title="العودة للأعلى">
        <i class='bx bx-up-arrow-alt'></i>
    </button>
</footer>
`;

/* ========================================
   4️⃣ التركيب
   ======================================== */

function mountPartials() {
    const headerSlot = document.getElementById("site-header");
    const footerSlot = document.getElementById("site-footer");

    if (headerSlot) {
        headerSlot.innerHTML = HEADER_HTML + SEARCH_MODAL_HTML;
    }

    if (footerSlot) {
        footerSlot.innerHTML = FOOTER_HTML + REPORT_HTML;
    }

    markActiveLink();
    initMobileNav();
    initSearchModal();
    initScrollToTop();
    initCurrentYear();
    initReport();
    paintFavCount();
}


/* ---------- تعليم الصفحة الحالية ---------- */

function markActiveLink() {
    const page = document.body.dataset.page;
    if (!page) return;

    document.querySelectorAll(`[data-nav="${page}"]`).forEach(el => {
        el.classList.add("active");
    });
}


/* ========================================
   ❤️ المفضّلة — تُحفظ في متصفّح الزائر
   ----------------------------------------
   لا حسابات في هذه النسخة، فالمفضّلة تعيش في
   localStorage. هذا يعني أنها تخصّ هذا المتصفّح
   وحده: تضيع عند مسح بيانات التصفّح، ولا تنتقل
   إلى جهاز آخر. صفحة المفضّلة تُخبر الزائر بذلك
   صراحة — إخفاؤه يجعله يظنّها محفوظة على حساب،
   ولا حساب أصلاً.
   ======================================== */

const FAV_KEY = "sami_favorites";

function getFavorites() {
    try {
        const raw = localStorage.getItem(FAV_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function isFavorite(id) {
    return getFavorites().includes(String(id));
}

function toggleFavorite(id) {
    const key  = String(id);
    const list = getFavorites();
    const i    = list.indexOf(key);

    if (i === -1) list.push(key);
    else          list.splice(i, 1);

    try {
        localStorage.setItem(FAV_KEY, JSON.stringify(list));
    } catch {
        return isFavorite(id);   // التخزين ممتلئ أو معطّل
    }

    paintFavCount();
    return i === -1;
}

function paintFavCount() {
    const n = getFavorites().length;
    document.querySelectorAll("#favCount").forEach(el => {
        el.textContent = n > 99 ? "٩٩+" : n;
        el.hidden = n === 0;
    });
}


/* ---------- قائمة الجوال ---------- */

function initMobileNav() {
    const hamburgerBtn     = document.getElementById("hamburgerBtn");
    const mobileNavOverlay = document.getElementById("mobileNavOverlay");
    const closeMobileNav   = document.getElementById("closeMobileNav");

    function closeNav() {
        mobileNavOverlay?.classList.remove("active");
        hamburgerBtn?.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (hamburgerBtn && mobileNavOverlay) {
        hamburgerBtn.addEventListener("click", () => {
            mobileNavOverlay.classList.add("active");
            hamburgerBtn.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    closeMobileNav?.addEventListener("click", closeNav);

    mobileNavOverlay?.addEventListener("click", (e) => {
        if (e.target === mobileNavOverlay) closeNav();
    });

}


/* ---------- مودال البحث ---------- */

function initSearchModal() {
    const overlay     = document.getElementById("searchModalOverlay");
    const closeBtn    = document.getElementById("searchModalClose");
    const input       = document.getElementById("modalSearchInput");
    const searchBtn   = document.querySelector(".search-btn-large");
    const publishBtn  = document.querySelector(".publish-book-btn");

    function openModal() {
        overlay?.classList.add("active");
        document.body.style.overflow = "hidden";
        setTimeout(() => input?.focus(), 300);
    }

    function closeModal() {
        overlay?.classList.remove("active");
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".search-trigger, .search-icon-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeBtn?.addEventListener("click", closeModal);

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay?.classList.contains("active")) closeModal();
    });

    function runSearch() {
        const q = input?.value.trim();
        if (!q) return;
        // TODO (اليوم الثالث): توجيه لنتائج البحث الحقيقية
        window.location.href = "/index.html?q=" + encodeURIComponent(q);
    }

    searchBtn?.addEventListener("click", runSearch);

    input?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") runSearch();
    });

    publishBtn?.addEventListener("click", () => {
        window.location.href = "/upload-book.html";
    });
}


/* ---------- زر الصعود للأعلى ---------- */

function initScrollToTop() {
    const btn = document.getElementById("scrollToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.pageYOffset > 250) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


/* ---------- السنة الحالية ---------- */

function initCurrentYear() {
    const el = document.getElementById("currentYear");
    if (el) el.textContent = new Date().getFullYear();
}



/* ========================================
   🎭 حالات العرض المشتركة
   ----------------------------------------
   كل صفحة تحتاج أربع حالات:
     تحميل · فارغ · خطأ · غير مسجَّل
   هذه هي الفرق بين مشروع ومسوّدة.
   ======================================== */

/**
 * هياكل تحميل (skeleton) — أفضل من دوّامة التحميل
 * لأن الصفحة لا تقفز عندما تصل البيانات.
 */
function showLoading(el, count = 6, kind = "card") {
    if (!el) return;
    const one = kind === "row"
        ? `<div class="skeleton skeleton-row"></div>`
        : `<div class="skeleton skeleton-card"></div>`;
    el.innerHTML = Array(count).fill(one).join("");
}

/** لا توجد بيانات */
function showEmpty(el, message, icon = "bx-inbox", actionHTML = "") {
    if (!el) return;
    el.innerHTML = `
        <div class="state-box">
            <i class='bx ${icon}'></i>
            <p>${message}</p>
            ${actionHTML}
        </div>
    `;
}

/** خطأ + إمكانية إعادة المحاولة */
function showError(el, retryFn, message = "تعذّر تحميل البيانات") {
    if (!el) return;
    el.innerHTML = `
        <div class="state-box state-error">
            <i class='bx bx-wifi-off'></i>
            <p>${message}</p>
            <button class="btn-retry" type="button">
                <i class='bx bx-refresh'></i> حاول مرة أخرى
            </button>
        </div>
    `;
    if (typeof retryFn === "function") {
        el.querySelector(".btn-retry")?.addEventListener("click", retryFn);
    }
}

/* ========================================
   🧱 مكوّنات مشتركة
   ----------------------------------------
   تُستعمل في الرئيسية والمكتبة والكتب المشابهة —
   تعريف واحد يضمن أن الكرت متطابق في كل مكان.
   ======================================== */

/** نجوم التقييم كنص HTML */

/** كرت كتاب — يقبل شكل BookCard من API.md */
function renderBookCard(book) {
    const author = book.author || {};
    const slug   = book.slug || book.id;
    const id     = book.id;

    const cover = book.cover
        ? `<img src="${escapeAttr(book.cover)}" alt="${escapeAttr(book.title)}" loading="lazy">`
        : `<div class="cover-fallback"><span>${escapeText(book.title)}</span></div>`;

    const badge = book.publication_type === "house_edition"
        ? `<span class="badge-house">من إصداراتنا</span>`
        : "";

    // السعر يظهر للمدفوع فقط — المجاني هو الأصل فلا يُعلَن
    const priceHTML = book.is_paid
        ? `<div class="book-price"><i class='bx bx-purchase-tag'></i>
               <span>${formatPrice(book.price)}</span></div>`
        : "";

    const fav = isFavorite(id);

    return `
        <article class="book-card">
            <a href="/book.html?slug=${encodeURIComponent(slug)}" class="book-image">
                ${cover}${badge}
            </a>
            <button class="card-fav${fav ? " on" : ""}" data-book="${escapeAttr(id)}"
                    type="button" aria-label="${fav ? "إزالة من المفضّلة" : "إضافة للمفضّلة"}">
                <i class='bx ${fav ? "bxs-heart" : "bx-heart"}'></i>
            </button>
            <h3><a href="/book.html?slug=${encodeURIComponent(slug)}">${escapeText(book.title)}</a></h3>
            <p>${escapeText(author.name || "")}</p>
            ${priceHTML}
        </article>
    `;
}

/** السعر بالدينار الجزائري */
function formatPrice(value) {
    return (Number(value) || 0).toLocaleString("ar-DZ") + " دج";
}

/** يربط أزرار القلب — يُستدعى بعد كل رسم */
function bindFavButtons(container) {
    (container || document).querySelectorAll(".card-fav").forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = "1";

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const added = toggleFavorite(btn.dataset.book);
            btn.classList.toggle("on", added);
            btn.setAttribute("aria-label", added ? "إزالة من المفضّلة" : "إضافة للمفضّلة");
            const icon = btn.querySelector("i");
            if (icon) icon.className = added ? "bx bxs-heart" : "bx bx-heart";
        });
    });
}

/** يرسم مجموعة كروت في حاوية */
function renderBookGrid(el, books) {
    if (!el) return;
    el.innerHTML = books.map(renderBookCard).join("");
    bindFavButtons(el);
}


/* ---------- حماية من XSS ---------- */

function escapeText(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
}

function escapeAttr(str) {
    return escapeText(str);
}


/* ========================================
   ✨ الظهور عند التمرير — مشترك لكل الصفحات
   ----------------------------------------
   يُستدعى تلقائياً عند تحميل الصفحة،
   وتستدعيه ملفات الصفحات مرة أخرى بعد رسم
   العناصر القادمة من الـAPI.
   ======================================== */

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let _revealObserver = null;

function observeReveals() {
    if (prefersReducedMotion) {
        document.querySelectorAll(".reveal, .stagger")
                .forEach(el => el.classList.add("in"));
        return;
    }

    if (!_revealObserver) {
        _revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in");
                _revealObserver.unobserve(entry.target);   // مرة واحدة تكفي
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    }

    document.querySelectorAll(".reveal:not(.in), .stagger:not(.in)")
            .forEach(el => _revealObserver.observe(el));
}

document.addEventListener("DOMContentLoaded", observeReveals);


/* ========================================
   🚩 نافذة الإبلاغ عن كتاب
   ----------------------------------------
   مكانها الفوتر لتكون في متناول الزائر من أي
   صفحة — بلاغ حقوق النشر لا يُنتظر أن يعود
   صاحبه إلى الرئيسية ليقدّمه.
   ======================================== */

const REPORT_HTML = `
<div class="report-overlay" id="reportOverlay" hidden>
    <div class="report-box" role="dialog" aria-modal="true" aria-labelledby="reportTitle">

        <button class="report-close" id="reportClose" aria-label="إغلاق">
            <i class='bx bx-x'></i>
        </button>

        <div class="report-head">
            <i class='bx bx-flag'></i>
            <h2 id="reportTitle">الإبلاغ عن كتاب</h2>
            <p>تصل بلاغات حقوق النشر إلى الإدارة مباشرة، وتُراجَع بأولوية.</p>
        </div>

        <form id="reportForm" novalidate>
            <div class="field">
                <label for="rp_name">اسمك <span>*</span></label>
                <input type="text" id="rp_name" required>
            </div>

            <div class="field">
                <label for="rp_email">بريدك الإلكتروني <span>*</span></label>
                <input type="email" id="rp_email" dir="ltr" required>
                <small>نراسلك عليه بنتيجة البلاغ</small>
            </div>

            <div class="field">
                <label for="rp_book">عنوان الكتاب أو رابطه <span>*</span></label>
                <input type="text" id="rp_book" required
                       placeholder="اكتب العنوان أو الصق رابط صفحة الكتاب">
            </div>

            <div class="field">
                <label for="rp_reason">سبب البلاغ <span>*</span></label>
                <select id="rp_reason" required>
                    <option value="">اختر السبب</option>
                    <option value="owner">أنا صاحب حقوق هذا العمل ولم آذن بنشره</option>
                    <option value="agent">أمثّل صاحب الحقوق أو دار النشر</option>
                    <option value="content">محتوى مخالف أو مسيء</option>
                    <option value="other">سبب آخر</option>
                </select>
            </div>

            <div class="field">
                <label for="rp_message">تفاصيل البلاغ <span>*</span></label>
                <textarea id="rp_message" rows="5" required
                          placeholder="اشرح المشكلة، وأرفق ما يثبت حقّك إن أمكن"></textarea>
            </div>

            <input type="text" id="rp_trap" tabindex="-1" autocomplete="off" aria-hidden="true">

            <div class="alert" id="reportAlert" hidden></div>

            <button type="submit" class="btn-send" id="reportSubmit">
                <i class='bx bx-send'></i> إرسال البلاغ
            </button>
        </form>

        <div class="report-done" id="reportDone" hidden>
            <i class='bx bx-check-circle'></i>
            <h3>وصلنا بلاغك</h3>
            <p>
                ستراجعه الإدارة بأولوية، ويصلك الردّ على بريدك.
                وإن ثبت الحقّ، يُوقَف عرض الكتاب فوراً.
            </p>
            <button class="btn-send" id="reportOk" type="button">حسناً</button>
        </div>

    </div>
</div>
`;


function initReport() {
    const overlay = document.getElementById("reportOverlay");
    const form    = document.getElementById("reportForm");
    const doneBox = document.getElementById("reportDone");
    const alertEl = document.getElementById("reportAlert");
    const submit  = document.getElementById("reportSubmit");

    if (!overlay) return;

    const open  = () => {
        overlay.hidden = false;
        document.body.style.overflow = "hidden";
        setTimeout(() => document.getElementById("rp_name")?.focus(), 200);
    };

    const close = () => {
        overlay.hidden = true;
        document.body.style.overflow = "";
    };

    document.getElementById("openReport")?.addEventListener("click", open);
    document.getElementById("reportClose")?.addEventListener("click", close);
    document.getElementById("reportOk")?.addEventListener("click", close);

    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !overlay.hidden) close();
    });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        // مصيدة السبام: البشر لا يرون هذا الحقل.
        // نتظاهر بالنجاح حتى لا يعرف الروبوت أنه كُشِف.
        if (document.getElementById("rp_trap")?.value) return showDone();

        const v = id => document.getElementById(id)?.value.trim() || "";

        const data = {
            name:    v("rp_name"),
            email:   v("rp_email"),
            subject: v("rp_book"),
            message: v("rp_message"),
            type:    "copyright",
        };
        const reason = v("rp_reason");

        if (!data.name)    return bad("rp_name", "الرجاء كتابة اسمك");
        if (!data.email)   return bad("rp_email", "الرجاء كتابة بريدك");
        if (!/^\S+@\S+\.\S+$/.test(data.email))
                            return bad("rp_email", "صيغة البريد غير صحيحة");
        if (!data.subject) return bad("rp_book", "الرجاء تحديد الكتاب");
        if (!reason)       return bad("rp_reason", "الرجاء اختيار سبب البلاغ");
        if (!data.message) return bad("rp_message", "الرجاء كتابة تفاصيل البلاغ");

        const labels = {
            owner: "صاحب الحقوق", agent: "ممثّل صاحب الحقوق",
            content: "محتوى مخالف", other: "سبب آخر",
        };
        data.message = `[${labels[reason] || "بلاغ"}]\n\n${data.message}`;

        const original = submit.innerHTML;
        submit.disabled  = true;
        submit.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جارٍ الإرسال...`;

        try {
            await apiPost("/contact", data);
            showDone();
        } catch (error) {
            console.error("Error sending report:", error);
            showAlert(error.message || "تعذّر إرسال البلاغ، حاول مرة أخرى");
            submit.disabled  = false;
            submit.innerHTML = original;
        }
    });

    form?.addEventListener("input", e => {
        e.target.classList.remove("invalid");
        if (alertEl) alertEl.hidden = true;
    });

    function showDone() {
        if (form)    form.hidden    = true;
        if (doneBox) doneBox.hidden = false;
    }

    function bad(id, msg) {
        showAlert(msg);
        const el = document.getElementById(id);
        el?.classList.add("invalid");
        el?.focus();
        return false;
    }

    function showAlert(text) {
        if (!alertEl) return;
        alertEl.hidden = false;
        alertEl.className = "alert err";
        alertEl.innerHTML = `<i class='bx bx-error-circle'></i><span>${escapeText(text)}</span>`;
    }
}

/* ========================================
   🚀 التشغيل — بعد تعريف كل القوالب
   ----------------------------------------
   ⚠️ لا تنقلي هذا السطر للأعلى: mountPartials
   تستعمل REPORT_HTML المعرّف أدناه، و const
   لا يُرفع فيتوقّف التنفيذ عند أوّل استعمال.
   ======================================== */

mountPartials();

/* ========================================
   👤 كشف رابط «حسابي»
   ----------------------------------------
   الهيدر مشترك، فحالة الجلسة تُفحص مرّة واحدة
   هنا لا في كل صفحة.
   ======================================== */

if (typeof Auth !== "undefined") {
    Auth.onReady(user => {
        if (!user) return;

        const desktop = document.getElementById("accLink");
        const mobile  = document.getElementById("accLinkMobile");

        if (desktop) {
            desktop.hidden = false;
            const first = String(user.name || "").trim().split(/\s+/)[0];
            if (first) desktop.querySelector("span").textContent = first;
            desktop.title = user.name || "حسابي";
        }

        if (mobile) mobile.hidden = false;

        if (document.body.dataset.page === "account") {
            desktop?.classList.add("active");
            mobile?.querySelector("a")?.classList.add("active");
        }
    });
}


/* ========================================
   🔗 حسابات التواصل
   ----------------------------------------
   ⚠️ ضعي الروابط الحقيقية هنا — مكان واحد
      يخدم الفوتر وصفحة «من نحن» معاً.

   والحساب الفارغ لا يُرسم أصلاً: زرٌّ يقفز
   بالزائر إلى أعلى الصفحة أسوأ من غيابه،
   ويوحي بأنّ الموقع مهجور.
   ======================================== */

const SOCIAL = [
    { key: "facebook",  icon: "bxl-facebook",  label: "فيسبوك",   url: "" },
    { key: "instagram", icon: "bxl-instagram", label: "إنستغرام", url: "" },
    { key: "twitter",   icon: "bxl-twitter",   label: "تويتر",    url: "" },
];

function mountSocial() {
    const live = SOCIAL.filter(s => s.url && s.url.trim());

    document.querySelectorAll(".contact-social, .social-media-buttons").forEach(box => {
        if (live.length === 0) { box.hidden = true; return; }

        box.hidden = false;
        box.innerHTML = live.map(s => `
            <a href="${escapeAttr(s.url)}" class="social-btn ${s.key}"
               title="${escapeAttr(s.label)}" target="_blank" rel="noopener">
                <i class='bx ${s.icon}'></i>
            </a>
        `).join("");
    });
}

mountSocial();
