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
       🔍 البحث والاقتراحات
       ======================================== */
    const categories = ["روايات", "تاريخ", "تنمية بشرية", "علوم الحاسوب", "إسلاميات", "فلسفة", "شعر", "سياسة"];
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    if(searchInput && suggestionsBox) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim();
            suggestionsBox.innerHTML = "";
            if (query === "") { suggestionsBox.style.display = "none"; return; }
            const matches = categories.filter(cat => cat.toLowerCase().includes(query.toLowerCase()));
            if (matches.length > 0) {
                matches.forEach((cat, index) => {
                    const li = document.createElement("li");
                    li.innerHTML = `<i class='bx bx-search-alt'></i> ${cat}`;
                    li.style.animationDelay = `${index * 0.05}s`;
                    li.addEventListener("click", () => {
                        searchInput.value = cat;
                        suggestionsBox.style.display = "none";
                    });
                    suggestionsBox.appendChild(li);
                });
                suggestionsBox.style.display = "block";
            } else { suggestionsBox.style.display = "none"; }
        });

        const searchBtn = document.querySelector(".search-box .search-btn");
        if(searchBtn) {
            searchBtn.addEventListener("click", () => {
                const val = searchInput.value.trim();
                if(val) {
                    searchBtn.innerHTML = '<i class="bx bx-check"></i>';
                    setTimeout(() => searchBtn.innerHTML = '<i class="bx bx-search"></i>', 1500);
                }
            });
        }
    }

    /* ========================================
       📚 تفاعل كروت الكتب
       ======================================== */
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
        card.addEventListener('click', () => {
            const title = card.querySelector('h3')?.innerText || 'الكتاب';
            card.style.animation = 'pulse 0.3s ease';
            setTimeout(() => { card.style.animation = ''; alert(`📚 تم اختيار: ${title}`); }, 300);
        });
    });

    /* ========================================
       🎛️ أزرار الفلاتر
       ======================================== */
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const ripple = document.createElement('span');
            ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.5);transform:scale(0);animation:ripple 0.6s linear;pointer-events:none;`;
            btn.style.position = 'relative'; btn.style.overflow = 'hidden'; btn.appendChild(ripple);
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size/2}px`;
            ripple.style.top = `${event.clientY - rect.top - size/2}px`;
            setTimeout(() => ripple.remove(), 600);
        });
    });

    /* ========================================
       🎚️ فلاتر الكتب (Segmented Control)
       ======================================== */
    const segmentedOptions = document.querySelectorAll(".segmented-option");
    const segmentedSlider = document.querySelector(".segmented-slider");
    function updateSlider(activeOption) {
        if(segmentedSlider && activeOption) {
            segmentedSlider.style.width = activeOption.offsetWidth + 'px';
            segmentedSlider.style.left = activeOption.offsetLeft + 'px';
        }
    }
    segmentedOptions.forEach(option => {
        option.addEventListener("click", () => {
            segmentedOptions.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active"); updateSlider(option);
        });
    });
    window.addEventListener("load", () => { const activeOption = document.querySelector(".segmented-option.active"); if(activeOption) updateSlider(activeOption); });
    window.addEventListener("resize", () => { const activeOption = document.querySelector(".segmented-option.active"); if(activeOption) updateSlider(activeOption); });

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
