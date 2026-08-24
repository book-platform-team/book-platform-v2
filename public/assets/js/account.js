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

    /* ========================================
       📚 كتبي + تأكيد بريد البيع
       ----------------------------------------
       تُبنى من user.books القادمة مع /auth/me،
       لأنّ حالة البريد بيانات خاصّة بصاحب الحساب
       ولا تخرج في أي مسار عام.

       أربع حالات لكل كتاب:
         pending                  → قيد المراجعة، لا رمز أُرسل بعد
         approved بلا بريد بيع     → لا شيء يُؤكَّد
         approved ببريد غير مؤكَّد → شريط التأكيد
         مؤكَّد                    → علامة خضراء

       والحالة الأولى مهمّة: الرمز يُرسَل عند موافقة
       الدار لا عند الإرسال. فعرض «أكّد بريدك» لكتاب
       معلَّق يجعل المؤلف ينتظر بريداً لن يصل.
       ======================================== */

    function loadBooks(u) {
        const box = document.getElementById("accBooks");
        if (!box) return;

        const books = Array.isArray(u.books) ? u.books : [];

        if (books.length === 0) {
            return empty(box, "لم يُنشر لك كتاب بعد",
                         "أول كتاب ترسله يظهر هنا بعد موافقة الدار.");
        }

        box.className = "acc-books";
        box.innerHTML = books.map(bookRow).join("");
    }

    function bookRow(b) {
        const pending  = b.status === "pending";
        const rejected = b.status === "rejected";
        const needs    = b.status === "approved" && b.has_sale_email && !b.sale_email_verified;
        const done     = b.has_sale_email && b.sale_email_verified;

        const title = b.slug
            ? `<a href="/book.html?slug=${encodeURIComponent(b.slug)}">${escapeText(b.title)}</a>`
            : escapeText(b.title || "—");

        const chip =
            pending  ? `<span class="ab-chip wait"><i class='bx bx-time-five'></i> قيد المراجعة</span>` :
            rejected ? `<span class="ab-chip no"><i class='bx bx-x'></i> غير مقبول</span>` :
            done     ? `<span class="ab-chip ok"><i class='bx bx-check-shield'></i> بريد البيع مؤكَّد</span>` :
            needs    ? `<span class="ab-chip warn"><i class='bx bx-error-circle'></i> بريد البيع غير مؤكَّد</span>` :
                       `<span class="ab-chip ok"><i class='bx bx-check'></i> منشور</span>`;

        return `
            <article class="acc-book" data-book="${escapeAttr(b.id)}">
                <div class="ab-main">
                    <b class="ab-title">${title}</b>
                    ${chip}
                </div>

                ${needs ? `
                    <div class="ab-verify">
                        <p class="ab-lead">
                            <i class='bx bx-envelope'></i>
                            <span>
                                أرسلنا رمزاً من ٦ أرقام إلى بريد البيع الذي حدّدته.
                                أدخله ليظهر البريد في صفحة كتابك.
                            </span>
                        </p>

                        <div class="ab-alert" hidden></div>

                        <div class="ab-row">
                            <input type="text" class="ab-code" inputmode="numeric"
                                   maxlength="6" placeholder="——————"
                                   aria-label="رمز التأكيد">
                            <button type="button" class="acc-btn ab-go">
                                <i class='bx bx-check'></i> تأكيد
                            </button>
                        </div>

                        <button type="button" class="ab-resend">
                            لم يصلني الرمز — أعد الإرسال
                        </button>
                    </div>` : ""}
            </article>`;
    }


    /* ---------- تفويض الأحداث ----------
       الصفوف تُرسم بعد التحميل، فالتفويض أضمن
       من ربط مستمع لكل زرّ عند الرسم */

    document.getElementById("accBooks")?.addEventListener("input", (e) => {
        if (!e.target.classList.contains("ab-code")) return;
        // أرقام فقط — اللصق من البريد يجلب مسافات أحياناً
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
        e.target.closest(".ab-verify")?.querySelector(".ab-alert")?.setAttribute("hidden", "");
    });

    document.getElementById("accBooks")?.addEventListener("click", async (e) => {
        const card = e.target.closest(".acc-book");
        if (!card) return;

        const id    = card.dataset.book;
        const wrap  = card.querySelector(".ab-verify");
        const alert = wrap?.querySelector(".ab-alert");

        /* ---------- إعادة الإرسال ---------- */
        const resend = e.target.closest(".ab-resend");
        if (resend) {
            const old = busy(resend, "جارٍ الإرسال...");
            try {
                const res = await apiPost(
                    `/books/${encodeURIComponent(id)}/sale-email/request`, {});

                /* البريد نفسه قد يكون مؤكَّداً من كتاب سابق —
                   التأكيد مربوط بالبريد لا بالكتاب. عندها لا
                   يُرسَل رمز، فقول «أُرسل رمز» كذبة تجعل
                   المؤلف ينتظر بريداً لن يصل. */
                if (res?.data?.already_verified) {
                    markVerified(id);
                    return;
                }

                rowSay(alert, "ok", "أُرسل رمز جديد إلى بريد البيع");
            } catch (err) {
                rowSay(alert, "err", err?.message || "تعذّر إرسال الرمز");
            } finally {
                unbusy(resend, old);
            }
            return;
        }

        /* ---------- التأكيد ---------- */
        const go = e.target.closest(".ab-go");
        if (!go) return;

        const input = card.querySelector(".ab-code");
        if (!input || input.value.length !== 6) {
            rowSay(alert, "err", "الرمز ستّة أرقام");
            input?.focus();
            return;
        }

        const old = busy(go, "جارٍ التحقّق...");
        try {
            await apiPost(`/books/${encodeURIComponent(id)}/sale-email/verify`,
                          { code: input.value });

            markVerified(id);

        } catch (err) {
            rowSay(alert, "err", err?.message || "الرمز غير صحيح أو انتهت صلاحيته");
            unbusy(go, old);
        }
    });

    /* تحديث محلّي بدل إعادة تحميل الصفحة —
       النتيجة نفسها وأخفّ */
    function markVerified(id) {
        const b = (me.books || []).find(x => String(x.id) === String(id));
        if (b) b.sale_email_verified = true;
        loadBooks(me);
    }

    function rowSay(box, kind, text) {
        if (!box) return;
        box.hidden = false;
        box.className = `ab-alert ${kind}`;
        box.innerHTML = `<i class='bx bx-${kind === "ok" ? "check" : "error"}-circle'></i>
                         <span>${escapeText(text)}</span>`;
    }

    function empty(box, title, note) {
        box.className = "acc-empty";
        box.innerHTML = `
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