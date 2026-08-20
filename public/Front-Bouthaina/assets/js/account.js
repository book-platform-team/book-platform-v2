/* ========================================
   👤 دار سامي — حسابي
   ----------------------------------------
   ⚠️ الترتيب: api → auth → auth-ui → partials → هذا
   ----------------------------------------
   هذه ليست author-profile.html.

   تلك صفحة عامّة يراها الزوّار، وهذه خاصّة يراها
   صاحبها وحده ويعدّل فيها. الخلط بينهما يضع زرّ
   «عدّل بياناتك» في صفحة مؤلف آخر — لذلك فُصلتا
   ملفاً وتصميماً ولم تُدمجا.
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const wait  = document.getElementById("accWait");
    const guest = document.getElementById("accGuest");
    const main  = document.getElementById("accMain");

    let me = null;


    /* ========================================
       🚦 حالة الجلسة
       ======================================== */

    Auth.onReady(user => {
        if (wait) wait.hidden = true;

        if (!user) {
            if (guest) guest.hidden = false;
            return;
        }

        me = user;
        if (main) main.hidden = false;

        paintHead(user);
        fillProfile(user);
        loadBooks(user);
    });


    /* ========================================
       🪪 الترويسة
       ======================================== */

    function paintHead(u) {
        setText("accName", u.name || "—");
        setText("accMail", u.email || "—");

        const ava = document.getElementById("accAva");
        if (ava) {
            ava.innerHTML = u.photo
                ? `<img src="${escapeAttr(u.photo)}" alt="${escapeAttr(u.name || "")}">`
                : escapeText(String(u.name || "؟").trim().charAt(0));
        }

        // رابط الصفحة العامّة — لا يظهر إلا إن كان للمؤلف slug
        const pub = document.getElementById("accPublic");
        if (pub && u.slug) {
            pub.href = `/author-profile.html?slug=${encodeURIComponent(u.slug)}`;
            pub.hidden = false;
        }
    }

    document.getElementById("accLogout")?.addEventListener("click", async () => {
        await Auth.logout();
        location.href = "/index.html";
    });


    /* ========================================
       ✏️ بياناتي
       ======================================== */

    function fillProfile(u) {
        set("acc_name",    u.name);
        set("acc_email",   u.email);
        set("acc_phone",   u.phone);
        set("acc_address", u.address);
        set("acc_bio",     u.bio);
        set("acc_extra",   u.extra);
        set("acc_title",   u.title || "none");
    }

    const profForm  = document.getElementById("profForm");
    const profAlert = document.getElementById("profAlert");

    profForm?.addEventListener("input", e => {
        e.target.classList.remove("invalid");
        if (profAlert) profAlert.hidden = true;
    });

    profForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!val("acc_name"))    return say(profAlert, "err", "الرجاء كتابة الاسم واللقب", "acc_name");
        if (!val("acc_phone"))   return say(profAlert, "err", "الرجاء كتابة رقم الهاتف", "acc_phone");
        if (!val("acc_address")) return say(profAlert, "err", "الرجاء كتابة العنوان", "acc_address");
        if (!val("acc_bio"))     return say(profAlert, "err", "الرجاء كتابة نبذة عنك", "acc_bio");

        const btn = document.getElementById("profSave");
        const old = busy(btn, "جارٍ الحفظ...");

        try {
            // البريد لا يُرسل: هوية الحساب لا تُغيَّر من هنا
            const user = await Auth.saveProfile({
                name:    val("acc_name"),
                title:   val("acc_title"),
                phone:   val("acc_phone"),
                address: val("acc_address"),
                bio:     val("acc_bio"),
                extra:   val("acc_extra"),
            });

            me = user || me;
            paintHead(me);
            say(profAlert, "ok", "حُفظت بياناتك");

        } catch (err) {
            say(profAlert, "err", err?.message || "تعذّر حفظ البيانات");
        } finally {
            unbusy(btn, old);
        }
    });


    /* ========================================
       🔑 كلمة السرّ
       ======================================== */

    const pwForm  = document.getElementById("pwForm");
    const pwAlert = document.getElementById("pwAlert");
    const newPw   = document.getElementById("new_pw");
    const newPw2  = document.getElementById("new_pw2");

    document.querySelectorAll("#pwForm .auth-eye").forEach(btn => {
        AuthUI.eye(btn, btn.parentElement.querySelector("input"));
    });

    AuthUI.meter(newPw,
        document.querySelector("#pwForm .pw-meter span"),
        document.getElementById("newNote"));

    newPw2?.addEventListener("input", () => {
        const note = document.getElementById("new2Note");
        if (!note) return;
        if (!newPw2.value) { note.textContent = ""; note.className = ""; return; }
        const same = newPw2.value === newPw.value;
        note.textContent = same ? "متطابقتان ✓" : "غير متطابقتين";
        note.className   = same ? "pw-ok" : "pw-bad";
    });

    pwForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cur = document.getElementById("cur_pw");
        if (!cur?.value) return say(pwAlert, "err", "الرجاء كتابة كلمة السرّ الحالية", "cur_pw");

        const problem = Auth.passwordProblem(newPw.value);
        if (problem) return say(pwAlert, "err", problem, "new_pw");

        if (newPw.value !== newPw2.value)
            return say(pwAlert, "err", "كلمتا السرّ غير متطابقتين", "new_pw2");

        if (newPw.value === cur.value)
            return say(pwAlert, "err", "الكلمة الجديدة مطابقة للحالية", "new_pw");

        const btn = document.getElementById("pwSave");
        const old = busy(btn, "جارٍ التغيير...");

        try {
            await Auth.changePassword(cur.value, newPw.value);
            pwForm.reset();
            newPw.dispatchEvent(new Event("input"));
            document.getElementById("new2Note").textContent = "";
            say(pwAlert, "ok", "تم تغيير كلمة السرّ");
        } catch (err) {
            say(pwAlert, "err", err?.message || "تعذّر تغيير كلمة السرّ");
        } finally {
            unbusy(btn, old);
        }
    });


    /* ========================================
       📚 كتبي
       ======================================== */

    async function loadBooks(u) {
        const grid = document.getElementById("accBooks");
        if (!grid) return;

        // بلا slug لا كتب منشورة بعد — أول كتاب قيد المراجعة
        if (!u.slug) return empty(grid, "لم يُنشر لك كتاب بعد", "أول كتاب ترسله يظهر هنا بعد موافقة الدار.");

        showLoading(grid, 4);

        try {
            const res   = await apiGet(`/authors/${encodeURIComponent(u.slug)}`);
            const books = res?.data?.books || [];

            if (books.length === 0) {
                return empty(grid, "لم يُنشر لك كتاب بعد",
                             "أول كتاب ترسله يظهر هنا بعد موافقة الدار.");
            }

            renderBookGrid(grid, books);

        } catch (error) {
            console.error("Error loading my books:", error);
            empty(grid, "تعذّر تحميل كتبك", "تحقّق من اتصالك وأعد تحميل الصفحة.");
        }
    }

    function empty(grid, title, note) {
        grid.className = "acc-empty";
        grid.innerHTML = `
            <i class='bx bx-book-open'></i>
            <b>${escapeText(title)}</b>
            <span>${escapeText(note)}</span>
        `;
    }


    /* ---------- مساعدات ---------- */

    function val(id) { return document.getElementById(id)?.value.trim() || ""; }

    function set(id, v) {
        const el = document.getElementById(id);
        if (el && v != null) el.value = v;
    }

    function setText(id, v) {
        const el = document.getElementById(id);
        if (el) el.textContent = v ?? "—";
    }

    function say(box, kind, text, focusId) {
        if (!box) return false;
        box.hidden = false;
        box.className = `auth-alert ${kind}`;
        box.innerHTML = `<i class='bx bx-${kind === "ok" ? "check" : "error"}-circle'></i>
                         <span>${escapeText(text)}</span>`;

        if (kind === "err" && focusId) {
            const el = document.getElementById(focusId);
            el?.classList.add("invalid");
            el?.focus();
        }

        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return false;
    }

    function busy(btn, text) {
        const old = btn.innerHTML;
        btn.disabled  = true;
        btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> ${escapeText(text)}`;
        return old;
    }

    function unbusy(btn, old) {
        btn.disabled  = false;
        btn.innerHTML = old;
    }
});
