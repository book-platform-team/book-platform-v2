/* ========================================
    مكتبة سامي الرقمية - ملف الجافاسكريبت
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       🔹 تعريف المتغيرات العامة (مهم جداً!)
       ======================================== */
    // ⭐ متغيرات قسم المؤلفين - كانت ناقصة!
    const authorSearchInput = document.getElementById("authorSearchInput");
    const clearSearch = document.getElementById("clearSearch");
    const authorsGrid = document.getElementById("authorsGrid");
    const noAuthors = document.getElementById("noAuthors");
    const noResults = document.getElementById("noResults");
    let allAuthors = []; // مصفوفة لتخزين بيانات المؤلفين

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
       🔍 نافذة البحث في الهيدر
       ======================================== */
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchModalClose = document.getElementById("searchModalClose");
    const modalSearchInput = document.getElementById("modalSearchInput");

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

    document.querySelectorAll('.book-card, .categories-list, .authors-section, .author-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    /* ========================================
       🔹 جلب المؤلفين من قاعدة البيانات ✅
       ======================================== */
    async function loadAuthors() {
        // ⭐ تحقق من وجود العناصر قبل الاستخدام
        if(!authorsGrid) {
            console.warn("⚠️ authorsGrid غير موجود في الصفحة");
            return;
        }

        try {
            // عرض حالة التحميل
            authorsGrid.innerHTML = `
                <div class="loading-authors">
                    <i class='bx bx-loader-alt bx-spin'></i>
                    <p>جارٍ تحميل المؤلفين...</p>
                </div>
            `;

            const response = await fetch("get_authors.php");
            
            // ⭐ تحقق من نجاح الطلب
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success && Array.isArray(result.authors) && result.authors.length > 0) {
                allAuthors = result.authors;
                displayAuthors(allAuthors);
                
                // إخفاء رسائل "لا يوجد"
                if(noAuthors) noAuthors.style.display = "none";
                if(noResults) noResults.style.display = "none";
                
            } else {
                allAuthors = [];
                authorsGrid.innerHTML = "";
                if(noAuthors) noAuthors.style.display = "block";
                if(noResults) noResults.style.display = "none";
            }
        } catch (error) {
            console.error("❌ Error loading authors:", error);
            authorsGrid.innerHTML = `
                <div class="error-message">
                    <i class='bx bx-error-circle'></i>
                    <p>حدث خطأ في تحميل المؤلفين</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    /* ========================================
       🔹 عرض بطاقات المؤلفين بشكل جميل ✅
       ======================================== */
    function displayAuthors(authors) {
        if(!authorsGrid) return;
        
        authorsGrid.innerHTML = "";

        if (!authors || authors.length === 0) {
            if(noResults) noResults.style.display = "block";
            return;
        }

        if(noResults) noResults.style.display = "none";

        authors.forEach(author => {
            const card = document.createElement("div");
            card.className = "author-card";
            card.dataset.authorId = author.id;
            card.dataset.authorName = author.name;
            
            // ⭐ تأثير النقر للانتقال لصفحة المؤلف
            card.addEventListener("click", () => {
                if(author.id) {
                    window.location.href = `author-profile.html?id=${author.id}`;
                }
            });

            // ⭐ هيكلية البطاقة
            card.innerHTML = `
                <div class="author-card-inner">
                    <div class="author-image-wrapper">
                        <img src="uploads/${author.image || 'default-author.png'}" 
                             alt="${author.name}" 
                             class="author-image"
                             onerror="this.src='uploads/default-author.png'">
                        <div class="author-image-overlay">
                            <i class='bx bx-user-circle'></i>
                        </div>
                    </div>
                    
                    <div class="author-info">
                        <h3 class="author-name">${author.name || 'مؤلف غير معروف'}</h3>
                        
                        <div class="author-stats">
                            <div class="stat-item">
                                <i class='bx bx-book'></i>
                                <span>${author.books_count || 0} كتاب</span>
                            </div>
                            <div class="stat-item">
                                <i class='bx bx-star'></i>
                                <span>${author.rating ? parseFloat(author.rating).toFixed(1) : "0.0"}</span>
                            </div>
                        </div>
                        
                        ${author.bio ? `<p class="author-bio">${author.bio.substring(0, 80)}...</p>` : ''}
                    </div>
                    
                    <div class="author-card-footer">
                        <span class="view-profile">عرض الملف الشخصي <i class='bx bx-chevron-left'></i></span>
                    </div>
                </div>
            `;

            authorsGrid.appendChild(card);
        });
    }

    /* ========================================
       🔹 البحث عن المؤلفين
       ======================================== */
    if (authorSearchInput) {
        authorSearchInput.addEventListener("input", () => {
            const query = authorSearchInput.value.trim().toLowerCase();
            
            if(clearSearch) {
                clearSearch.style.display = query ? "flex" : "none";
            }

            if (query === "") {
                displayAuthors(allAuthors);
                return;
            }

            const filteredAuthors = allAuthors.filter(author => 
                author.name && author.name.toLowerCase().includes(query)
            );

            displayAuthors(filteredAuthors);
        });

        if (clearSearch) {
            clearSearch.addEventListener("click", () => {
                authorSearchInput.value = "";
                authorSearchInput.dispatchEvent(new Event("input"));
                authorSearchInput.focus();
            });
        }
    }

    /* ========================================
       🔹 بدء تحميل المؤلفين
       ======================================== */
    loadAuthors();
    
    /* ========================================
       ⬆️ زر الصعود للأعلى
       ======================================== */
    const scrollToTopBtn = document.getElementById('scrollToTop');

    if(scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if(window.pageYOffset > 250) {
                scrollToTopBtn.classList.add('active');
            } else {
                scrollToTopBtn.classList.remove('active');
            }
        });

        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========================================
       📅 تحديث السنة تلقائياً
       ======================================== */
    const currentYearEl = document.getElementById('currentYear');
    if(currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

});

/* ========================================
   🎨 إضافة Keyframes ديناميكية
   ======================================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .bx-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);;