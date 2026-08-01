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

    /* ---------- حالة الصفحة ---------- */

    const state = {
        sort: "latest",     // latest | popular | trending
        category: null,
        q: null,
    };

    /* ---------- التشغيل ---------- */

    initFilters();
    initHeroSearch();
    initInfoButtons();

    loadBooks();
    loadCategories();
    loadAuthors();


    /* ========================================
       📚 الكتب
       ======================================== */

    async function loadBooks() {
        if (!booksGrid) return;

        showLoading(booksGrid, 6);

        try {
            const params = new URLSearchParams({ sort: state.sort });
            if (state.category) params.set("category", state.category);
            if (state.q)        params.set("q", state.q);

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

            categoryList.querySelectorAll("li").forEach(li => {
                li.addEventListener("click", () => {
                    const slug = li.dataset.category;

                    // النقر على القسم النشط يلغي الفلتر
                    const isActive = li.classList.contains("active");
                    categoryList.querySelectorAll("li").forEach(x => x.classList.remove("active"));

                    if (isActive) {
                        state.category = null;
                    } else {
                        li.classList.add("active");
                        state.category = slug;
                    }

                    loadBooks();
                    booksGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
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