/* ========================================
   📚 دار سامي — مكتبتي
   ----------------------------------------
   ⚠️ الهيدر · القائمة · الفوتر · الحالات ·
      كرت الكتاب  →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):
     GET    /api/my/library?shelf=
     POST   /api/my/library          { book_id, shelf }
     DELETE /api/my/library/{book_id}?shelf=
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- حماية الصفحة ---------- */

    if (!isLoggedIn()) {
        window.location.href =
            `/login.html?redirect=${encodeURIComponent(location.pathname)}`;
        return;
    }

    const tabsWrap = document.getElementById("shelfTabs");
    const grid     = document.getElementById("shelfBooks");

    /* ثلاثة رفوف مرئية فقط — تمثّل رحلة القراءة:
       أنوي → أقرأ → أنهيت.
       القاعدة تدعم favorite و downloaded، لكنهما ليسا
       رفّين بل حالتين: المفضّلة قلبٌ على الكرت،
       والمحمّلة تُملأ تلقائياً عند التنزيل. */
    const SHELVES = {
        want_to_read: "للقراءة لاحقاً",
        reading:      "أقرأ حالياً",
        read:         "أنهيتُه",
    };

    const EMPTY_TEXT = {
        want_to_read: "لم تحفظي كتاباً للقراءة بعد",
        reading:      "لا تقرئين كتاباً حالياً",
        read:         "لم تُنهي أي كتاب بعد",
    };

    let currentShelf = "want_to_read";
    const cache = {};   // shelf → books[]


    /* ========================================
       📥 تحميل رف
       ======================================== */

    async function loadShelf(shelf) {
        if (!grid) return;

        showLoading(grid, 4);

        try {
            const res   = await apiGet(`/my/library?shelf=${shelf}`);
            const books = res.data || [];

            cache[shelf] = books;
            showShelf(books, shelf);

        } catch (error) {
            console.error("Error loading shelf:", error);

            if (error.status === 401) {
                localStorage.removeItem("auth_token");
                window.location.href =
                    `/login.html?redirect=${encodeURIComponent(location.pathname)}`;
                return;
            }

            showError(grid, () => loadShelf(shelf), "تعذّر تحميل مكتبتك");
        }
    }


    /* ========================================
       🎨 العرض
       ======================================== */

    /** يعرض رفّاً من الذاكرة: العدّاد ثم الكتب أو الحالة الفارغة */
    function showShelf(books, shelf) {
        updateCount(shelf, books.length);

        if (books.length === 0) {
            showEmpty(
                grid,
                EMPTY_TEXT[shelf] || "لا كتب هنا",
                "bx-bookmark",
                `<a href="/library.html" class="btn-retry">
                    <i class='bx bx-book-open'></i> تصفّحي المكتبة
                 </a>`
            );
            return;
        }

        render(books, shelf);
    }


    function render(books, shelf) {
        grid.innerHTML = books.map(book => {
            const slug = book.slug || book.id;

            const options = Object.entries(SHELVES).map(([key, label]) =>
                `<option value="${key}"${key === shelf ? " selected" : ""}>${label}</option>`
            ).join("");

            return `
                <div class="ml-card" data-book="${escapeAttr(slug)}" data-id="${book.id}">
                    ${renderBookCard(book)}
                    <button class="btn-fav${book.is_favorite ? " on" : ""}"
                            title="${book.is_favorite ? "إزالة من المفضّلة" : "إضافة للمفضّلة"}"
                            type="button">
                        <i class='bx ${book.is_favorite ? "bxs-heart" : "bx-heart"}'></i>
                    </button>
                    <div class="card-tools">
                        <select class="shelf-select" aria-label="نقل إلى رف آخر">
                            ${options}
                        </select>
                        <button class="btn-remove" title="إزالة من مكتبتي" type="button">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        bindCardTools(shelf);
    }


    /* ========================================
       🔧 نقل وإزالة
       ======================================== */

    function bindCardTools(shelf) {

        /* ---------- نقل إلى رف آخر ---------- */
        grid.querySelectorAll(".shelf-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const card   = e.target.closest(".ml-card");
                const bookId = card?.dataset.id;
                const target = e.target.value;

                if (!bookId || target === shelf) return;

                card.style.opacity = ".5";

                try {
                    // الرف حالة واحدة — النقل تحديث لا إضافة.
                    // لو أضفنا ثم حذفنا لظهر الكتاب في رفّين لحظياً.
                    await apiPut("/my/library", { book_id: bookId, shelf: target });

                    // ننقل الكتاب داخل الذاكرة بدل إعادة جلبه.
                    // أسرع، ويجعل النقل يظهر فوراً في الرف الهدف.
                    const book = (cache[shelf] || []).find(b => String(b.id) === bookId);
                    if (book) {
                        book.shelf = target;
                        cache[target] = [...(cache[target] || []), book];
                    }

                    removeCard(card, shelf);
                    bumpCount(target, +1);

                } catch (error) {
                    console.error("Error moving book:", error);
                    alert("تعذّر نقل الكتاب");
                    e.target.value = shelf;
                    card.style.opacity = "1";
                }
            });
        });

        /* ---------- المفضّلة ---------- */
        grid.querySelectorAll(".btn-fav").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const card   = btn.closest(".ml-card");
                const bookId = card?.dataset.id;
                if (!bookId) return;

                const wasOn = btn.classList.contains("on");

                // تحديث فوري ثم إرسال — النقر على قلب يجب أن يستجيب حالاً
                setFav(btn, !wasOn);

                try {
                    // مستقلّ عن الرف — لا يُغيّر مكان الكتاب
                    await apiPut(`/my/library/${bookId}/favorite`, { is_favorite: !wasOn });

                    const book = (cache[shelf] || []).find(b => String(b.id) === bookId);
                    if (book) book.is_favorite = !wasOn;

                } catch (error) {
                    console.error("Error toggling favorite:", error);
                    setFav(btn, wasOn);   // تراجع
                }
            });
        });

        /* ---------- إزالة ---------- */
        grid.querySelectorAll(".btn-remove").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const card   = e.target.closest(".ml-card");
                const bookId = card?.dataset.id;
                if (!bookId) return;

                if (!confirm("إزالة هذا الكتاب من مكتبتك؟")) return;

                card.style.opacity = ".5";

                try {
                    await apiDelete(`/my/library/${bookId}`);
                    removeCard(card, shelf);
                    // نُزيله من كل الرفوف في الذاكرة — حُذف من المكتبة كلياً
                    Object.keys(cache).forEach(k => {
                        cache[k] = (cache[k] || []).filter(b => String(b.id) !== bookId);
                    });

                } catch (error) {
                    console.error("Error removing book:", error);
                    alert("تعذّر إزالة الكتاب");
                    card.style.opacity = "1";
                }
            });
        });
    }

    function setFav(btn, on) {
        btn.classList.toggle("on", on);
        btn.title = on ? "إزالة من المفضّلة" : "إضافة للمفضّلة";
        const icon = btn.querySelector("i");
        if (icon) icon.className = on ? "bx bxs-heart" : "bx bx-heart";
    }

    function removeCard(card, shelf) {
        card.remove();

        cache[shelf] = (cache[shelf] || []).filter(
            b => String(b.id) !== card.dataset.id
        );

        updateCount(shelf, cache[shelf].length);

        if (grid.children.length === 0) {
            showEmpty(
                grid,
                EMPTY_TEXT[shelf] || "لا كتب هنا",
                "bx-bookmark",
                `<a href="/library.html" class="btn-retry">
                    <i class='bx bx-book-open'></i> تصفّحي المكتبة
                 </a>`
            );
        }
    }


    /* ========================================
       🔢 العدّادات
       ======================================== */

    function updateCount(shelf, n) {
        const el = document.querySelector(`[data-count="${shelf}"]`);
        if (el) el.textContent = n;
    }

    function bumpCount(shelf, delta) {
        const el = document.querySelector(`[data-count="${shelf}"]`);
        if (!el) return;
        const next = Math.max(0, (parseInt(el.textContent, 10) || 0) + delta);
        el.textContent = next;
    }


    /* ========================================
       🗂️ التبويبات
       ======================================== */

    tabsWrap?.querySelectorAll(".shelf-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const shelf = tab.dataset.shelf;
            if (shelf === currentShelf) return;

            tabsWrap.querySelectorAll(".shelf-tab")
                    .forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            currentShelf = shelf;

            // نستعمل النسخة المحفوظة إن وُجدت — تنقّل فوري بلا انتظار
            if (cache[shelf]) {
                showShelf(cache[shelf], shelf);
            } else {
                loadShelf(shelf);
            }
        });
    });


    /* ========================================
       🔢 تعبئة كل العدّادات في الخلفية
       ----------------------------------------
       نطلب بقية الرفوف بهدوء بعد تحميل الأول،
       حتى تظهر الأرقام على التبويبات فوراً.
       ======================================== */

    async function preloadCounts() {
        for (const shelf of Object.keys(SHELVES)) {
            if (shelf === currentShelf || cache[shelf]) continue;
            try {
                const res = await apiGet(`/my/library?shelf=${shelf}`);
                cache[shelf] = res.data || [];
                updateCount(shelf, cache[shelf].length);
            } catch {
                /* العدّاد ميزة إضافية — لا نُظهر خطأً من أجله */
            }
        }
    }


    /* ---------- التشغيل ---------- */

    loadShelf(currentShelf).then(preloadCounts);
});