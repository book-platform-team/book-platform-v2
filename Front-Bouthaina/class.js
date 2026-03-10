/* ========================================
   ⚙️ مكتبة سامي الرقمية - صفحة الأقسام
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    /* ========================================
       🔹 1. القائمة المنسدلة (Desktop)
       ======================================== */
    const menuBtn = document.getElementById("menuBtn");
    const dropdownContent = document.getElementById("dropdownMenu");
    const closeMenu = document.getElementById("closeMenu");

    if(menuBtn && dropdownContent) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle("show");
            menuBtn.classList.toggle("active");
        });
    }

    if(closeMenu) {
        closeMenu.addEventListener("click", (e) => {
            e.preventDefault();
            dropdownContent.classList.remove("show");
            menuBtn.classList.remove("active");
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

    /* ========================================
       🔹 2. القائمة الجانبية للجوال
       ======================================== */
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileNavOverlay = document.getElementById("mobileNavOverlay");
    const closeMobileNav = document.getElementById("closeMobileNav");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileDropdownMenu = document.getElementById("mobileDropdownMenu");

    if(hamburgerBtn && mobileNavOverlay) {
        hamburgerBtn.addEventListener("click", () => {
            mobileNavOverlay.classList.add("active");
            hamburgerBtn.classList.toggle("active");
            document.body.style.overflow = "hidden";
        });
    }

    if(closeMobileNav && mobileNavOverlay) {
        closeMobileNav.addEventListener("click", () => {
            mobileNavOverlay.classList.remove("active");
            hamburgerBtn.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    if(mobileNavOverlay) {
        mobileNavOverlay.addEventListener("click", (e) => {
            if(e.target === mobileNavOverlay) {
                mobileNavOverlay.classList.remove("active");
                hamburgerBtn.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    if(mobileMenuBtn && mobileDropdownMenu) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileDropdownMenu.classList.toggle("show");
            mobileMenuBtn.classList.toggle("active");
        });
    }

    /* ========================================
       🔹 3. أقسام الكتب - الكود تاعك
       ======================================== */
    const headers = document.querySelectorAll(".category-header");

    headers.forEach(header => {
        header.addEventListener("click", () => {
            const sub = header.nextElementSibling;
            const arrow = header.querySelector(".arrow");

            if(sub.style.maxHeight){
                sub.style.maxHeight = null;
                arrow.classList.remove("rotate");
            } else {
                sub.style.maxHeight = sub.scrollHeight + "px";
                arrow.classList.add("rotate");
            }
        });
    });

    /* ========================================
       🔹 4. البحث في الأقسام
       ======================================== */
    const categorySearchInput = document.getElementById("categorySearchInput");
    const clearSearch = document.getElementById("clearSearch");
    const categories = document.querySelectorAll(".category");
    const noResults = document.getElementById("noResults");

    if(categorySearchInput) {
        categorySearchInput.addEventListener("input", () => {
            const query = categorySearchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            clearSearch.style.display = query ? "flex" : "none";

            categories.forEach(category => {
                const categoryName = category.dataset.category.toLowerCase();
                const subLinks = category.querySelectorAll(".subcategories a");
                
                if(query === "") {
                    category.style.display = "block";
                    visibleCount++;
                    return;
                }

                const matchesCategory = categoryName.includes(query);
                const matchesSub = Array.from(subLinks).some(link => 
                    link.textContent.toLowerCase().includes(query)
                );

                if(matchesCategory || matchesSub) {
                    category.style.display = "block";
                    visibleCount++;
                } else {
                    category.style.display = "none";
                }
            });

            if(noResults) {
                noResults.style.display = visibleCount === 0 ? "block" : "none";
            }
        });

        if(clearSearch) {
            clearSearch.addEventListener("click", () => {
                categorySearchInput.value = "";
                categorySearchInput.dispatchEvent(new Event("input"));
                categorySearchInput.focus();
            });
        }
    }

    /* ========================================
       🔹 5. زر الصعود للأعلى
       ======================================== */
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if(scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if(window.pageYOffset > 250) scrollToTopBtn.classList.add('active');
            else scrollToTopBtn.classList.remove('active');
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========================================
       🔹 6. تحديث السنة تلقائياً
       ======================================== */
    const currentYearEl = document.getElementById('currentYear');
    if(currentYearEl) currentYearEl.textContent = new Date().getFullYear();

});

/* ========================================
   🎨 Keyframes ديناميكية
   ======================================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .bx-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);