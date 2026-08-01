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
                <li><a href="/library.html" class="nav-link" data-nav="library"><i class='bx bx-book-alt'></i> المكتبة</a></li>
                <li><a href="/class.html" class="nav-link" data-nav="class"><i class='bx bx-category'></i> أقسام الكتب</a></li>
                <li><a href="/author.html" class="nav-link" data-nav="author"><i class='bx bx-user-pin'></i> مؤلفو الكتب</a></li>

                <li class="dropdown">
                    <button class="dropbtn nav-link" id="menuBtn">
                        القائمة <i class='bx bx-chevron-down icon'></i>
                    </button>
                    <div class="dropdown-content" id="dropdownMenu">
                        <a href="/class.html"><i class='bx bx-book-open'></i> أقسام الكتب</a>
                        <a href="/author.html"><i class='bx bx-user'></i> مؤلفو الكتب</a>
                        <!-- TODO: صفحات الاقتباسات والمراجعات والمجتمع — لاحقاً -->
                        <a href="/login.html"><i class='bx bx-quote-right'></i> اقتباسات الكتب</a>
                        <a href="/login.html"><i class='bx bx-star'></i> مراجعات الكتب</a>
                        <a href="/login.html"><i class='bx bx-group'></i> مجتمع المثقفين</a>
                        <a href="/upload-book.html"><i class='bx bx-upload'></i> نشر كتاب</a>
                        <a href="#" id="closeMenu" class="close-link"><i class='bx bx-x'></i> إغلاق</a>
                    </div>
                </li>

                <li><a href="#" class="nav-link search-trigger"><i class='bx bx-search-alt-2'></i> بــحـــث</a></li>
            </ul>
        </div>

        <div class="nav-left desktop-nav">
            <div class="link auth-links" id="authArea"></div>
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
            <li><a href="/library.html" class="mobile-link" data-nav="library"><i class='bx bx-book-alt'></i> المكتبة</a></li>
            <li><a href="/class.html" class="mobile-link" data-nav="class"><i class='bx bx-category'></i> أقسام الكتب</a></li>
            <li><a href="/author.html" class="mobile-link" data-nav="author"><i class='bx bx-user-pin'></i> مؤلفو الكتب</a></li>
            <li class="mobile-dropdown">
                <button class="mobile-dropbtn" id="mobileMenuBtn">
                    <i class='bx bx-menu'></i> القائمة <i class='bx bx-chevron-down icon'></i>
                </button>
                <div class="mobile-dropdown-content" id="mobileDropdownMenu">
                    <a href="/class.html"><i class='bx bx-book-open'></i> أقسام الكتب</a>
                    <a href="/author.html"><i class='bx bx-user'></i> مؤلفو الكتب</a>
                    <a href="/login.html"><i class='bx bx-quote-right'></i> اقتباسات الكتب</a>
                    <a href="/login.html"><i class='bx bx-star'></i> مراجعات الكتب</a>
                    <a href="/upload-book.html"><i class='bx bx-upload'></i> نشر كتاب</a>
                </div>
            </li>
            <li><a href="#" class="mobile-link search-trigger"><i class='bx bx-search-alt-2'></i> بــحـــث</a></li>
            <li class="mobile-auth" id="mobileAuthArea"></li>
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
        <div class="footer-brand">
            <p class="brand-desc">
                الملكية الفكرية محفوظة للمؤلفين المذكورين على الكتب والمكتبة غير مسؤولة عن أفكار المؤلفين.
                يتم نشر الكتب القديمة والمنسية التي أصبحت في الماضي للحفاظ على التراث العربي والإسلامي،
                والكتب التي يتم قبول نشرها من قبل مؤلفيها.
            </p>
            <div class="social-media-buttons">
                <a href="#" class="social-btn facebook" title="فيسبوك"><i class='bx bxl-facebook'></i></a>
                <a href="#" class="social-btn instagram" title="إنستغرام"><i class='bx bxl-instagram'></i></a>
                <a href="#" class="social-btn twitter" title="تويتر"><i class='bx bxl-twitter'></i></a>
            </div>
        </div>

        <div class="footer-grid">
            <div class="footer-column">
                <h3><i class='bx bx-message-square-detail'></i> تواصل معنا</h3>
                <ul class="contact-info">
                    <li><i class='bx bx-map'></i><span>🇩🇿 الجزائر</span></li>
                    <li><i class='bx bx-envelope'></i><span>contact@sami-library.com</span></li>
                    <li><i class='bx bx-phone'></i><span>+213 555 123 456</span></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3><i class='bx bx-link-alt'></i> روابط سريعة</h3>
                <ul class="footer-links">
                    <li><a href="/index.html"><i class='bx bx-chevron-left'></i> الرئيسية</a></li>
                    <li><a href="/library.html"><i class='bx bx-chevron-left'></i> المكتبة</a></li>
                    <li><a href="/class.html"><i class='bx bx-chevron-left'></i> أقسام الكتب</a></li>
                    <li><a href="/author.html"><i class='bx bx-chevron-left'></i> المؤلفون</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3><i class='bx bx-cog'></i> خدماتنا</h3>
                <ul class="footer-links">
                    <li><a href="/upload-book.html"><i class='bx bx-chevron-left'></i> نشر كتاب</a></li>
                    <!-- TODO: صفحات الاقتباسات والمراجعات — لاحقاً -->
                    <li><a href="#"><i class='bx bx-chevron-left'></i> اقتباسات</a></li>
                    <li><a href="#"><i class='bx bx-chevron-left'></i> مراجعات</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>
                حقوق الملكية © <span id="currentYear">2026</span>
                <span class="gradient-text">مكتبة سامي الرقمية</span>
                - جميع الحقوق محفوظة
            </p>
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
        footerSlot.innerHTML = FOOTER_HTML;
    }

    markActiveLink();
    renderAuthArea();
    initDropdown();
    initMobileNav();
    initSearchModal();
    initScrollToTop();
    initCurrentYear();
}


