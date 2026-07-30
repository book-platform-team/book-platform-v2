/* ========================================
   📚 مكتبة سامي الرقمية — الصفحة الرئيسية
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة  →  كلها في partials.js
      لا تُكرَّر هنا.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================
       🔍 بحث الهيرو والاقتراحات
       ======================================== */

    const categories = [
        "روايات", "تاريخ", "تنمية بشرية", "علوم الحاسوب",
        "إسلاميات", "فلسفة", "شعر", "سياسة"
    ];

    const searchInput    = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    if (searchInput && suggestionsBox) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim();
            suggestionsBox.innerHTML = "";

            if (query === "") {
                suggestionsBox.style.display = "none";
                return;
            }

            const matches = categories.filter(cat =>
                cat.toLowerCase().includes(query.toLowerCase())
            );

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
            } else {
                suggestionsBox.style.display = "none";
            }
        });

        // زر البحث داخل صندوق الهيرو
        const heroSearchBtn = document.querySelector(".search-box .search-btn");
        if (heroSearchBtn) {
            heroSearchBtn.addEventListener("click", (e) => {
                const val = searchInput.value.trim();
                if (!val) return;
                e.stopPropagation();   // لا نفتح المودال إذا كان هناك نص
                // TODO (اليوم الثالث): تنفيذ بحث حقيقي
                heroSearchBtn.innerHTML = '<i class="bx bx-check"></i>';
                setTimeout(() => {
                    heroSearchBtn.innerHTML = '<i class="bx bx-search"></i>';
                }, 1500);
            });
        }
    }

    /* ========================================
       📚 تفاعل كروت الكتب
       ======================================== */

    document.querySelectorAll(".book-card").forEach(card => {

        card.addEventListener("mousemove", (e) => {
            const rect    = card.getBoundingClientRect();
            const x       = e.clientX - rect.left;
            const y       = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
        });

        card.addEventListener("click", () => {
            // TODO (اليوم الثالث): التوجيه إلى /book.html?slug=... بعد ربط البيانات
            const title = card.querySelector("h3")?.innerText || "الكتاب";
            card.style.animation = "pulse 0.3s ease";
            setTimeout(() => {
                card.style.animation = "";
                alert(`📚 تم اختيار: ${title}`);
            }, 300);
        });
    });

    /* ========================================
       🎛️ أزرار الفلاتر السريعة
       ======================================== */

    const filterBtns = document.querySelectorAll(".filter-btn");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // تأثير التموّج
            const rect   = btn.getBoundingClientRect();
            const size   = Math.max(rect.width, rect.height);
            const ripple = document.createElement("span");

            ripple.style.cssText = `
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
            btn.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);

            // TODO (اليوم الثالث): إعادة تحميل الكتب حسب btn.dataset.filter
        });
    });

    /* ========================================
       🎚️ فلاتر الكتب (Segmented Control)
       ======================================== */

    const segmentedOptions = document.querySelectorAll(".segmented-option");
    const segmentedSlider  = document.querySelector(".segmented-slider");

    function updateSlider(activeOption) {
        if (!segmentedSlider || !activeOption) return;
        segmentedSlider.style.width = activeOption.offsetWidth + "px";
        segmentedSlider.style.left  = activeOption.offsetLeft  + "px";
    }

    segmentedOptions.forEach(option => {
        option.addEventListener("click", () => {
            segmentedOptions.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");
            updateSlider(option);
            // TODO (اليوم الثالث): إعادة تحميل الكتب حسب option.dataset.filter
        });
    });

    function refreshSlider() {
        const active = document.querySelector(".segmented-option.active");
        if (active) updateSlider(active);
    }

    window.addEventListener("load",   refreshSlider);
    window.addEventListener("resize", refreshSlider);

    /* ========================================
       🎬 تأثيرات الظهور عند التمرير
       ======================================== */

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".categories-list, .authors-section").forEach(el => {
        el.style.opacity    = "0";
        el.style.transform  = "translateY(25px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });
});


/* ========================================
   🎨 Keyframes ديناميكية
   ======================================== */

const libraryPageStyle = document.createElement("style");
libraryPageStyle.textContent = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .bx-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(libraryPageStyle);