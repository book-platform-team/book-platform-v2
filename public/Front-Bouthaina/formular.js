/* ========================================
    مكتبة سامي الرقمية - ملف الجافاسكريبت
   ======================================== */

   
document.addEventListener("DOMContentLoaded", () => {
    
    /* ========================================
       القائمة المنسدلة (Desktop)
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
       📱 القائمة الجانبية للجوال
       ======================================== */
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileNavOverlay = document.getElementById("mobileNavOverlay");
    const closeMobileNav = document.getElementById("closeMobileNav");

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

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileDropdownMenu = document.getElementById("mobileDropdownMenu");
    if(mobileMenuBtn && mobileDropdownMenu) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileDropdownMenu.classList.toggle("show");
            mobileMenuBtn.classList.toggle("active");
        });
    }
 /* ========================================
       🔍 Modal البحث - موحد لجميع أزرار البحث
       ======================================== */
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchModalClose = document.getElementById("searchModalClose");
    const modalSearchInput = document.getElementById("modalSearchInput");
    const searchBtnLarge = document.querySelector(".search-btn-large");
    const publishBookBtn = document.querySelector(".publish-book-btn");

    // ⭐ جميع أزرار البحث تفتح نفس المودال (باستخدام كلاس مشترك)
    const allSearchTriggers = document.querySelectorAll(".search-trigger, .search-icon-btn");
    allSearchTriggers.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if(searchModalOverlay) {
                searchModalOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
                setTimeout(() => modalSearchInput?.focus(), 300);
            }
        });
    });

    if(searchModalClose && searchModalOverlay) {
        searchModalClose.addEventListener("click", () => {
            searchModalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    if(searchModalOverlay) {
        searchModalOverlay.addEventListener("click", (e) => {
            if(e.target === searchModalOverlay) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
        document.addEventListener("keydown", (e) => {
            if(e.key === "Escape" && searchModalOverlay.classList.contains("active")) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    if(searchBtnLarge && modalSearchInput) {
        searchBtnLarge.addEventListener("click", () => {
            const query = modalSearchInput.value.trim();
            if(query) {
                searchBtnLarge.innerHTML = '<i class="bx bx-check"></i> تم';
                setTimeout(() => {
                    searchBtnLarge.innerHTML = '<i class="bx bx-search"></i><span>بحث</span>';
                    searchModalOverlay.classList.remove("active");
                    document.body.style.overflow = "";
                }, 1500);
            }
        });
        modalSearchInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter") {
                const query = modalSearchInput.value.trim();
                if(query) searchBtnLarge.click();
            }
        });
    }

    if(publishBookBtn) {
        publishBookBtn.addEventListener("click", () => {
            publishBookBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري التوجيه...';
            setTimeout(() => {
                publishBookBtn.innerHTML = '<i class="bx bx-upload"></i><span>نشر كتاب</span>';
                alert("🚀 سيتم توجيهك لصفحة نشر الكتاب");
            }, 1500);
        });
    }

    /* ========================================
       🎬 تأثيرات الظهور عند التمرير
       ======================================== */
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.book-card, .categories-list, .authors-section').forEach(el => {
        el.style.opacity = '0'; el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    /* ========================================
       ⬆️ زر الصعود للأعلى
       ======================================== */
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if(scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if(window.pageYOffset > 250) { scrollToTopBtn.classList.add('active'); }
            else { scrollToTopBtn.classList.remove('active'); }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========================================
       📅 تحديث السنة تلقائياً
       ======================================== */
    const currentYearEl = document.getElementById('currentYear');
    if(currentYearEl) { currentYearEl.textContent = new Date().getFullYear(); }
});

/* ========================================
   🎨 إضافة Keyframes ديناميكية
   ======================================== */


const style = document.createElement('style');
style.textContent = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .bx-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
