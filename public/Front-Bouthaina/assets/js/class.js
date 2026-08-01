/* ========================================
   📂 مكتبة سامي الرقمية — صفحة أقسام الكتب
   ----------------------------------------
   ⚠️ الهيدر · القائمة · المودال · الفوتر · الحالات
      →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):  GET /api/categories
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const container  = document.getElementById("categoriesContainer");
    const searchInput = document.getElementById("categorySearchInput");
    const clearBtn    = document.getElementById("clearSearch");

    let allCategories = [];


    /* ========================================
       📥 جلب الأقسام
       ======================================== */

    async function loadCategories() {
        if (!container) return;

        showLoading(container, 5, "row");

        try {
            const res = await apiGet("/categories");
            allCategories = res.data || [];

            if (allCategories.length === 0) {
                showEmpty(container, "لا توجد أقسام بعد", "bx-category");
                return;
            }

            render(allCategories);

        } catch (error) {
            console.error("Error loading categories:", error);
            showError(container, loadCategories, "تعذّر تحميل الأقسام");
        }
    }


    /* ========================================
       🎨 الرسم
       ======================================== */

    function render(categories) {
        if (!container) return;

        if (categories.length === 0) {
            showEmpty(container, "لم يتم العثور على نتائج", "bx-search-alt");
            return;
        }

        container.innerHTML = categories.map(cat => {
            const children = cat.children || [];

            // شبكة ثلاثية عندما تكون الفروع كثيرة
            const gridClass = children.length >= 6 ? " grid" : "";

            const links = children.length
                ? children.map(sub => `
                    <a href="/library.html?category=${encodeURIComponent(sub.slug)}">
                        ${escapeText(sub.name)}
                        <span class="sub-count">${sub.books_count ?? 0}</span>
                    </a>
                  `).join("")
                : `<a href="/library.html?category=${encodeURIComponent(cat.slug)}">
                        تصفّح كل كتب القسم
                   </a>`;

            return `
                <div class="category" data-category="${escapeAttr(cat.name)}">
                    <div class="category-header">
                        <span class="cat-name">
                            <i class='bx ${escapeAttr(cat.icon || "bx-book")}'></i>
                            ${escapeText(cat.name)}
                        </span>
                        <span class="cat-meta">
                            <span class="cat-count">${cat.books_count ?? 0} كتاب</span>
                            <i class="bx bx-chevron-down arrow"></i>
                        </span>
                    </div>
                    <div class="subcategories${gridClass}">
                        ${links}
                    </div>
                </div>
            `;
        }).join("");

        bindAccordion();
    }


    /* ========================================
       🔽 فتح وإغلاق الأقسام
       ======================================== */

    function bindAccordion() {
        container.querySelectorAll(".category-header").forEach(header => {
            header.addEventListener("click", () => {
                const sub   = header.nextElementSibling;
                const arrow = header.querySelector(".arrow");
                if (!sub) return;

                if (sub.style.maxHeight) {
                    sub.style.maxHeight = null;
                    arrow?.classList.remove("rotate");
                } else {
                    sub.style.maxHeight = sub.scrollHeight + "px";
                    arrow?.classList.add("rotate");
                }
            });
        });
    }


    /* ========================================
       🔍 البحث في الأقسام والفروع
       ======================================== */

    if (searchInput) {

        searchInput.addEventListener("input", () => {
            const q = searchInput.value.trim().toLowerCase();

            if (clearBtn) clearBtn.style.display = q ? "flex" : "none";

            if (q === "") {
                render(allCategories);
                return;
            }

            // نُبقي القسم إذا طابق اسمه أو اسم أحد فروعه،
            // ونعرض الفروع المطابقة فقط داخله.
            const filtered = allCategories
                .map(cat => {
                    const catMatch = cat.name.toLowerCase().includes(q);
                    const subs = (cat.children || [])
                        .filter(s => s.name.toLowerCase().includes(q));

                    if (catMatch) return cat;               // القسم نفسه مطابق → كل فروعه
                    if (subs.length) return { ...cat, children: subs };
                    return null;
                })
                .filter(Boolean);

            render(filtered);

            // فتح النتائج تلقائياً — الباحث يريد أن يرى مباشرة
            container.querySelectorAll(".subcategories").forEach(sub => {
                sub.style.maxHeight = sub.scrollHeight + "px";
                sub.previousElementSibling
                   ?.querySelector(".arrow")
                   ?.classList.add("rotate");
            });
        });

        clearBtn?.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.dispatchEvent(new Event("input"));
            searchInput.focus();
        });
    }


    /* ---------- التشغيل ---------- */

    loadCategories();
});