/* ========================================
   🏠 دار سامي — الصفحة الرئيسية
   ----------------------------------------
   ⚠️ الهيدر · القائمة · المودال · الفوتر · الحالات ·
      كرت الكتاب  →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):  GET /api/home
     { latest, featured, house_editions, categories, authors, stats }
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const latestBooks = document.getElementById("latestBooks");
    const catsGrid    = document.getElementById("homeCategories");
    const authorsWrap = document.getElementById("homeAuthors");

    // prefersReducedMotion و observeReveals معرّفان في partials.js
    const reduceMotion = prefersReducedMotion;


    /* ========================================
       📥 تحميل الصفحة
       ======================================== */

    async function loadHome() {
        showLoading(latestBooks, 6);
        showLoading(catsGrid, 5);
        showLoading(authorsWrap, 6);

        try {
            const res  = await apiGet("/home");
            const data = res.data || {};

            renderLatest(data.latest || []);
            renderCategories(data.categories || []);
            renderAuthors(data.authors || []);
            animateStats(data.stats || {});

            // العناصر رُسمت الآن — نفعّل الظهور عليها
            observeReveals();

        } catch (error) {
            console.error("Error loading home:", error);
            showError(latestBooks, loadHome);
            showError(catsGrid,    loadHome, "تعذّر تحميل الأقسام");
            showError(authorsWrap, loadHome, "تعذّر تحميل المؤلفين");
        }
    }


    /* ========================================
       📚 أحدث الإصدارات
       ======================================== */

    function renderLatest(books) {
        if (!latestBooks) return;

        if (books.length === 0) {
            showEmpty(latestBooks, "لا توجد إصدارات بعد", "bx-book-open");
            return;
        }

        renderBookGrid(latestBooks, books.slice(0, 6));
    }


    /* ========================================
       📂 الأقسام
       ======================================== */

    function renderCategories(cats) {
        if (!catsGrid) return;

        if (cats.length === 0) {
            showEmpty(catsGrid, "لا توجد أقسام بعد", "bx-category");
            return;
        }

        catsGrid.innerHTML = cats.map(c => `
            <a class="cat-card" href="/library.html?category=${encodeURIComponent(c.slug)}">
                <i class='bx ${escapeAttr(c.icon || "bx-book")}'></i>
                <b>${escapeText(c.name)}</b>
                <span>${c.books_count ?? 0} كتاب</span>
            </a>
        `).join("");
    }


    /* ========================================
       ✍️ المؤلفون
       ======================================== */

    function renderAuthors(authors) {
        if (!authorsWrap) return;

        if (authors.length === 0) {
            showEmpty(authorsWrap, "لا يوجد مؤلفون بعد", "bx-user");
            return;
        }

        authorsWrap.innerHTML = authors.slice(0, 6).map(a => {
            const avatar = a.photo
                ? `<img src="${escapeAttr(a.photo)}" alt="${escapeAttr(a.name)}">`
                : escapeText((a.name || "؟").charAt(0));

            const tag = a.is_house_author
                ? `<span class="house-tag">مؤلف الدار</span>`
                : "";

            return `
                <a class="author-chip" href="/author-profile.html?slug=${encodeURIComponent(a.slug || a.id)}">
                    <div class="avatar">${avatar}</div>
                    <b>${escapeText(a.name)}</b>
                    <span>${a.books_count ?? 0} كتاب</span>
                    ${tag}
                </a>
            `;
        }).join("");
    }


    /* ========================================
       🔢 عدّادات الإحصائيات
       ----------------------------------------
       ترتفع من الصفر عند أول ظهور — مرة واحدة فقط.
       ======================================== */

    function animateStats(stats) {
        setCounter("statBooks",     stats.books     ?? 0);
        setCounter("statAuthors",   stats.authors   ?? 0);
        setCounter("statDownloads", stats.downloads ?? 0);
    }

    function setCounter(id, value) {
        const el = document.getElementById(id);
        if (!el) return;

        el.dataset.to = value;

        if (reduceMotion) {
            el.textContent = format(value);
            return;
        }

        runCounter(el, value);
    }

    function runCounter(el, target) {
        const duration = 1400;
        const start    = performance.now();

        function tick(now) {
            const p    = Math.min((now - start) / duration, 1);
            // easeOutExpo — سريع في البداية ثم يستقر
            const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            el.textContent = format(Math.round(target * ease));
            if (p < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    function format(n) {
        return Number(n).toLocaleString("ar-DZ");
    }


    /* ========================================
       ⬇️ سهم النزول
       ======================================== */

    document.querySelector(".hero-scroll")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("latest")?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });
    });


    /* ---------- التشغيل ---------- */

    loadHome();
});