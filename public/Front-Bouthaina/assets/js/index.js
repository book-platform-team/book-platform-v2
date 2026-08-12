/* ========================================
   🏠 دار سامي — الصفحة الرئيسية
   ----------------------------------------
   ⚠️ الهيدر · الفوتر · الحالات · كرت الكتاب ·
      المفضّلة  →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):
     GET  /api/books?q=&category=&page=
     GET  /api/categories
     GET  /api/authors
     POST /api/contact          (بلاغ حقوق النشر)
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- الحاويات ---------- */

    const booksGrid    = document.getElementById("booksGrid");
    const categoryList = document.getElementById("categoriesList");
    const authorsList  = document.getElementById("authorsList");
    const booksTitle   = document.getElementById("booksTitle");

    /* ---------- الحالة تُقرأ من الرابط ----------
       ?category=novels&q=الصلاة
       هكذا يصير الرابط قابلاً للمشاركة والحفظ. */

    const urlParams = new URLSearchParams(location.search);

    const state = {
        category:   urlParams.get("category"),
        sub:        null,
        parentSlug: null,
        q:          urlParams.get("q"),
    };

    /* ---------- ترويسة القسم ---------- */

    const ctx = {
        box:   document.getElementById("catContext"),
        hero:  document.getElementById("heroSection"),
        crumb: document.getElementById("catCrumb"),
        title: document.getElementById("catTitle"),
        count: document.getElementById("catCount"),
        icon:  document.getElementById("catIcon"),
        subs:  document.getElementById("catSubs"),
    };


    /* ---------- التشغيل ---------- */

    initSearch();

    applyContext();
    loadBooks();
    loadCategories();
    loadAuthors();


    /* ========================================
       🏷️ سياق القسم
       ----------------------------------------
       الصفحة نفسها تخدم حالتين: تصفّح عام،
       وتصفّح قسم بعينه. الفرق في الترويسة فقط،
       أما الشبكة والعمود الجانبي فمشتركان —
       فلا داعي لصفحة ثانية تكرّرهما.
       ======================================== */

    async function applyContext() {
        if (!state.category) return;

        if (ctx.hero) ctx.hero.hidden = true;
        if (ctx.box)  ctx.box.hidden  = false;

        // الترويج لا محلّ له داخل قسم بعينه
        toggleSection("publishSection", false);

        try {
            const res  = await apiGet("/categories");
            const cats = res.data || [];

            let cat = cats.find(c => c.slug === state.category);
            let parent = null;

            if (!cat) {
                for (const c of cats) {
                    const sub = (c.children || []).find(x => x.slug === state.category);
                    if (sub) { cat = sub; parent = c; break; }
                }
            }

            if (!cat) {
                // قسم غير موجود — نعود للتصفّح العام بدل ترويسة فارغة
                if (ctx.box)  ctx.box.hidden  = true;
                if (ctx.hero) ctx.hero.hidden = false;
                toggleSection("publishSection", true);
                state.category = null;
                return;
            }

            state.parentSlug = parent ? parent.slug : cat.slug;
            renderContext(cat, parent);
            highlightSidebar();

        } catch (error) {
            console.error("Error loading category context:", error);
            if (ctx.title) ctx.title.textContent = "تصفّح القسم";
        }
    }

    function toggleSection(id, show) {
        const el = document.getElementById(id);
        if (el) el.hidden = !show;
    }

    function renderContext(cat, parent) {
        document.title = `${cat.name} - مكتبة سامي الرقمية`;

        if (ctx.crumb) ctx.crumb.textContent = cat.name;
        if (ctx.title) ctx.title.textContent = cat.name;
        if (ctx.icon)  ctx.icon.className = `bx ${cat.icon || "bx-book"}`;

        if (ctx.count) {
            const n = cat.books_count ?? 0;
            ctx.count.textContent = parent
                ? `${n} كتاباً · ضمن ${parent.name}`
                : `${n} كتاباً`;
        }

        if (booksTitle) {
            booksTitle.innerHTML = `<i class='bx bx-book-bookmark'></i> كتب ${escapeText(cat.name)}`;
        }

        renderSubs(cat.children || []);
    }

    /* الفروع أزرار فلترة لا روابط — التنقّل بينها فوري */
    function renderSubs(children) {
        if (!ctx.subs) return;

        if (children.length === 0) {
            ctx.subs.hidden = true;
            return;
        }

        // «أخرى» تبقى أخيراً دائماً
        const subs = [...children].sort(
            (a, b) => (a.is_fallback ? 1 : 0) - (b.is_fallback ? 1 : 0)
        );

        ctx.subs.hidden = false;
        ctx.subs.innerHTML =
            `<button class="sub-chip active" data-sub="">الكل</button>` +
            subs.map(sub => `
                <button class="sub-chip${sub.is_fallback ? " fallback" : ""}" data-sub="${escapeAttr(sub.slug)}">
                    ${escapeText(sub.name)}
                    <span>${sub.books_count ?? 0}</span>
                </button>
            `).join("");

        ctx.subs.querySelectorAll(".sub-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                ctx.subs.querySelectorAll(".sub-chip")
                        .forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                state.sub = chip.dataset.sub || null;
                loadBooks();
            });
        });
    }


    /* ========================================
       📚 الكتب
       ======================================== */

    async function loadBooks() {
        if (!booksGrid) return;

        showLoading(booksGrid, 6);

        try {
            const params = new URLSearchParams({ sort: "latest" });

            // الفرع أضيق من القسم — يُقدَّم عليه عند وجوده
            const cat = state.sub || state.category;
            if (cat)     params.set("category", cat);
            if (state.q) params.set("q", state.q);

            syncUrl();

            const res   = await apiGet(`/books?${params.toString()}`);
            const books = res.data || [];

            // عنوان الشبكة يتبع الحالة
            if (booksTitle && state.q) {
                booksTitle.innerHTML =
                    `<i class='bx bx-search'></i> نتائج «${escapeText(state.q)}»`;
            }

            if (books.length === 0) {
                showEmpty(
                    booksGrid,
                    state.q
                        ? `لا نتائج عن «${escapeText(state.q)}»`
                        : "لا توجد كتب في هذا القسم بعد",
                    "bx-book-open",
                    state.q
                        ? `<button class="btn-retry" id="clearSearch" type="button">
                               <i class='bx bx-x'></i> مسح البحث
                           </button>`
                        : ""
                );

                document.getElementById("clearSearch")?.addEventListener("click", () => {
                    state.q = null;
                    const input = document.getElementById("searchInput");
                    if (input) input.value = "";
                    resetTitle();
                    loadBooks();
                });
                return;
            }

            renderBookGrid(booksGrid, books);

        } catch (error) {
            console.error("Error loading books:", error);
            showError(booksGrid, loadBooks);
        }
    }

    function resetTitle() {
        if (booksTitle) {
            booksTitle.innerHTML = `<i class='bx bx-book-bookmark'></i> إصداراتنا`;
        }
    }

    /* يُبقي الرابط مطابقاً لحالة الصفحة —
       ليعمل زرّ الرجوع وتصحّ المشاركة */
    function syncUrl() {
        const p = new URLSearchParams();
        if (state.category) p.set("category", state.category);
        if (state.q)        p.set("q", state.q);

        history.replaceState(null, "", p.toString() ? `?${p}` : location.pathname);
    }





    /* ========================================
       📂 الأقسام — العمود الجانبي
       ======================================== */

    async function loadCategories() {
        if (!categoryList) return;

        showLoading(categoryList, 5, "row");

        try {
            const res  = await apiGet("/categories");
            const cats = res.data || [];

            if (cats.length === 0) {
                showEmpty(categoryList, "لا توجد أقسام بعد", "bx-category");
                return;
            }

            // «أخرى» أخيراً — هي مآل ما لا يُصنَّف لا صدر القائمة
            const sorted = [...cats].sort(
                (a, b) => (a.is_fallback ? 1 : 0) - (b.is_fallback ? 1 : 0)
            );

            categoryList.innerHTML = sorted.map(c => `
                <li data-category="${escapeAttr(c.slug)}"${c.is_fallback ? ' class="fallback"' : ""}>
                    <i class='bx ${escapeAttr(c.icon || "bx-book")}'></i>
                    <span>${escapeText(c.name)}</span>
                    <b class="count">${c.books_count ?? 0}</b>
                </li>
            `).join("");

            highlightSidebar();

            categoryList.querySelectorAll("li").forEach(li => {
                li.addEventListener("click", () => {
                    const slug = li.dataset.category;
                    window.location.href = li.classList.contains("active")
                        ? "/index.html"
                        : `/index.html?category=${encodeURIComponent(slug)}`;
                });
            });

        } catch (error) {
            console.error("Error loading categories:", error);
            showError(categoryList, loadCategories, "تعذّر تحميل الأقسام");
        }
    }

    /* إن كان المعروض فرعاً، نعلّم أباه —
       العمود لا يعرض إلا الأقسام الرئيسية */
    function highlightSidebar() {
        if (!categoryList || !state.category) return;

        const slug = state.parentSlug || state.category;
        categoryList.querySelectorAll("li").forEach(li => {
            li.classList.toggle("active", li.dataset.category === slug);
        });
    }


    /* ========================================
       ✍️ المؤلفون — العمود الجانبي
       ======================================== */

    async function loadAuthors() {
        if (!authorsList) return;

        showLoading(authorsList, 6, "row");

        try {
            const res     = await apiGet("/authors");
            const authors = (res.data || []).slice(0, 8);

            if (authors.length === 0) {
                showEmpty(authorsList, "لا يوجد مؤلفون بعد", "bx-user");
                return;
            }

            authorsList.innerHTML = authors.map(a => `
                <li>
                    <a href="/author-profile.html?slug=${encodeURIComponent(a.slug || a.id)}">
                        <span>${titleLabel(a.title)}${escapeText(a.name)}</span>
                        <b class="count">${a.books_count ?? 0}</b>
                    </a>
                </li>
            `).join("");

        } catch (error) {
            console.error("Error loading authors:", error);
            showError(authorsList, loadAuthors, "تعذّر تحميل المؤلفين");
        }
    }

    /* الرتبة تسبق الاسم كما تُكتب في المطبوعات */
    function titleLabel(t) {
        return { professor: "أ. ", doctor: "د. ", researcher: "" }[t] || "";
    }


    /* ========================================
       🔍 البحث
       ----------------------------------------
       يبحث في الكتب والمؤلفين معاً — كما يعد
       النصّ في الحقل. والمطابقة جزئية: «الصلاة»
       تُرجع كل ما يحتوي الكلمة في أي موضع.
       ======================================== */

    function initSearch() {
        const input       = document.getElementById("searchInput");
        const suggestions = document.getElementById("suggestions");
        const goBtn       = document.getElementById("searchGo");

        if (!input) return;

        if (state.q) input.value = state.q;

        let timer = null;

        input.addEventListener("input", () => {
            const q = input.value.trim();
            clearTimeout(timer);

            if (!suggestions) return;

            if (q.length < 2) {
                suggestions.style.display = "none";
                return;
            }

            // تأخير يمنع طلباً عند كل حرف
            timer = setTimeout(() => suggest(q), 320);
        });

        async function suggest(q) {
            try {
                const [books, authors] = await Promise.all([
                    apiGet(`/books?q=${encodeURIComponent(q)}&per_page=5`),
                    apiGet(`/authors?q=${encodeURIComponent(q)}`),
                ]);

                const b = (books.data   || []).slice(0, 5);
                const a = (authors.data || []).slice(0, 3);

                if (b.length + a.length === 0) {
                    suggestions.innerHTML =
                        `<li class="no-hit"><i class='bx bx-search-alt'></i> لا نتائج</li>`;
                    suggestions.style.display = "block";
                    return;
                }

                suggestions.innerHTML =
                    b.map(x => `
                        <li><a href="/book.html?slug=${encodeURIComponent(x.slug || x.id)}">
                            <i class='bx bx-book'></i>
                            <span>${escapeText(x.title)}</span>
                            <em>كتاب</em>
                        </a></li>`).join("") +
                    a.map(x => `
                        <li><a href="/author-profile.html?slug=${encodeURIComponent(x.slug || x.id)}">
                            <i class='bx bx-user'></i>
                            <span>${titleLabel(x.title)}${escapeText(x.name)}</span>
                            <em>مؤلف</em>
                        </a></li>`).join("");

                suggestions.style.display = "block";

            } catch {
                suggestions.style.display = "none";
            }
        }

        function run() {
            const q = input.value.trim();
            if (!q) return;

            state.q = q;
            state.category = null;
            state.sub = null;

            if (suggestions) suggestions.style.display = "none";

            loadBooks();
            document.querySelector(".container")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        goBtn?.addEventListener("click", run);
        input.addEventListener("keypress", e => { if (e.key === "Enter") run(); });

        document.addEventListener("click", e => {
            if (suggestions && !input.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = "none";
            }
        });
    }


});
