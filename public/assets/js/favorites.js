/* ========================================
   ❤️ دار سامي — المفضّلة
   ----------------------------------------
   ⚠️ الهيدر · الفوتر · الحالات · كرت الكتاب ·
      دوال المفضّلة  →  كلها في partials.js
   ----------------------------------------
   لا حسابات: المعرّفات في localStorage،
   والبيانات تُجلب من /api/books.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const grid     = document.getElementById("favGrid");
    const bar      = document.getElementById("favBar");
    const summary  = document.getElementById("favSummary");
    const clearBtn = document.getElementById("clearAll");

    load();


    async function load() {
        const ids = getFavorites();

        if (ids.length === 0) {
            showEmptyState();
            return;
        }

        showLoading(grid, Math.min(ids.length, 6));

        try {
            // نجلب كل الكتب مرّة واحدة ثم نُرشّح محلياً —
            // أبسط من endpoint خاص، ومقبول بحجم مكتبة الدار.
            const res   = await apiGet("/books?per_page=48");
            const books = (res.data || []).filter(b => ids.includes(String(b.id)));

            if (books.length === 0) {
                // المعرّفات موجودة لكن الكتب لم تعد منشورة
                showEmpty(
                    grid,
                    "الكتب المحفوظة لم تعد متاحة",
                    "bx-heart",
                    `<a href="/index.html" class="btn-retry">
                        <i class='bx bx-book-open'></i> تصفّحي المكتبة
                     </a>`
                );
                if (bar) bar.hidden = true;
                return;
            }

            renderBookGrid(grid, books);
            showBar(books.length);

            // إزالة كتاب من هنا تعني اختفاء بطاقته فوراً
            grid.addEventListener("click", onCardClick);

        } catch (error) {
            console.error("Error loading favorites:", error);
            showError(grid, load, "تعذّر تحميل المفضّلة");
            if (bar) bar.hidden = true;
        }
    }


    /* الكرت المشترك يتكفّل بالتبديل — نتابع النتيجة
       لنزيل البطاقة عند إلغاء التفضيل في هذه الصفحة. */
    function onCardClick(e) {
        const btn = e.target.closest(".card-fav");
        if (!btn) return;

        setTimeout(() => {
            if (btn.classList.contains("on")) return;   // أُعيد التفضيل

            const card = btn.closest(".book-card");
            card?.remove();

            const left = grid.querySelectorAll(".book-card").length;
            left === 0 ? showEmptyState() : showBar(left);
        }, 0);
    }


    function showBar(n) {
        if (!bar || !summary) return;
        bar.hidden = false;
        summary.textContent = `${n.toLocaleString("ar-DZ")} ${n === 1 ? "كتاب" : "كتاباً"}`;
    }


    function showEmptyState() {
        showEmpty(
            grid,
            "لم تحفظي أي كتاب بعد",
            "bx-heart",
            `<a href="/index.html" class="btn-retry">
                <i class='bx bx-book-open'></i> تصفّحي المكتبة
             </a>`
        );
        if (bar) bar.hidden = true;
    }


    clearBtn?.addEventListener("click", () => {
        if (!confirm("مسح كل المفضّلة؟")) return;

        try {
            localStorage.removeItem("sami_favorites");
        } catch { /* التخزين معطّل */ }

        paintFavCount();
        showEmptyState();
    });
});
