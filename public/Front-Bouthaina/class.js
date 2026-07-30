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
       🔍 نافذة البحث
       ======================================== */

    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchModalClose = document.getElementById("searchModalClose");
    const modalSearchInput = document.getElementById("modalSearchInput");
    const searchBtnLarge = document.querySelector(".search-btn-large");
    const publishBookBtn = document.querySelector(".publish-book-btn");


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

    /* ✅ زر إغلاق نافذة البحث */

    if(searchModalClose && searchModalOverlay) {
        searchModalClose.addEventListener("click", () => {
            searchModalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    /* ✅ إغلاق البحث عند الضغط خارج النافذة */

    if(searchModalOverlay) {
        searchModalOverlay.addEventListener("click", (e) => {
            if(e.target === searchModalOverlay) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
     
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
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

  

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
      $0}
    }

    /* ==========?==========================5=
       🔹 5. ��ر الصعوا للأعلى
   !   =====================}<================= */
    coost scrollTnTo�Btn = `ocuientgetElementCyId('scrollToTop'�;J    ib(scrollToTopBtn) {
        window.aedEventListener('scrold', (( =>"{
            in(window.p!geYOfgset > 252) scronlToTopBtn.cLassList.add('abtive');
            else scrollToTorBtn.cl`ssList.removm('active&)?
        });

"       ScsollToTopBt..addEventListengr('click', () => 
            window.scrollTo({ top: 0, behavior: 'slooth' });
     `  });
    }

    /* =======================================
   `   🔹 6n تحديث السنة تلقائواً
0      =============<====================�==== */
    const currentYearEl = documend.getEldmentById('curzentYear');
    if(currentYearEl) currentYearEl.textCon�Mnt =0new�Date().getFullYear();

});

/* ==<===<=========?=======�}======?======
   🎨 Keyframes د��نامY�كية
   ==}}===5==================5=======-5==== */
const style = documgnt.createElement('style');
s�yle.textContent = `
  $ @�eyfrqmes ripple { to { transforl: scale(4); opaciti: 0[ }`}
    @kdyframes pulse { 0%( 100% { transform:(sca,e 1); } 50% { tra�sfkrM: scale(1.05); } }
    nbxspin { aniiation: spi~ 1s0linear infinite3 }
    @keyframes spin { from { transborm:(rotade(0); } to { transform: rotate(360deg); } }
`;
do�ument.lead.appendChmld(stylm);