/* ---------- تعليم الصفحة الحالية ---------- */

function markActiveLink() {
    const page = document.body.dataset.page;
    if (!page) return;

    document.querySelectorAll(`[data-nav="${page}"]`).forEach(el => {
        el.classList.add("active");
    });
}


/* ---------- منطقة الحساب ---------- */

function renderAuthArea() {
    const loggedIn = (typeof isLoggedIn === "function") ? isLoggedIn() : false;

    const desktop = document.getElementById("authArea");
    const mobile  = document.getElementById("mobileAuthArea");

    const guestHTML = `
        <a href="/login.html" class="btn btn-login"><i class='bx bx-log-in'></i> دخول</a>
        <a href="/register.html" class="btn btn-register"><i class='bx bx-user-plus'></i> إنشاء حساب</a>
    `;

    const userHTML = `
        <a href="/profile.html" class="btn btn-login"><i class='bx bx-user'></i> حسابي</a>
        <a href="#" class="btn btn-register" id="logoutBtn"><i class='bx bx-log-out'></i> خروج</a>
    `;

    const html = loggedIn ? userHTML : guestHTML;

    if (desktop) desktop.innerHTML = html;
    if (mobile)  mobile.innerHTML  = html;

    document.querySelectorAll("#logoutBtn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("auth_token");
            window.location.href = "/index.html";
        });
    });
}


/* ---------- القائمة المنسدلة ---------- */

