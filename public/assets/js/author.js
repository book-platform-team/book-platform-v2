/* ========================================
   ✍️ مكتبة سامي الرقمية — صفحة المؤلفين
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة  →  كلها في partials.js
      لا تُكرَّر هنا.
   ----------------------------------------
   لا تقييم — أُزيل مع بقية أثر التقييمات.
   البطاقة رابط <a> لا <div> بحدث نقر: تعمل
   بلوحة المفاتيح، وتُفتح في تبويب جديد بالزرّ
   الأوسط، ويقرأها محرّك البحث.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const grid      = document.getElementById("authorsGrid");
    const countLine = document.getElementById("authorsCount");
    const noResults = document.getElementById("noResults");
    const noAuthors = document.getElementById("noAuthors");
    const loadError = document.getElementById("loadError");
    const searchBox = document.getElementById("authorSearchInput");
    const clearBtn  = document.getElementById("clearSearch");

    let allAuthors = [];

    if (!grid) return;


    /* ========================================
       📥 الجلب
       ======================================== */

    async function loadAuthors() {
        show(grid);
        hide(noResults, noAuthors, loadError, countLine);
        skeleton(10);

        try {
            // شكل الرد المتفق عليه في API.md: { success, data: [...] }
            const res  = await apiGet("/authors");
            const list = res.data || [];

            // ترتيب أبجدي عربي — المكتبة تُرتَّب، لا تُكوَّم
            allAuthors = list.slice().sort((a, b) =>
                String(a.name || "").localeCompare(String(b.name || ""), "ar"));

            if (allAuthors.length === 0) {
                grid.innerHTML = "";
                hide(grid);
                show(noAuthors);
                return;
            }

            apply();

        } catch (error) {
            console.error("Error loading authors:", error);
            grid.innerHTML = "";
            hide(grid);
            show(loadError);
        }
    }

    document.getElementById("retryBtn")?.addEventListener("click", loadAuthors);


    /* ========================================
       🔎 البحث
       ======================================== */

    function apply() {
        const q = (searchBox?.value || "").trim().toLowerCase();

        // البحث بالاسم وحده — الجنسية لم تعد تُجمَع
        const list = q
            ? allAuthors.filter(a => String(a.name || "").toLowerCase().includes(q))
            : allAuthors;

        render(list);
    }

    searchBox?.addEventListener("input", () => {
        if (clearBtn) clearBtn.hidden = !searchBox.value;
        apply();
    });

    clearBtn?.addEventListener("click", () => {
        if (!searchBox) return;
        searchBox.value = "";
        clearBtn.hidden = true;
        searchBox.focus();
        apply();
    });


    /* ========================================
       🎴 الرسم
       ----------------------------------------
       كل قيمة تمرّ على escapeText أو escapeAttr.
       أسماء المؤلفين ستأتي يوماً من استمارة نشر
       مفتوحة بلا حساب — أي من إدخال زائر.
       ======================================== */

    function render(list) {
        if (list.length === 0) {
            grid.innerHTML = "";
            hide(grid, countLine);
            show(noResults);
            return;
        }

        hide(noResults);
        show(grid);

        if (countLine) {
            countLine.textContent = `${arabize(list.length)} ${plural(list.length)}`;
            countLine.hidden = false;
        }

        grid.innerHTML = list.map((a, i) => card(a, i)).join("");
    }

    function card(a, i) {
        const name = String(a.name || "—");
        const href = `/author-profile.html?slug=${encodeURIComponent(a.slug || a.id)}`;

        const avatar = a.photo
            ? `<img src="${escapeAttr(a.photo)}" alt="${escapeAttr(name)}" loading="lazy">`
            : escapeText(name.trim().charAt(0) || "؟");

        /* الرتبة العلمية هي السطر التعريفي الآن.
           كانت الجنسية والسنوات، وقد حُذفتا لأنّ
           استمارة النشر لا تسألهما — فكان السطر
           يبقى فارغاً لكل مؤلف جديد. */
        const bits = [];
        const rank = { professor: "أستاذ", doctor: "دكتور", researcher: "باحث" }[a.title];
        if (rank) bits.push(escapeText(rank));

        const books = Number(a.books_count) || 0;

        return `
            <a class="au-card" href="${escapeAttr(href)}" style="--i:${i}">
                <span class="au-ava">${avatar}</span>
                <b class="au-name">${escapeText(name)}</b>
                ${bits.length ? `<span class="au-meta">${bits.join(" · ")}</span>` : ""}
                <span class="au-books">
                    <i class='bx bx-book'></i>
                    ${arabize(books)} ${books === 1 ? "كتاب" : "كتب"}
                </span>
            </a>
        `;
    }

    /* هياكل انتظار بشكل البطاقة نفسها — الانتقال من
       التحميل إلى المحتوى لا يقفز بالتخطيط */
    function skeleton(n) {
        grid.innerHTML = Array.from({ length: n }, (_, i) => `
            <div class="au-card skel" style="--i:${i}">
                <span class="au-ava"></span>
                <span class="sk-line w70"></span>
                <span class="sk-line w45"></span>
                <span class="sk-line pill"></span>
            </div>
        `).join("");
    }


    /* ---------- مساعدات ---------- */

    function show(...els) { els.forEach(e => { if (e) e.hidden = false; }); }
    function hide(...els) { els.forEach(e => { if (e) e.hidden = true;  }); }

    function arabize(n) {
        return String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
    }

    function plural(n) {
        if (n === 1) return "مؤلف";
        if (n === 2) return "مؤلفان";
        if (n <= 10) return "مؤلفين";
        return "مؤلفاً";
    }


    loadAuthors();
});