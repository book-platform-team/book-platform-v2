/* ========================================
   👤 دار سامي — صفحة المؤلف
   ----------------------------------------
   ⚠️ الهيدر · القائمة · الفوتر · الحالات ·
      كرت الكتاب · observeReveals  →  partials.js
   ----------------------------------------
   العقد (API.md):  GET /api/authors/{slug}
     { id, name, slug, bio, photo, nationality,
       birth_year, death_year, is_house_author,
       books_count, books: [BookCard] }
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

        const badge = a.is_house_author
            ? `<span class="ap-badge"><i class='bx bx-check-shield'></i> مؤلف الدار</span>`
            : "";

        // سنوات الميلاد والوفاة — تُعرض فقط إن وُجدت
        const years = a.birth_year
            ? `<span><i class='bx bx-calendar'></i>
                 ${a.birth_year}${a.death_year ? ` — ${a.death_year}` : ""}
               </span>`
            : "";

        const nationality = a.nationality
            ? `<span><i class='bx bx-map'></i> ${escapeText(a.nationality)}</span>`
            : "";

        head.innerHTML = `
            <div class="ap-photo reveal">${photo}</div>

            <div class="ap-meta reveal" style="--d:.08s">
                <h1 class="ap-name">${escapeText(a.name)}</h1>

                <div class="ap-sub">
                    ${nationality}
                    ${years}
                    ${badge}
                </div>

                <div class="ap-stats">
                    <div class="ap-stat">
                        <b>${Number(a.books_count ?? 0).toLocaleString("ar-DZ")}</b>
                        <span>كتاب في المكتبة</span>
                    </div>
                    <div class="ap-stat">
                        <b>${Number(a.rating ?? 0).toFixed(1)}</b>
                        <span>متوسط التقييم</span>
                    </div>
                </div>
            </div>
        `;
    }


    /* ========================================
       📖 النبذة
       ======================================== */

    function renderBio(a) {
        // لا نعرض القسم أصلاً إن لم تكن هناك نبذة —
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