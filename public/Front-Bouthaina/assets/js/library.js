/* ========================================
   🏠 مكتبة سامي الرقمية — الصفحة الرئيسية
   ----------------------------------------
   ⚠️ الهيدر · القائمة · المودال · الفوتر · الحالات ·
      كرت الكتاب  →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):
     GET /api/books?sort=&category=&q=&page=
     GET /api/categories
     GET /api/authors
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- الحاويات ---------- */

    const booksGrid    = document.getElementById("booksGrid");
    const categoryList = document.getElementById("categoriesList");
    const authorsList  = document.getElementById("authorsList");

    /* ---------- حالة الصفحة ----------
       تُقرأ من الرابط أولاً: ?category=novels&q=...
       هكذا يصبح الرابط قابلاً للمشاركة والحفظ. */

    const urlParams = new URLSearchParams(location.search);

    const state = {
        sort:     urlParams.get("sort") || "latest",
        category: urlParams.get("category"),
        sub:        null,                    // فرع داخل القسم
        parentSlug: null,                    // الأب — لتعليم العمود الجانبي
        q:        urlParams.get("q"),
    };

    /* عناصر ترويسة القسم */
    const ctx = {
        box:      document.getElementById("catContext"),
        hero:     document.getElementById("heroSection"),
        info:     document.querySelector(".info-section"),
        crumb:    document.getElementById("catCrumb"),
        title:    document.getElementById("catTitle"),
        count:    document.getElementById("catCount"),
        icon:     document.getElementById("catIcon"),
        subs:     document.getElementById("catSubs"),
        search:   document.getElementById("catSearchInput"),
        clearBtn: document.getElementById("catSearchClear"),
    };

    /* ---------- التشغيل ---------- */

    initFilters();
    initHeroSearch();
    initInfoButtons();
    initCatSearch();

    applyContext();      // يقرّر شكل الصفحة قبل جلب أي شيء
    loadBooks();
    loadCategories();
    loadAuthors();


    /* ========================================
       🏷️ سياق القسم
       ----------------------------------------
       الصفحة نفسها تخدم حالتين: تصفّح عام،
       وتصفّح قسم بعينه. الفرق في الترويسة فقط —
       أما الفلترة والترتيب والشبكة فمشتركة،
       فلا داعي لصفحة ثانية تكرّرها.
       ======================================== */

    async function applyContext() {
        if (!state.category) return;           // تصفّح عام — لا شيء يتغيّر

        // نُخفي الهيرو وقسم المعلومات — كلاهما ترويج عام
        // لا محلّ له داخل قسم بعينه، ويجعل الصفحة تبدو كالرئيسية.
        if (ctx.hero) ctx.hero.hidden = true;
        if (ctx.info) ctx.info.hidden = true;
        if (ctx.box)  ctx.box.hidden  = false;

        try {
            const res  = await apiGet("/categories");
            const cats = res.data || [];

            // القسم قد يكون رئيسياً أو فرعاً
            let cat    = cats.find(c => c.slug === state.category);
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
                if (ctx.info) ctx.info.hidden = false;
                state.category = null;
                return;
            }

            // نحفظ الأب لتعليم العمود الجانبي لاحقاً
            state.parentSlug = parent ? parent.slug : cat.slug;

            renderContext(cat, parent);
            highlightSidebar();

        } catch (error) {
            console.error("Error loading category context:", error);
            if (ctx.title) ctx.title.textContent = "تصفّح القسم";
        }
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

        renderSubs(cat.children || []);
    }

    /* الفروع أزرار فلترة لا روابط — التنقّل بينها
       يجب أن يكون فورياً لا إعادة تحميل. */
    function renderSubs(children) {
        if (!ctx.subs) return;

        if (children.length === 0) {
            ctx.subs.hidden = true;
            return;
        }

        ctx.subs.hidden = false;
        ctx.subs.innerHTML =
            `<button class="sub-chip active" data-sub="">الكل</button>` +
            children.map(sub => `
                <button class="sub-chip" data-sub="${escapeAttr(sub.slug)}">
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

    /* البحث داخل القسم — يبقى محصوراً فيه */
    function initCatSearch() {
        if (!ctx.search) return;

        let timer = null;

        ctx.search.addEventListener("input", () => {
            const q = ctx.search.value.trim();
            if (ctx.clearBtn) ctx.clearBtn.hidden = !q;

            // تأخير بسيط يمنع طلباً عند كل حرف
            clearTimeout(timer);
            timer = setTimeout(() => {
                state.q = q || null;
                loadBooks();
            }, 350);
        });

        ctx.clearBtn?.addEventListener("click", () => {
            ctx.search.value = "";
            ctx.clearBtn.hidden = true;
            state.q = null;
            loadBooks();
            ctx.search.focus();
        });
    }


    /* ========================================
       📚 الكتب
       ======================================== */

    async function loadBooks() {
        if (!booksGrid) return;

        showLoading(booksGrid, 6);

        try {
            const params = new URLSearchParams({ sort: state.sort });
            // الفرع أضيق من القسم — يُقدَّم عليه عند وجوده
            const cat = state.sub || state.category;
            if (cat)     params.set("category", cat);
            if (state.q) params.set("q", state.q);

            syncUrl();

            const res   = await apiGet(`/books?${params.toString()}`);
            const books = res.data || [];

            if (books.length === 0) {
                showEmpty(
                    booksGrid,
                    state.q
                        ? `لا نتائج عن «${escapeText(state.q)}»`
                        : "لا توجد كتب في هذا القسم بعد",
                    "bx-book-open"
                );
                return;
            }

            renderBookGrid(booksGrid, books);

        } catch (error) {
            console.error("Error loading books:", error);
            showError(booksGrid, loadBooks);
        }
    }


    /* يعلّم القسم الحالي في العمود الجانبي.
       إن كان المعروض فرعاً، نعلّم أباه — فالعمود
       لا يعرض إلا الأقسام الرئيسية. */
    function highlightSidebar() {
        if (!categoryList || !state.category) return;

        const slug = state.parentSlug || state.category;

        categoryList.querySelectorAll("li").forEach(li => {
            li.classList.toggle("active", li.dataset.category === slug);
        });
    }


    /* يُبقي الرابط مطابقاً لحالة الصفحة —
       حتى يعمل زر الرجوع وتكون المشاركة صحيحة */
    function syncUrl() {
        const p = new URLSearchParams();
        if (state.category)          p.set("category", state.category);
        if (state.q)                 p.set("q", state.q);
        if (state.sort !== "latest") p.set("sort", state.sort);

        const url = p.toString() ? `?${p}` : location.pathname;
        history.replaceState(null, "", url);
    }


    /* ========================================
       📂 التصنيفات (العمود الجانبي)
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

            categoryList.innerHTML = cats.map(c => `
                <li data-category="${escapeAttr(c.slug)}">
                    <i class='bx ${escapeAttr(c.icon || "bx-book")}'></i>
                    <span>${escapeText(c.name)}</span>
                    <span class="count">${c.books_count ?? 0}</span>
                </li>
            `).join("");

            highlightSidebar();

            categoryList.querySelectorAll("li").forEach(li => {
                li.addEventListener("click", () => {
                    const slug = li.dataset.category;

                    // النقر على القسم النشط يلغي الفلتر
                    const isActive = li.classList.contains("active");
                    categoryList.querySelectorAll("li").forEach(x => x.classList.remove("active"));

                    if (isActive) {
                        // إلغاء الفلتر — نعود للتصفّح العام
                        window.location.href = "/library.html";
                    } else {
                        // ننتقل إلى سياق القسم كاملاً (ترويسة وفروع وبحث)
                        window.location.href =
                            `/library.html?category=${encodeURIComponent(slug)}`;
                    }
                });
            });

        } catch (error) {
            console.error("Error loading categories:", error);
            showError(categoryList, loadCategories, "تعذّر تحميل الأقسام");
        }
    }


    /* ========================================
       ✍️ المؤلفون (العمود الجانبي)
       ======================================== */

    async function loadAuthors() {
        if (!authorsList) return;

        showLoading(authorsList, 6, "row");

        try {
            const res     = await apiGet("/authors");
            const authors = (res.data || []).slice(0, 6);

            if (authors.length === 0) {
                showEmpty(authorsList, "لا يوجد مؤلفون بعد", "bx-user");
                return;
            }

            authorsList.innerHTML = authors.map(a => `
                <li>
                    <a href="/author-profile.html?slug=${encodeURIComponent(a.slug || a.id)}">
                        ${escapeText(a.name)}
                        <span class="count">${a.books_count ?? 0}</span>
                    </a>
                </li>
            `).join("");

        } catch (error) {
            console.error("Error loading authors:", error);
            showError(authorsList, loadAuthors, "تعذّر تحميل المؤلفين");
        }
    }


    /* ========================================
       🎛️ الفلاتر
       ======================================== */

    function initFilters() {

        // أزرار الهيرو + الشريط المقسّم — كلاهما يغيّر sort
        const quickBtns = document.querySelectorAll(".filter-btn");
        const segments  = document.querySelectorAll(".segmented-option");
        const slider    = document.querySelector(".segmented-slider");

        function applySort(sort) {
            if (state.sort === sort) return;
            state.sort = sort;

            quickBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === sort));
            segments.forEach(s => s.classList.toggle("active", s.dataset.filter === sort));
            moveSlider();

            loadBooks();
        }

        quickBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                ripple(btn, e);
                applySort(btn.dataset.filter);
            });
        });

        segments.forEach(seg => {
            seg.addEventListener("click", () => applySort(seg.dataset.filter));
        });

        function moveSlider() {
            const active = document.querySelector(".segmented-option.active");
            if (!slider || !active) return;
            slider.style.width = active.offsetWidth + "px";
            slider.style.left  = active.offsetLeft  + "px";
        }

        window.addEventListener("load",   moveSlider);
        window.addEventListener("resize", moveSlider);
        moveSlider();
    }

    function ripple(btn, e) {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const span = document.createElement("span");

        span.style.cssText = `
            position:absolute; border-radius:50%;
            background:rgba(255,255,255,0.5);
            transform:scale(0); animation:ripple 0.6s linear;
            pointer-events:none;
            width:${size}px; height:${size}px;
            left:${e.clientX - rect.left - size / 2}px;
            top:${e.clientY - rect.top - size / 2}px;
        `;

        btn.style.position = "relative";
        btn.style.overflow = "hidden";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 600);
    }


    /* ========================================
       🔍 بحث الهيرو
       ======================================== */

    function initHeroSearch() {
        const input       = document.getElementById("searchInput");
        const suggestions = document.getElementById("suggestions");
        const searchBtn   = document.querySelector(".search-box .search-btn");

        if (!input) return;

        let allCategories = [];

        // نستعمل التصنيفات كاقتراحات — أدق من قائمة مكتوبة يدوياً
        apiGet("/categories")
            .then(res => {
                allCategories = (res.data || []).flatMap(c =>
                    [c, ...(c.children || [])]
                );
            })
            .catch(() => { /* الاقتراحات ميزة إضافية — تجاهل الخطأ */ });

        input.addEventListener("input", () => {
            const q = input.value.trim();

            if (!suggestions) return;
            suggestions.innerHTML = "";

            if (q === "") {
                suggestions.style.display = "none";
                return;
            }

            const matches = allCategories
                .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 6);

            if (matches.length === 0) {
                suggestions.style.display = "none";
                return;
            }

            suggestions.innerHTML = matches.map((c, i) => `
                <li data-slug="${escapeAttr(c.slug)}" style="animation-delay:${i * 0.05}s">
                    <i class='bx bx-search-alt'></i> ${escapeText(c.name)}
                </li>
            `).join("");

            suggestions.style.display = "block";

            suggestions.querySelectorAll("li").forEach(li => {
                li.addEventListener("click", () => {
                    input.value = li.textContent.trim();
                    suggestions.style.display = "none";
                    state.category = li.dataset.slug;
                    state.q = null;
                    loadBooks();
                    booksGrid?.scrollIntoView({ behavior: "smooth" });
                });
            });
        });

        function runSearch() {
            const q = input.value.trim();
            if (!q) return;
            state.q = q;
            state.category = null;
            if (suggestions) suggestions.style.display = "none";
            loadBooks();
            booksGrid?.scrollIntoView({ behavior: "smooth" });
        }

        searchBtn?.addEventListener("click", (e) => {
            if (input.value.trim()) {
                e.stopPropagation();   // لا نفتح المودال إذا كان هناك نص
                runSearch();
            }
        });

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") runSearch();
        });

        // إغلاق الاقتراحات عند النقر خارجها
        document.addEventListener("click", (e) => {
            if (suggestions && !input.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = "none";
            }
        });
    }


    /* ========================================
       📢 أزرار قسم المعلومات
       ======================================== */

    function initInfoButtons() {
        document.querySelector(".info-btn.primary")?.addEventListener("click", () => {
            window.location.href = "/upload-book.html";
        });

    }
});