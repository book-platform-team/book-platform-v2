/* ========================================
   🔔 دار سامي — الإشعارات
   ----------------------------------------
   ⚠️ الهيدر · القائمة · الفوتر · الحالات
      →  كلها في partials.js
   ----------------------------------------
   العقد (API.md):
     GET  /api/notifications?page=
     POST /api/notifications/{id}/read
     POST /api/notifications/read-all
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- حماية الصفحة ---------- */

    if (!isLoggedIn()) {
        window.location.href =
            `/login.html?redirect=${encodeURIComponent(location.pathname)}`;
        return;
    }

    const list       = document.getElementById("notificationsList");
    const markAllBtn = document.getElementById("markAllBtn");
    const loadMore   = document.getElementById("loadMoreBtn");

    let page = 1;


    /* ---------- شكل كل نوع إشعار ---------- */

    const TYPES = {
        BookApproved:     { icon: "bx-check-circle",  cls: "approved" },
        BookRejected:     { icon: "bx-x-circle",      cls: "rejected" },
        NewReview:        { icon: "bx-message-rounded-dots", cls: "review" },
        NewBookSubmitted: { icon: "bx-upload",        cls: "review" },
    };


    /* ========================================
       📥 التحميل
       ======================================== */

    async function load(pageNum = 1) {
        if (!list) return;

        if (pageNum === 1) showLoading(list, 4, "row");

        try {
            const res   = await apiGet(`/notifications?page=${pageNum}`);
            const items = res.data || [];
            const meta  = res.meta || {};

            if (pageNum === 1) list.innerHTML = "";

            if (items.length === 0 && pageNum === 1) {
                showEmpty(list, "لا إشعارات بعد", "bx-bell");
                if (markAllBtn) markAllBtn.hidden = true;
                return;
            }

            items.forEach(n => list.appendChild(buildItem(n)));

            // زر "تعليم الكل" يظهر فقط إن وُجد غير مقروء
            const hasUnread = list.querySelector(".nt-item.unread");
            if (markAllBtn) markAllBtn.hidden = !hasUnread;

            if (loadMore) {
                const more = meta.current_page < meta.last_page;
                loadMore.hidden = !more;
                loadMore.onclick = () => load(pageNum + 1);
            }

            page = pageNum;

        } catch (error) {
            console.error("Error loading notifications:", error);

            if (error.status === 401) {
                localStorage.removeItem("auth_token");
                window.location.href =
                    `/login.html?redirect=${encodeURIComponent(location.pathname)}`;
                return;
            }

            showError(list, () => load(1), "تعذّر تحميل الإشعارات");
        }
    }


    /* ========================================
       🎨 بناء عنصر الإشعار
       ======================================== */

    function buildItem(n) {
        const meta   = TYPES[n.type] || { icon: "bx-bell", cls: "default" };
        const unread = !n.read_at && !readLocally().includes(n.id);

        const div = document.createElement("article");
        div.className = "nt-item" + (unread ? " unread" : "");
        div.dataset.id = n.id;

        // سبب الرفض يُبرَز — المؤلف يحتاج أن يفهم لماذا
        const reason = n.type === "BookRejected" && n.reason
            ? `<div class="nt-reason">
                   <b>السبب:</b> ${escapeText(n.reason)}
               </div>`
            : "";

        const link = n.link
            ? `<a href="${escapeAttr(n.link)}" class="nt-link">
                   عرض <i class='bx bx-chevron-left'></i>
               </a>`
            : "";

        div.innerHTML = `
            ${unread ? `<span class="nt-dot"></span>` : ""}
            <div class="nt-icon ${meta.cls}">
                <i class='bx ${meta.icon}'></i>
            </div>
            <div class="nt-body">
                <h3 class="nt-title">${escapeText(n.title || "إشعار")}</h3>
                <p class="nt-text">${escapeText(n.body || "")}</p>
                ${reason}
                <div class="nt-meta">
                    <span>${formatDate(n.created_at)}</span>
                    ${link}
                </div>
            </div>
        `;

        // النقر على الإشعار غير المقروء يعلّمه كمقروء
        if (unread) {
            div.addEventListener("click", (e) => {
                if (e.target.closest("a")) return;   // الرابط له سلوكه
                markRead(n.id, div);
            });
        }

        return div;
    }


    /* ========================================
       ✅ تعليم كمقروء
       ======================================== */

    async function markRead(id, el) {
        if (!el.classList.contains("unread")) return;   // نُقرئ مرة واحدة

        // نُحدّث الواجهة فوراً ثم نُرسل —
        // الانتظار لتغيير لون بطاقة يبدو بطيئاً بلا داعٍ.
        const dot = el.querySelector(".nt-dot");
        el.classList.remove("unread");
        dot?.remove();

        try {
            await apiPost(`/notifications/${id}/read`, {});
            bumpNotifCount(-1);   // معرّفة في partials.js — تُحفظ للجلسة
            markAsReadLocally(id);

            if (!list.querySelector(".nt-item.unread") && markAllBtn) {
                markAllBtn.hidden = true;
            }
        } catch (error) {
            console.error("Error marking as read:", error);
            // تراجع عن التحديث المتفائل
            el.classList.add("unread");
            if (dot) el.prepend(dot);
        }
    }


    /* ========================================
       💾 تذكّر ما قُرئ في هذه الجلسة
       ----------------------------------------
       ملفات الـmock ثابتة، والخادم قد يتأخّر في
       عكس التغيير. بدون هذا يعود الإشعار "غير مقروء"
       عند كل إعادة تحميل رغم أن المستخدم قرأه.
       ======================================== */

    const READ_KEY = "notif_read_ids";

    function readLocally() {
        try {
            return JSON.parse(sessionStorage.getItem(READ_KEY)) || [];
        } catch {
            return [];
        }
    }

    function markAsReadLocally(id) {
        const ids = readLocally();
        if (!ids.includes(id)) {
            ids.push(id);
            sessionStorage.setItem(READ_KEY, JSON.stringify(ids));
        }
    }

    function markAllReadLocally(ids) {
        sessionStorage.setItem(READ_KEY, JSON.stringify(ids));
    }

    markAllBtn?.addEventListener("click", async () => {
        const original = markAllBtn.innerHTML;
        markAllBtn.disabled  = true;
        markAllBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جارٍ...`;

        try {
            await apiPost("/notifications/read-all", {});

            const ids = [];
            list.querySelectorAll(".nt-item").forEach(el => {
                el.classList.remove("unread");
                el.querySelector(".nt-dot")?.remove();
                if (el.dataset.id) ids.push(el.dataset.id);
            });

            markAllReadLocally(ids);
            markAllBtn.hidden = true;
            setNotifCount(0);

        } catch (error) {
            console.error("Error marking all as read:", error);
            alert("تعذّر تعليم الإشعارات");
            markAllBtn.innerHTML = original;
            markAllBtn.disabled  = false;
        }
    });


    /* ---------- مساعد ---------- */

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        const diff = (Date.now() - date) / 1000;

        if (diff < 60)     return "الآن";
        if (diff < 3600)   return `قبل ${Math.floor(diff / 60)} دقيقة`;
        if (diff < 86400)  return `قبل ${Math.floor(diff / 3600)} ساعة`;
        if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;

        return date.toLocaleDateString("ar-DZ", {
            year: "numeric", month: "long", day: "numeric"
        });
    }


    /* ---------- التشغيل ---------- */

    load(1);
});