/* ========================================
   📂 مكتبة سامي الرقمية — صفحة أقسام الكتب
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة  →  كلها في partials.js
      لا تُكرَّر هنا.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       🔹 فتح وإغلاق الأقسام (Accordion)
       ======================================== */

    const headers = document.querySelectorAll(".category-header");

    headers.forEach(header => {
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

    /* ========================================
       🔹 البحث في الأقسام
       ======================================== */

    const categorySearchInput = document.getElementById("categorySearchInput");
    const clearSearch         = document.getElementById("clearSearch");
    const categories          = document.querySelectorAll(".category");
    const noResults           = document.getElementById("noResults");

    if (categorySearchInput) {

        categorySearchInput.addEventListener("input", () => {
            const query = categorySearchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            if (clearSearch) {
                clearSearch.style.display = query ? "flex" : "none";
            }

            categories.forEach(category => {
                const categoryName = (category.dataset.category || "").toLowerCase();
                const subLinks     = category.querySelectorAll(".subcategories a");

                if (query === "") {
                    category.style.display = "block";
                    visibleCount++;
                    return;
                }

                const matchesCategory = categoryName.includes(query);
                const matchesSub = Array.from(subLinks).some(link =>
                    link.textContent.toLowerCase().includes(query)
                );

                if (matchesCategory || matchesSub) {
                    category.style.display = "block";
                    visibleCount++;
                } else {
                    category.style.display = "none";
                }
            });

            if (noResults) {
                noResults.style.display = visibleCount === 0 ? "block" : "none";
            }
        });

        if (clearSearch) {
            clearSearch.addEventListener("click", () => {
                categorySearchInput.value = "";
                categorySearchInput.dispatchEvent(new Event("input"));
                categorySearchInput.focus();
            });
        }
    }
});