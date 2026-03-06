/* ========================================
   ⚙️ مكتبة سامي الرقمية - ملف الجافاسكريبت
   ========================================
   هذا الملف يحتوي على جميع التفاعلات
   والوظائف الديناميكية للموقع
   مع تعليقات توضيحية لكل قسم
   ======================================== */

// انتظار تحميل كامل صفحة HTML قبل تنفيذ الكود
document.addEventListener("DOMContentLoaded", () => {
    

    /* ========================================
       📋 2. القائمة المنسدلة (Desktop Dropdown)
       ======================================== */
    
    // تحديد عناصر القائمة المنسدلة
    const menuBtn = document.getElementById("menuBtn");
    const dropdownContent = document.getElementById("dropdownMenu");
    const closeMenu = document.getElementById("closeMenu");

    // فتح/إغلاق القائمة عند الضغط على زر "القائمة"
    if(menuBtn && dropdownContent) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // منع انتشار الحدث للوثيقة
            dropdownContent.classList.toggle("show"); // إظهار/إخفاء القائمة
            menuBtn.classList.toggle("active"); // تدوير أيقونة السهم
        });
    }

    // إغلاق القائمة عند الضغط على زر "إغلاق" داخلها
    if(closeMenu) {
        closeMenu.addEventListener("click", (e) => {
            e.preventDefault(); // منع السلوك الافتراضي للرابط
            dropdownContent.classList.remove("show");
            menuBtn.classList.remove("active");
        });
    }

    // إغلاق القائمة عند الضغط في أي مكان خارجها
    document.addEventListener("click", (e) => {
        if (menuBtn && dropdownContent && 
            !menuBtn.contains(e.target) && 
            !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove("show");
            menuBtn.classList.remove("active");
        }
    });

    /* ========================================
       📱 3. القائمة الجانبية للجوال (Mobile Nav)
       ======================================== */
    
    // تحديد عناصر قائمة الجوال
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileNavOverlay = document.getElementById("mobileNavOverlay");
    const closeMobileNav = document.getElementById("closeMobileNav");

    // فتح القائمة عند الضغط على زر الهمبرغر
    if(hamburgerBtn && mobileNavOverlay) {
        hamburgerBtn.addEventListener("click", () => {
            mobileNavOverlay.classList.add("active"); // إظهار الخلفية والقائمة
            hamburgerBtn.classList.toggle("active"); // تبديل أيقونة الهمبرغر
            document.body.style.overflow = "hidden"; // منع التمرير في الخلفية
        });
    }

    // إغلاق القائمة عند الضغط على زر الإغلاق (X)
    if(closeMobileNav && mobileNavOverlay) {
        closeMobileNav.addEventListener("click", () => {
            mobileNavOverlay.classList.remove("active");
            hamburgerBtn.classList.remove("active");
            document.body.style.overflow = ""; // إعادة التمرير
        });
    }

    // إغلاق القائمة عند الضغط على الخلفية الضبابية
    if(mobileNavOverlay) {
        mobileNavOverlay.addEventListener("click", (e) => {
            if(e.target === mobileNavOverlay) { // التأكد أن الضغط كان على الخلفية وليس القائمة
                mobileNavOverlay.classList.remove("active");
                hamburgerBtn.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // Dropdown داخل قائمة الجوال
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileDropdownMenu = document.getElementById("mobileDropdownMenu");

    if(mobileMenuBtn && mobileDropdownMenu) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // منع إغلاق القائمة الرئيسية
            mobileDropdownMenu.classList.toggle("show"); // إظهار/إخفاء القائمة الفرعية
            mobileMenuBtn.classList.toggle("active"); // تدوير السهم
        });
    }

    /* ========================================
       🔍 4. البحث والاقتراحات (Search & Suggestions)
       ======================================== */
    
    // قائمة التصنيفات للبحث فيها
    const categories = ["روايات", "تاريخ", "تنمية بشرية", "علوم الحاسوب", "إسلاميات", "فلسفة", "شعر", "سياسة"];
    
    // تحديد عناصر حقل البحث والاقتراحات
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    if(searchInput && suggestionsBox) {
        // الاستماع لحدث الكتابة في حقل البحث
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim(); // إزالة المسافات الزائدة
            suggestionsBox.innerHTML = ""; // مسح الاقتراحات السابقة
            
            // إخفاء الصندوق إذا كان الحقل فارغاً
            if (query === "") {
                suggestionsBox.style.display = "none";
                return;
            }

            // تصفية التصنيفات التي تحتوي على نص البحث (مع تجاهل حالة الأحرف)
            const matches = categories.filter(cat => cat.toLowerCase().includes(query.toLowerCase()));
            
            // عرض الاقتراحات المطابقة
            if (matches.length > 0) {
                matches.forEach((cat, index) => {
                    const li = document.createElement("li"); // إنشاء عنصر قائمة جديد
                    li.innerHTML = `<i class='bx bx-search-alt'></i> ${cat}`; // إضافة أيقونة ونص
                    li.style.animationDelay = `${index * 0.05}s`; // تأخير متتابع للأنيميشن
                    
                    // عند اختيار اقتراح: ملء الحقل وإخفاء الصندوق
                    li.addEventListener("click", () => {
                        searchInput.value = cat;
                        suggestionsBox.style.display = "none";
                    });
                    
                    suggestionsBox.appendChild(li);
                });
                suggestionsBox.style.display = "block"; // إظهار الصندوق
            } else {
                suggestionsBox.style.display = "none"; // إخفاء إذا لا توجد نتائج
            }
        });

        // زر البحث الرئيسي
        const searchBtn = document.querySelector(".search-box .search-btn");
        if(searchBtn) {
            searchBtn.addEventListener("click", () => {
                const val = searchInput.value.trim();
                if(val) {
                    // تغيير الأيقونة إلى علامة صح كتأكيد بصري
                    searchBtn.innerHTML = '<i class="bx bx-check"></i>';
                    setTimeout(() => searchBtn.innerHTML = '<i class="bx bx-search"></i>', 1500);
                }
            });
        }
    }

    /* ========================================
       📚 5. تفاعل كروت الكتب (3D Tilt Effect)
       ======================================== */
    
    const cards = document.querySelectorAll('.book-card');
    
    cards.forEach(card => {
        // تأثير الإمالة ثلاثية الأبعاد عند حركة الماوس
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect(); // أبعاد العنصر
            const x = e.clientX - rect.left; // موقع الماوس الأفقي داخل الكرت
            const y = e.clientY - rect.top; // موقع الماوس العمودي داخل الكرت
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // حساب زاوية الدوران بناءً على موقع الماوس
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            // تطبيق التحويل ثلاثي الأبعاد
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        // إعادة الكرت لوضعه الأصلي عند مغادرة الماوس
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
        
        // تأثير عند النقر على الكرت
        card.addEventListener('click', () => {
            const title = card.querySelector('h3')?.innerText || 'الكتاب';
            
            // تأثير نبض بسيط عند الاختيار
            card.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                card.style.animation = '';
                alert(`📚 تم اختيار: ${title}`);
            }, 300);
        });
    });

    /* ========================================
       🎛️ 6. أزرار التصنيفات السريعة (Ripple Effect)
       ======================================== */
    
    const filterBtns = document.querySelectorAll(".filter-btn");
    
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // إزالة كلاس active من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove("active"));
            // إضافة كلاس active للزر المضغوط
            btn.classList.add("active");
            
            /* ========================================
               تأثير Ripple (موجة) عند النقر
               ======================================== */
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute; border-radius: 50%;
                background: rgba(255,255,255,0.5);
                transform: scale(0); animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            
            // حساب موقع النقر لإنشاء الموجة من نقطة الضغط
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size/2}px`;
            ripple.style.top = `${event.clientY - rect.top - size/2}px`;
            
            // إزالة عنصر الموجة بعد انتهاء الأنيميشن
            setTimeout(() => ripple.remove(), 600);
        });
    });

    /* ========================================
       🎚️ 7. فلاتر الكتب الأنيقة (Segmented Control)
       ======================================== */
    
    const segmentedOptions = document.querySelectorAll(".segmented-option");
    const segmentedSlider = document.querySelector(".segmented-slider");

    // دالة لتحديث موقع وحجم الشريط المتحرك
    function updateSlider(activeOption) {
        if(segmentedSlider && activeOption) {
            segmentedSlider.style.width = activeOption.offsetWidth + 'px';
            segmentedSlider.style.left = activeOption.offsetLeft + 'px';
        }
    }

    // إضافة حدث النقر لكل خيار
    segmentedOptions.forEach(option => {
        option.addEventListener("click", () => {
            // إزالة active من الجميع
            segmentedOptions.forEach(opt => opt.classList.remove("active"));
            // إضافة active للخيار الحالي
            option.classList.add("active");
            // تحديث موقع الشريط
            updateSlider(option);
        });
    });

    // تحديث الشريط عند تحميل الصفحة لأول مرة
    window.addEventListener("load", () => {
        const activeOption = document.querySelector(".segmented-option.active");
        if(activeOption) updateSlider(activeOption);
    });

    // إعادة حساب الشريط عند تغيير حجم النافذة
    window.addEventListener("resize", () => {
        const activeOption = document.querySelector(".segmented-option.active");
        if(activeOption) updateSlider(activeOption);
    });

    /* ========================================
       🔍 8. Modal البحث المتقدم
       ======================================== */
    
    const searchModalBtn = document.getElementById("searchModalBtn");
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchModalClose = document.getElementById("searchModalClose");

    // فتح Modal البحث
    if(searchModalBtn && searchModalOverlay) {
        searchModalBtn.addEventListener("click", () => {
            searchModalOverlay.classList.add("active");
            document.body.style.overflow = "hidden"; // منع التمرير في الخلفية
            // تركيز تلقائي على حقل البحث بعد فتح المودال
            setTimeout(() => document.getElementById("modalSearchInput")?.focus(), 300);
        });
    }

    // إغلاق Modal البحث
    if(searchModalClose && searchModalOverlay) {
        searchModalClose.addEventListener("click", () => {
            searchModalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    // إغلاق المودال عند الضغط على الخلفية
    if(searchModalOverlay) {
        searchModalOverlay.addEventListener("click", (e) => {
            if(e.target === searchModalOverlay) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
        
        // إغلاق المودال عند ضغط زر Escape في لوحة المفاتيح
        document.addEventListener("keydown", (e) => {
            if(e.key === "Escape" && searchModalOverlay.classList.contains("active")) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // معالجة البحث داخل المودال
    const modalSearchInput = document.getElementById("modalSearchInput");
    const searchBtnLarge = document.querySelector(".search-btn-large");

    if(searchBtnLarge && modalSearchInput) {
        searchBtnLarge.addEventListener("click", () => {
            const query = modalSearchInput.value.trim();
            if(query) {
                // تغيير نص الزر كتأكيد بصري
                searchBtnLarge.innerHTML = '<i class="bx bx-check"></i> تم';
                setTimeout(() => {
                    searchBtnLarge.innerHTML = '<i class="bx bx-search"></i><span>بحث</span>';
                    searchModalOverlay.classList.remove("active");
                    document.body.style.overflow = "";
                }, 1500);
            }
        });
        
        // دعم ضغط Enter للبحث
        modalSearchInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter") {
                const query = modalSearchInput.value.trim();
                if(query) {
                    searchBtnLarge.click();
                }
            }
        });
    }

    // زر "نشر كتاب" داخل المودال
    const publishBookBtn = document.querySelector(".publish-book-btn");
    if(publishBookBtn) {
        publishBookBtn.addEventListener("click", () => {
            // تأثير تحميل وهمي
            publishBookBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري التوجيه...';
            setTimeout(() => {
                publishBookBtn.innerHTML = '<i class="bx bx-upload"></i><span>نشر كتاب</span>';
                alert("🚀 سيتم توجيهك لصفحة نشر الكتاب");
            }, 1500);
        });
    }

    /* ========================================
       🎬 9. تأثيرات الظهور عند التمرير (Scroll Animations)
       ======================================== */
    
    // إعدادات مراقب العناصر (Intersection Observer)
    const observerOptions = {
        threshold: 0.1, // تفعيل عندما يظهر 10% من العنصر
        rootMargin: '0px 0px -50px 0px' // هامش أسفل العنصر
    };

    // إنشاء مراقب للعناصر
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                // إظهار العنصر عند دخوله مجال الرؤية
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // إيقاف المراقبة بعد الظهور
            }
        });
    }, observerOptions);

    // تطبيق الأنيميشن على العناصر المستهدفة
    document.querySelectorAll('.book-card, .categories-list, .authors-section').forEach(el => {
        el.style.opacity = '0'; // بدء مخفي
        el.style.transform = 'translateY(30px)'; // بدء منزاح للأسفل
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; // حركة ناعمة
        observer.observe(el); // بدء المراقبة
    });
});

/* ========================================
   🎨 10. إضافة Keyframes ديناميكية للأنيميشن
   ======================================== */

// إنشاء عنصر style لإضافة أنيميشن إضافية
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    .bx-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
/* ========================================
   🦶 الفوتر وزر الصعود للأعلى
   ======================================== */

// تحديث السنة تلقائياً
const currentYearEl = document.getElementById('currentYear');
if(currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
}

// زر الصعود للأعلى
const scrollToTopBtn = document.getElementById('scrollToTop');

if(scrollToTopBtn) {
    // إظهار/إخفاء الزر عند التمرير
    window.addEventListener('scroll', () => {
        if(window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('active');
        } else {
            scrollToTopBtn.classList.remove('active');
        }
    });

    // الصعود للأعلى عند النقر
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}