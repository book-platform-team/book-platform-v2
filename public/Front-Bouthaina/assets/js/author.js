/* ========================================
   ✍️ مكتبة سامي الرقمية — صفحة المؤلفين
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة  →  كلها في partials.js
      لا تُكرَّر هنا.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- عناصر الصفحة ---------- */

    const authorsGrid       = document.getElementById("authorsGrid");
    const noAuthors         = document.getElementById("noAuthors");
    const noResults         = document.getElementById("noResults");
    const authorSearchInput = document.getElementById("authorSearchInput");
    const clearSearch       = document.getElementById("clearSearch");

    let allAuthors = [];


    /* ========================================
       🔹 جلب المؤلفين
       ======================================== */

    async function loadAuthors() {
        if (!authorsGrid) return;

        authorsGrid.innerHTML = `
            <div class="loading-authors">
                <i class='bx bx-loader-alt bx-spin'></i>
                <p>جارٍ تحميل المؤلفين...</p>
            </div>
        `;

        try {
            // شكل الرد المتفق عليه في API.md: { success, data: [...] }
            const result  = await apiGet("/authors");
            const authors = result.data || [];

            if (authors.length > 0) {
                allAuthors = authors;
                displayAuthors(allAuthors);
                if (noAuthors) noAuthors.style.display = "none";
            } else {
                allAuthors = [];
                authorsGrid.innerHTML = "";
                if (noAuthors) noAuthors.style.display = "block";
            }
        } catch (error) {
            console.error("Error loading authors:", error);
            authorsGrid.innerHTML = `
                <div class="error-message">
                    <i class='bx bx-error-circle'></i>
                    <p>حدث خطأ في تحميل المؤلفين</p>
                </div>
            `;
        }
    }


    /* ========================================
       🔹 عرض بطاقات المؤلفين
       ======================================== */

    function displayAuthors(authors) {
        if (!authorsGrid) return;

        authorsGrid.innerHTML = "";

        if (authors.length === 0) {
            if (noResults) noResults.style.display = "block";
            return;
        }

        if (noResults) noResults.style.display = "none";

        authors.forEach(author => {
            const card = document.createElement("div");
            card.className = "author-card";
            card.dataset.author = author.name;

            card.addEventListener("click", () => {
                // TODO: author-profile.html تُبنى في اليوم الخامس
                window.location.href =
                    `/author-profile.html?slug=${author.slug || author.id}`;
            });

            const photo = author.photo
                ? `<img src="${author.photo}" alt="${author.name}" class="author-image">`
                : `<div class="author-photo-fallback">${author.name.charAt(0)}</div>`;

            card.innerHTML = `
                <div class="author-card-inner">
                    <div class="author-image-wrapper">${photo}</div>
                    <div class="author-info">
                        <h3 class="author-name">${author.name}</h3>
                        <div class="author-stats">
                            <span class="stat-item">
                                <i class='bx bx-book'></i>
                                ${author.books_count || 0} كتاب
                            </span>
                            <span class="stat-item">
                                <i class='bx bx-star'></i>
                                ${author.rating || "0.0"}
                            </span>
                        </div>
                    </div>
                    <div class="author-card-footer">
                        <span class="view-profile">
                            عرض الملف <i class='bx bx-chevron-left'></i>
                        </span>
                    </div>
                </div>
            `;

            authorsGrid.appendChild(card);
        });
    }


    /* ========================================
       🔹 البحث في المؤلفين
       ======================================== */

    if (authorSearchInput) {

        authorSearchInput.addEventListener("input", () => {
            const query = authorSearchInput.value.trim().toLowerCase();

            if (clearSearch) clearSearch.style.display = query ? "flex" : "none";

            if (query === "") {
                displayAuthors(allAuthors);
                return;
            }

            const filtered = allAuthors.filter(a =>
                a.name.toLowerCase().includes(query)
            );

            displayAuthors(filtered);
        });

        if (clearSearch) {
            clearSearch.addEventListener("click", () => {
                authorSearchInput.value = "";
                authorSearchInput.dispatchEvent(new Event("input"));
                authorSearchInput.focus();
            });
        }
    }


    /* ---------- التشغيل ---------- */

    loadAuthors();
});