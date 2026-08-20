/* ========================================
   👤 دار سامي — صفحة المؤلف
   ----------------------------------------
   ⚠️ الهيدر · القائمة · الفوتر · الحالات ·
      كرت الكتاب · observeReveals  →  partials.js
   ----------------------------------------
   العقد (API.md):  GET /api/authors/{slug}
     { id, name, slug, title, bio, photo,
       books_count, books: [BookCard] }
   ----------------------------------------
   ⚠️ ما يُعرض هنا محكوم بما تجمعه استمارة النشر:

     يُعرض   الاسم · الرتبة العلمية · الصورة ·
             السيرة الذاتية · الكتب

     لا يُعرض البريد · الهاتف · العنوان ·
             «معلومات أخرى» — كلّها للدار وحدها

   وحُذف من هنا ما كان يُعرض ولا يُجمَع أصلاً:
   التقييم (ألغاه العميل)، وسنة الميلاد والوفاة
   والجنسية (لا تُسأل في الاستمارة). عرض حقلٍ
   فارغ دائماً أسوأ من غيابه.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const head        = document.getElementById("authorHead");
    const booksGrid   = document.getElementById("authorBooks");
    const bioSection  = document.getElementById("bioSection");
    const bioBox      = document.getElementById("authorBio");
    const crumbName   = document.getElementById("crumbName");

    const params = new URLSearchParams(window.location.search);
    const ref    = params.get("slug") || params.get("id");


    /* ---------- بلا معرّف ---------- */

    if (!ref) {
        if (crumbName) crumbName.textContent = "غير محدّد";
        showEmpty(
            head,
            "لم يتم تحديد المؤلف",
            "bx-user-x",
            `<a href="/author.html" class="btn-retry">
                <i class='bx bx-arrow-back'></i> عودة إلى المؤلفين
             </a>`
        );
        booksGrid?.remove();
        return;
    }


    /* ========================================
       📥 التحميل
       ======================================== */

    async function loadAuthor() {
        showLoading(head, 1, "row");
        showLoading(booksGrid, 4);

        try {
            const res    = await apiGet(`/authors/${ref}`);
            const author = res.data;
            if (!author) throw new Error("رد فارغ");

            renderHead(author);
            renderBio(author);
            renderBooks(author.books || []);

            document.title = `${author.name} - مكتبة سامي الرقمية`;

            // وسوم المشاركة — الخادم يولّدها نهائياً (انظري API.md)
            const desc = (author.bio || `كتب ${author.name} في مكتبة سامي الرقمية`)
                            .slice(0, 155).trim();
            document.querySelector('meta[name="description"]')?.setAttribute("content", desc);
            document.querySelector('meta[property="og:title"]')?.setAttribute("content", author.name);
            document.querySelector('meta[property="og:description"]')?.setAttribute("content", desc);
            document.querySelector('meta[property="og:url"]')?.setAttribute("content", location.href);
            document.querySelector('link[rel="canonical"]')?.setAttribute("href", location.href);

            observeReveals();

        } catch (error) {
            console.error("Error loading author:", error);

            if (crumbName) crumbName.textContent = "خطأ";

            if (error.status === 404) {
                showEmpty(
                    head,
                    "هذا المؤلف غير موجود",
                    "bx-user-x",
                    `<a href="/author.html" class="btn-retry">
                        <i class='bx bx-arrow-back'></i> عودة إلى المؤلفين
                     </a>`
                );
                booksGrid?.closest("section")?.remove();
            } else {
                showError(head, loadAuthor, "تعذّر تحميل بيانات المؤلف");
                booksGrid?.closest("section")?.remove();
            }
        }
    }


    /* ========================================
       🎨 الرأس
       ======================================== */

    function renderHead(a) {
        if (crumbName) crumbName.textContent = a.name;
        if (!head) return;

        const photo = a.photo
            ? `<img src="${escapeAttr(a.photo)}" alt="${escapeAttr(a.name)}">`
            : escapeText((a.name || "؟").charAt(0));

        /* الرتبة العلمية تُجمع في الخطوة الأولى ولم
           تكن تظهر في صفحته إطلاقاً — بيانات تُطلب
           من المؤلف ثم لا تُستعمل. */
        const rank = rankLabel(a.title);

        const books = Number(a.books_count ?? (a.books || []).length) || 0;

        /* الأقسام تُشتقّ من كتبه لا من حقلٍ مستقلّ —
           فهي دائماً صادقة، ولا تحتاج أن يملأها أحد */
        const cats = [...new Map(
            (a.books || [])
                .filter(b => b.category?.slug)
                .map(b => [b.category.slug, b.category.name])
        )];

        head.innerHTML = `
            <div class="ap-photo reveal">${photo}</div>

            <div class="ap-meta reveal" style="--d:.08s">
                ${rank ? `<span class="ap-rank">${escapeText(rank)}</span>` : ""}

                <h1 class="ap-name">${escapeText(a.name)}</h1>

                <div class="ap-sub">
                    <span class="ap-count">
                        <i class='bx bx-book'></i>
                        ${arabize(books)} ${books === 1 ? "كتاب" : "كتب"} في المكتبة
                    </span>
                </div>

                ${cats.length ? `
                    <div class="ap-cats">
                        <span class="ap-cats-lead">يكتب في</span>
                        ${cats.map(([slug, name]) => `
                            <a href="/index.html?category=${encodeURIComponent(slug)}"
                               class="ap-cat">${escapeText(name)}</a>
                        `).join("")}
                    </div>` : ""}
            </div>
        `;
    }

    /** الرتبة العلمية كما تُختار في استمارة النشر */
    function rankLabel(t) {
        return { professor: "أستاذ", doctor: "دكتور", researcher: "باحث" }[t] || "";
    }

    function arabize(n) {
        return String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
    }


    /* ========================================
       📖 النبذة
       ======================================== */

    function renderBio(a) {
        // لا نعرض القسم أصلاً إن لم تكن هناك سيرة —
        // عنوان فوق فراغ أسوأ من غياب القسم.
        if (!a.bio || !bioBox || !bioSection) return;

        bioSection.hidden = false;
        bioBox.textContent = a.bio;
    }


    /* ========================================
       📚 الكتب
       ======================================== */

    function renderBooks(books) {
        if (!booksGrid) return;

        if (books.length === 0) {
            showEmpty(
                booksGrid,
                "لا توجد كتب منشورة لهذا المؤلف بعد",
                "bx-book-open"
            );
            return;
        }

        renderBookGrid(booksGrid, books);
    }


    /* ---------- التشغيل ---------- */

    loadAuthor();
});