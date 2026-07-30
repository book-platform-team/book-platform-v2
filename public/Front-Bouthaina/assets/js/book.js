/* ========================================
   📖 مكتبة سامي الرقمية — صفحة تفاصيل الكتاب
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة  →  كلها في partials.js
   ----------------------------------------
   العقد (API.md) — الرد دائماً { success, data, meta? }
     GET  /api/books/{slug}
     GET  /api/books/{id}/reviews?page=
     POST /api/books/{id}/reviews      { content }
     GET  /api/books/{id}/quotes
     POST /api/books/{id}/quotes       { content, page }
     POST /api/books/{id}/rate         { value }
     GET  /api/books/{id}/similar?limit=4
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- معرّف الكتاب ---------- */

    const params  = new URLSearchParams(window.location.search);
    const bookRef = params.get("slug") || params.get("id");

    if (!bookRef) {
        const title = document.getElementById("bookTitle");
        if (title) title.textContent = "لم يتم تحديد الكتاب";
        return;
    }

    let bookId = bookRef;   // يُحدَّث بالمعرّف الرقمي بعد التحميل

    /* ---------- التشغيل ---------- */

    setupTabs();
    setupShareButtons();
    setupRatingInput();
    setupReviewForm();
    setupQuoteForm();
    setupCopyShortLink();

    loadBookDetails();


    /* ========================================
       📥 تفاصيل الكتاب
       ======================================== */

    async function loadBookDetails() {
        try {
            const res  = await apiGet(`/books/${bookRef}`);
            const book = res.data;
            if (!book) throw new Error("رد فارغ");

            bookId = book.id || bookRef;

            displayBookDetails(book);

            // البقية تعتمد على المعرّف الرقمي
            loadReviews(1);
            loadQuotes();
            loadSimilarBooks();

        } catch (error) {
            console.error("Error loading book:", error);
            setText("bookTitle", "تعذّر تحميل الكتاب");
            setText("bookDescription", "تحقّقي من الاتصال بالسيرفر");
        }
    }

    function displayBookDetails(book) {
        const author   = book.author   || {};
        const category = book.category || {};

        // الأساسيات
        setText("bookTitle",        book.title);
        setText("bookAuthor",       author.name || "—");
        setText("bookCategory",     category.name || "—");
        setText("bookYear",         book.publication_year || "—");
        setText("bookDescription",  book.description || "لا يوجد وصف");
        setText("sidebarBookTitle", book.title);

        // رابط المؤلف
        const authorLink = document.getElementById("bookAuthor");
        if (authorLink && author.slug) {
            authorLink.href = `/author-profile.html?slug=${author.slug}`;
        }

        // الغلاف
        const cover = book.cover || "https://placehold.co/300x450/7a0c16/ffffff?text=غلاف";
        setSrc("bookCover", cover);
        setSrc("sidebarBookCover", book.cover || "https://placehold.co/80x100/7a0c16/ffffff?text=غلاف");

        // الإحصائيات
        setText("downloadCount",    formatNumber(book.downloads_count));
        setText("viewsCount",       formatNumber(book.views_count));
        setText("ratingsStatCount", formatNumber(book.ratings_count));

        // التقييم
        displayRating(book.ratings_avg, book.ratings_count);
        displayRatingInfo(book.ratings_avg, book.ratings_count);
        if (book.my_rating) highlightStars(book.my_rating);

        // الجدول التفصيلي
        setText("bookTitleInfo",       book.title);
        setText("bookAuthorInfo",      author.name || "—");
        setText("bookLanguageInfo",    languageLabel(book.language));
        setText("bookTypeInfo",        typeLabel(book.publication_type));
        setText("bookPublishDateInfo", book.publication_year || "—");
        setText("bookEditionInfo",     book.edition || "—");
        setText("bookPagesInfo",       book.pages || "—");
        setText("bookIsbnInfo",        book.isbn  || "—");

        const categoryLink = document.getElementById("categoryLink");
        if (categoryLink) {
            categoryLink.textContent = category.name || "—";
            if (category.slug) categoryLink.href = `/library.html?category=${category.slug}`;
        }

        // الملفات
        const file = (book.files || [])[0];
        setText("bookFileSizeInfo", file?.size_human || "—");
        setText("bookFileTypeInfo", file ? file.type.toUpperCase() : "—");

        // الرابط
        const shortLink = document.getElementById("shortLinkInput");
        if (shortLink) {
            shortLink.value = `${window.location.origin}/book.html?slug=${book.slug || bookId}`;
        }

        // زر التنزيل
        const downloadBtn = document.getElementById("downloadBtn");
        if (downloadBtn) {
            if (file) {
                downloadBtn.addEventListener("click", () => {
                    window.location.href = `/api/books/${bookId}/download/${file.id}`;
                });
            } else {
                downloadBtn.disabled = true;
                downloadBtn.innerHTML = `<i class='bx bx-x'></i><span>غير متوفر للتنزيل</span>`;
            }
        }
    }


    /* ========================================
       ⭐ عرض التقييم
       ======================================== */

    function starsHTML(average) {
        const avg  = Number(average) || 0;
        const full = Math.floor(avg);
        const half = avg % 1 >= 0.5;
        let html = "";

        for (let i = 1; i <= 5; i++) {
            if (i <= full)                    html += `<i class='bx bxs-star'></i>`;
            else if (i === full + 1 && half)  html += `<i class='bx bxs-star-half'></i>`;
            else                              html += `<i class='bx bx-star'></i>`;
        }
        return html;
    }

    function displayRating(average, count) {
        const display = document.getElementById("starsDisplay");
        if (display) display.innerHTML = starsHTML(average);

        setText("ratingValue", (Number(average) || 0).toFixed(1));
        setText("ratingCount", `(${formatNumber(count)} تقييم)`);
    }

    function displayRatingInfo(average, count) {
        const el = document.getElementById("bookRatingInfo");
        if (!el) return;
        el.innerHTML = starsHTML(average) +
            `<span class="rating-text">(${formatNumber(count)})</span>`;
    }

    function highlightStars(rating) {
        document.querySelectorAll("#starsInput i").forEach(star => {
            const v = parseInt(star.dataset.rating, 10);
            star.className = v <= rating ? "bx bxs-star active" : "bx bx-star";
        });
    }


    /* ========================================
       ⭐ إرسال تقييم
       ======================================== */

    function setupRatingInput() {
        const stars = document.querySelectorAll("#starsInput i");

        stars.forEach(star => {
            star.addEventListener("mouseenter", function () {
                highlightStars(parseInt(this.dataset.rating, 10));
            });

            star.addEventListener("click", async function () {
                if (!requireLogin("لتقييم الكتاب")) return;

                const value = parseInt(this.dataset.rating, 10);

                try {
                    const res = await apiPost(`/books/${bookId}/rate`, { value });
                    const d   = res.data || {};

                    displayRating(d.ratings_avg, d.ratings_count);
                    displayRatingInfo(d.ratings_avg, d.ratings_count);
                    highlightStars(d.my_rating || value);
                    setText("ratingsStatCount", formatNumber(d.ratings_count));

                } catch (error) {
                    console.error("Error submitting rating:", error);
                    alert("تعذّر حفظ التقييم");
                }
            });
        });
    }


    /* ========================================
       💬 المراجعات
       ======================================== */

    async function loadReviews(page = 1) {
        const list = document.getElementById("reviewsList");
        if (!list) return;

        if (page === 1) {
            list.innerHTML = `<div class="loading-authors"><i class='bx bx-loader-alt bx-spin'></i><p>جارٍ تحميل المراجعات...</p></div>`;
        }

        try {
            const res     = await apiGet(`/books/${bookId}/reviews?page=${page}`);
            const reviews = res.data || [];
            const meta    = res.meta || {};

            if (page === 1) list.innerHTML = "";

            if (reviews.length === 0 && page === 1) {
                list.innerHTML = `<p class="no-reviews">لا توجد مراجعات بعد. كوني أول من يراجع</p>`;
                setText("reviewsCount", "0");
                return;
            }

            reviews.forEach(r => list.appendChild(createReviewElement(r)));
            setText("reviewsCount", formatNumber(meta.total ?? reviews.length));

            const more = document.getElementById("loadMoreReviews");
            if (more) {
                if (meta.current_page < meta.last_page) {
                    more.style.display = "block";
                    more.onclick = () => loadReviews(page + 1);
                } else {
                    more.style.display = "none";
                }
            }

        } catch (error) {
            console.error("Error loading reviews:", error);
            list.innerHTML = `<p class="error">تعذّر تحميل المراجعات</p>`;
        }
    }

    function createReviewElement(review) {
        const div  = document.createElement("div");
        div.className = "review-item";

        const user   = review.user || {};
        const avatar = user.avatar
            ? `<img src="${escapeHTML(user.avatar)}" alt="${escapeHTML(user.name)}">`
            : `<span>${escapeHTML((user.name || "م").charAt(0))}</span>`;

        div.innerHTML = `
            <div class="reviewer-info">
                <div class="reviewer-avatar">${avatar}</div>
                <div class="reviewer-details">
                    <h4 class="reviewer-name">${escapeHTML(user.name || "مستخدم")}</h4>
                    <div class="review-rating">${starsHTML(review.rating)}</div>
                </div>
                <span class="review-date">${formatDate(review.created_at)}</span>
            </div>
            <p class="review-text">${escapeHTML(review.content || "")}</p>
            <div class="review-actions">
                <button class="btn-helpful" data-review="${review.id}">
                    <i class='bx bx-like'></i> مفيد (${review.helpful_count || 0})
                </button>
            </div>
        `;

        div.querySelector(".btn-helpful")?.addEventListener("click", async (e) => {
            if (!requireLogin("للتصويت")) return;
            const btn = e.currentTarget;
            try {
                const res = await apiPost(`/reviews/${review.id}/helpful`, {});
                btn.innerHTML = `<i class='bx bxs-like'></i> مفيد (${res.data?.helpful_count ?? "+1"})`;
                btn.disabled = true;
            } catch {
                alert("تعذّر التصويت");
            }
        });

        return div;
    }

    function setupReviewForm() {
        const btn = document.getElementById("submitReview");

        btn?.addEventListener("click", async () => {
            const input   = document.getElementById("reviewText");
            const content = input?.value.trim();

            if (!content) { alert("الرجاء كتابة مراجعة"); input?.focus(); return; }
            if (!requireLogin("لإضافة مراجعة")) return;

            const original = btn.innerHTML;
            btn.disabled  = true;
            btn.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> جاري الإرسال...`;

            try {
                await apiPost(`/books/${bookId}/reviews`, { content });

                if (input) input.value = "";
                // ⚠️ لا نضيفها للقائمة — المراجعة تنتظر موافقة الإدارة
                alert("شكراً لك، ستظهر مراجعتك بعد موافقة الإدارة");

            } catch (error) {
                console.error("Error submitting review:", error);
                alert("تعذّر إرسال المراجعة");
            } finally {
                btn.disabled  = false;
                btn.innerHTML = original;
            }
        });
    }


    /* ========================================
       💭 الاقتباسات
       ======================================== */

    async function loadQuotes() {
        const list = document.getElementById("quotesList");
        if (!list) return;

        try {
            const res    = await apiGet(`/books/${bookId}/quotes`);
            const quotes = res.data || [];

            list.innerHTML = "";

            if (quotes.length === 0) {
                list.innerHTML = `<p class="no-quotes">لا توجد اقتباسات بعد. شاركينا اقتباسك المفضل</p>`;
                setText("quotesCount", "0");
                return;
            }

            quotes.forEach(q => list.appendChild(createQuoteElement(q)));
            setText("quotesCount", formatNumber(quotes.length));

        } catch (error) {
            console.error("Error loading quotes:", error);
            list.innerHTML = `<p class="error">تعذّر تحميل الاقتباسات</p>`;
        }
    }

    function createQuoteElement(quote) {
        const div = document.createElement("div");
        div.className = "quote-item";

        const user = quote.user || {};
        const page = quote.page ? ` — ص ${quote.page}` : "";

        div.innerHTML = `
            <div class="quote-content">
                <i class='bx bxs-quote-alt-right quote-icon'></i>
                <p class="quote-text">${escapeHTML(quote.content || "")}</p>
            </div>
            <div class="quote-footer">
                <span class="quote-author">— ${escapeHTML(user.name || "مستخدم")}${page}</span>
            </div>
            <div class="quote-actions">
                <button class="btn-copy-quote"><i class='bx bx-copy'></i> نسخ</button>
            </div>
        `;

        div.querySelector(".btn-copy-quote")?.addEventListener("click", (e) => {
            navigator.clipboard.writeText(quote.content || "").then(() => {
                const btn = e.currentTarget;
                btn.innerHTML = `<i class='bx bx-check'></i> تم النسخ`;
                setTimeout(() => { btn.innerHTML = `<i class='bx bx-copy'></i> نسخ`; }, 2000);
            });
        });

        return div;
    }

    function setupQuoteForm() {
        const btn = document.getElementById("submitQuote");

        btn?.addEventListener("click", async () => {
            const input    = document.getElementById("quoteText");
            const pageInput = document.getElementById("quotePage");
            const content  = input?.value.trim();

            if (!content) { alert("الرجاء كتابة اقتباس"); input?.focus(); return; }
            if (!requireLogin("لإضافة اقتباس")) return;

            const original = btn.innerHTML;
            btn.disabled  = true;
            btn.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> جاري الإرسال...`;

            try {
                const page = pageInput?.value ? parseInt(pageInput.value, 10) : null;
                await apiPost(`/books/${bookId}/quotes`, { content, page });

                if (input) input.value = "";
                if (pageInput) pageInput.value = "";
                alert("شكراً لك، سيظهر اقتباسك بعد موافقة الإدارة");

            } catch (error) {
                console.error("Error submitting quote:", error);
                alert("تعذّر إرسال الاقتباس");
            } finally {
                btn.disabled  = false;
                btn.innerHTML = original;
            }
        });
    }


    /* ========================================
       📚 كتب مشابهة
       ======================================== */

    async function loadSimilarBooks() {
        const grid = document.getElementById("similarBooksGrid");
        if (!grid) return;

        try {
            const res   = await apiGet(`/books/${bookId}/similar?limit=4`);
            const books = res.data || [];

            grid.innerHTML = "";

            if (books.length === 0) {
                grid.innerHTML = `<p class="no-similar">لا توجد كتب مشابهة حالياً</p>`;
                return;
            }

            books.forEach(book => {
                const card = document.createElement("div");
                card.className = "similar-book-card";

                const cover = book.cover || "https://placehold.co/150x220/7a0c16/ffffff?text=كتاب";
                const author = book.author || {};

                card.innerHTML = `
                    <img src="${escapeHTML(cover)}" alt="${escapeHTML(book.title)}" loading="lazy">
                    <h4>${escapeHTML(book.title)}</h4>
                    <p>${escapeHTML(author.name || "")}</p>
                    <div class="book-rating-small">
                        <i class='bx bxs-star'></i>
                        <span>${(Number(book.ratings_avg) || 0).toFixed(1)}</span>
                    </div>
                `;

                card.addEventListener("click", () => {
                    window.location.href = `/book.html?slug=${book.slug || book.id}`;
                });

                grid.appendChild(card);
            });

        } catch (error) {
            console.error("Error loading similar books:", error);
            grid.innerHTML = `<p class="error">تعذّر تحميل الكتب المشابهة</p>`;
        }
    }


    /* ========================================
       📑 التبويبات
       ======================================== */

    function setupTabs() {
        const btns     = document.querySelectorAll(".tab-btn");
        const contents = document.querySelectorAll(".tab-content");

        btns.forEach(btn => {
            btn.addEventListener("click", () => {
                const tabId = btn.dataset.tab;

                btns.forEach(b => b.classList.remove("active"));
                contents.forEach(c => c.classList.remove("active"));

                btn.classList.add("active");
                document.getElementById(tabId + "Tab")?.classList.add("active");
            });
        });
    }


    /* ========================================
       🔗 المشاركة والنسخ
       ======================================== */

    function setupShareButtons() {
        const url = () => window.location.href;
        const title = () => document.getElementById("bookTitle")?.textContent || "كتاب";

        openInPopup("shareFacebook", () =>
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`);

        openInPopup("shareTwitter", () =>
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title())}&url=${encodeURIComponent(url())}`);

        openInPopup("shareWhatsApp", () =>
            `https://wa.me/?text=${encodeURIComponent(title() + " - " + url())}`);

        openInPopup("shareTelegram", () =>
            `https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(title())}`);

        document.getElementById("copyLink")?.addEventListener("click", () => {
            navigator.clipboard.writeText(url()).then(() => alert("تم نسخ الرابط"));
        });
    }

    function openInPopup(id, buildUrl) {
        document.getElementById(id)?.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(buildUrl(), "_blank", "width=600,height=400");
        });
    }

    function setupCopyShortLink() {
        const btn   = document.getElementById("copyShortLinkBtn");
        const input = document.getElementById("shortLinkInput");

        btn?.addEventListener("click", () => {
            if (!input) return;
            navigator.clipboard.writeText(input.value).then(() => {
                const original = btn.innerHTML;
                btn.innerHTML = `<i class="bx bx-check"></i> تم النسخ`;
                setTimeout(() => { btn.innerHTML = original; }, 2000);
            });
        });
    }


    /* ========================================
       🔧 مساعدات
       ======================================== */

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? "—";
    }

    function setSrc(id, value) {
        const el = document.getElementById(id);
        if (el && value) el.src = value;
    }

    function formatNumber(n) {
        return (Number(n) || 0).toLocaleString("ar-DZ");
    }

    function formatDate(value) {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("ar-DZ", {
            year: "numeric", month: "long", day: "numeric"
        });
    }

    function languageLabel(code) {
        const map = { ar: "العربية", en: "الإنجليزية", fr: "الفرنسية" };
        return map[code] || code || "العربية";
    }

    function typeLabel(type) {
        if (type === "house_edition")     return "من إصدارات الدار";
        if (type === "author_submission") return "نشر مؤلف";
        return "—";
    }

    function requireLogin(action) {
        if (isLoggedIn()) return true;
        alert(`يجب تسجيل الدخول ${action}`);
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return false;
    }

    /* حماية من XSS في المحتوى القادم من المستخدمين */
    function escapeHTML(str) {
        return String(str ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[ch]));
    }
});