function initDropdown() {
    const menuBtn         = document.getElementById("menuBtn");
    const dropdownContent = document.getElementById("dropdownMenu");
    const closeMenu       = document.getElementById("closeMenu");

    if (menuBtn && dropdownContent) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle("show");
            menuBtn.classList.toggle("active");
        });
    }

    if (closeMenu && dropdownContent) {
        closeMenu.addEventListener("click", (e) => {
            e.preventDefault();
            dropdownContent.classList.remove("show");
            menuBtn?.classList.remove("active");
        });
    }

    document.addEventListener("click", (e) => {
        if (menuBtn && dropdownContent &&
            !menuBtn.contains(e.target) &&
            !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove("show");
            menuBtn.classList.remove("active");
        }
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

    const mobileMenuBtn      = document.getElementById("mobileMenuBtn");
    const mobileDropdownMenu = document.getElementById("mobileDropdownMenu");

    if (mobileMenuBtn && mobileDropdownMenu) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileDropdownMenu.classList.toggle("show");
            mobileMenuBtn.classList.toggle("active");
        });
    }
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
        window.location.href = "/library.html?q=" + encodeURIComponent(q);
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
   🚀 التشغيل الفوري
   ======================================== */

mountPartials();


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

/** يتطلّب تسجيل الدخول */
function showLoginRequired(el, message = "سجّلي الدخول لعرض هذا المحتوى") {
    if (!el) return;
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    el.innerHTML = `
        <div class="state-box">
            <i class='bx bx-lock-alt'></i>
            <p>${message}</p>
            <a href="/login.html?redirect=${next}" class="btn-retry">
                <i class='bx bx-log-in'></i> تسجيل الدخول
            </a>
        </div>
    `;
}

/**
 * يتحقّق من الدخول قبل أي إجراء يحتاجه.
 * يرجّع true إذا كان المستخدم مسجّلاً، وإلا يوجّهه ويرجّع false.
 */
function requireAuth(actionLabel = "") {
    if (isLoggedIn()) return true;
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    alert(`يجب تسجيل الدخول ${actionLabel}`);
    window.location.href = `/login.html?redirect=${next}`;
    return false;
}


/* ========================================
   🧱 مكوّنات مشتركة
   ----------------------------------------
   تُستعمل في الرئيسية والمكتبة والكتب المشابهة —
   تعريف واحد يضمن أن الكرت متطابق في كل مكان.
   ======================================== */

/** نجوم التقييم كنص HTML */
function renderStars(average) {
    const avg  = Number(average) || 0;
    const full = Math.floor(avg);
    const half = avg % 1 >= 0.5;
    let html = "";

    for (let i = 1; i <= 5; i++) {
        if (i <= full)                   html += `<i class='bx bxs-star'></i>`;
        else if (i === full + 1 && half) html += `<i class='bx bxs-star-half'></i>`;
        else                             html += `<i class='bx bx-star'></i>`;
    }
    return html;
}

/** كرت كتاب — يقبل شكل BookCard من API.md */
function renderBookCard(book) {
    const author = book.author || {};
    const slug   = book.slug || book.id;

    const cover = book.cover
        ? `<img src="${escapeAttr(book.cover)}" alt="${escapeAttr(book.title)}" loading="lazy">`
        : `<div class="cover-fallback"><span>${escapeText(book.title)}</span></div>`;

    const badge = book.publication_type === "house_edition"
        ? `<span class="badge-house">من إصداراتنا</span>`
        : "";

    const rating = Number(book.ratings_avg) || 0;
    const ratingHTML = book.ratings_count
        ? `<div class="book-rating">${renderStars(rating)}
               <span>${rating.toFixed(1)}</span></div>`
        : `<div class="book-rating muted">
               <i class='bx bx-star'></i><span>بلا تقييم</span></div>`;

    return `
        <article class="book-card">
            <a href="/book.html?slug=${encodeURIComponent(slug)}" class="book-image">
                ${cover}${badge}
            </a>
            <h3><a href="/book.html?slug=${encodeURIComponent(slug)}">${escapeText(book.title)}</a></h3>
            <p>${escapeText(author.name || "")}</p>
            ${ratingHTML}
        </article>
    `;
}

/** يرسم مجموعة كروت في حاوية */
function renderBookGrid(el, books) {
    if (!el) return;
    el.innerHTML = books.map(renderBookCard).join("");
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