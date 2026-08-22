/* ========================================
   ⚖️ دار سامي — الصفحات القانونية
   ----------------------------------------
   ⚠️ الهيدر · القائمة · الفوتر · observeReveals
      →  كلها في partials.js
   ----------------------------------------
   وظيفة واحدة: تمييز القسم الظاهر في الفهرس
   الجانبي أثناء التمرير.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const links    = document.querySelectorAll(".lg-toc a");
    const sections = document.querySelectorAll(".lg-content section[id]");

    if (links.length === 0 || sections.length === 0) return;


    /* ---------- تمييز القسم الحالي ---------- */

    let current = null;

    function highlight(id) {
        if (id === current) return;
        current = id;

        links.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
    }

    /* rootMargin العلوي يعوّض ارتفاع الهيدر الثابت،
       والسفلي يجعل القسم "حالياً" وهو في أعلى الشاشة
       لا في منتصفها — أقرب لإحساس القارئ. */
    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) highlight(visible.target.id);
    }, {
        rootMargin: "-90px 0px -70% 0px",
        threshold: 0
    });

    sections.forEach(s => observer.observe(s));


    /* ---------- تمرير ناعم مع احترام تفضيل الحركة ---------- */

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href")?.slice(1);
            const target = id && document.getElementById(id);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });

            // نحدّث الرابط دون إعادة تحميل — ليعمل زر الرجوع
            history.replaceState(null, "", `#${id}`);
            highlight(id);
        });
    });
});