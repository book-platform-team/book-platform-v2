/* ========================================
   ⚙️ مكتبة سامي الرقمية - صفحة المؤلفون
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    /* ========================================
       🔹 1. متغيرات الصفحة
       ======================================== */
    
    const authorsGrid = document.getElementById("authorsGrid");
    const authorSearchInput = document.getElementById("authorSearchInput");
    const clearSearch = document.getElementById("clearSearch");
    const noResults = document.getElementById("noResults");
    const noAuthors = document.getElementById("noAuthors");
    
    let allAuthors = [];
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
       🔹 3. جلب المؤلفين
       ======================================== */
    
    async function loadAuthors() {
        try {
            authorsGrid.innerHTML = `
                <div class="loading-authors">
                    <i class='bx bx-loader-alt bx-spin'></i>
                    <p>جارٍ تحميل المؤلفين...</p>
                </div>
            `;

            const response = await fetch("get_authors.php");
            const result = await response.json();

            if (result.success && result.authors.length > 0) {
                allAuthors = result.authors;
                displayAuthors(allAuthors);
                noAuthors.style.display = "none";
            } else {
                allAuthors = [];
                authorsGrid.innerHTML = "";
                noAuthors.style.display = "block";
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
       🔹 4. عرض بطاقات المؤلفين
       ======================================== */
    
    function displayAuthors(authors) {
        authorsGrid.innerHTML = "";

        if (authors.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        authors.forEach(author => {
            const card = document.createElement("div");
            card.className = "author-card";
            card.dataset.author = author.name;
            
            card.addEventListener("click", () => {
                window.location.href = `author-profile.html?id=${author.id}`;
            });

            card.innerHTML = `
                <div class="author-image">
                    <img src="uploads/${author.image || 'default.png'}" alt="${author.name}">
                </div>
                <h3 class="author-name">${author.name}</h3>
                <p class="author-books-count">
                    <i class='bx bx-book'></i>
                    <span>${author.books_count || 0} كتاب</span>
                </p>
                <div class="author-rating">
                    <i class='bx bx-star'></i>
                    <span>${author.rating || "0.0"}</span>
                </div>
            `;

            authorsGrid.appendChild(card);
        });
    }

    /* ========================================
       🔹 5. البحث
       ======================================== */
    
    if (authorSearchInput) {
        authorSearchInput.addEventListener("input", () => {
            const query = authorSearchInput.value.trim().toLowerCase();
            clearSearch.style.display = query ? "flex" : "none";

            if (query === "") {
                displayAuthors(allAuthors);
                return;
            }

            const filteredAuthors = allAuthors.filter(author => 
                author.name.toLowerCase().includes(query)
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
       🔹 6. زر الصعود للأعلى
       ======================================== */
    
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 250) {
                scrollToTopBtn.classList.add('active');
            } else {
                scrollToTopBtn.classList.remove('active');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========================================
       🔹 7. تحديث السنة
       ======================================== */
    
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    /* ========================================
       🔹 8. تحميل المؤلفين
       ======================================== */
    
    loadAuthors();

});