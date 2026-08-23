/* ========================================
   🧩 دار سامي — واجهة الحساب المشتركة
   ----------------------------------------
   ⚠️ يُحمَّل بعد auth.js.
   ----------------------------------------
   نموذج الدخول يظهر في موضعين: صفحة الدخول،
   وبوّابة «نشر كتاب» لمن سبق أن نشر. فبُني هنا
   مرّة واحدة ويُركَّب في أي حاوية — لولا ذلك
   لصار عندنا نموذجان يتفرّقان مع أول تعديل.

   واستعادة كلمة السرّ نافذة لا صفحة: ثلاث خطوات
   في مكان واحد — البريد، ثم الرمز، ثم كلمة جديدة.
   ======================================== */

const AuthUI = (() => {

    /* ========================================
       🚪 نموذج الدخول
       ----------------------------------------
       mount(box, { onDone, onNoAccount })

       onNoAccount — ما يحدث عند «اضغط هنا»:
         في صفحة الدخول تُفتح صفحة نشر كتاب،
         وداخل بوّابة النشر تُعرض الخطوة الأولى
         مباشرةً بلا انتقال. سلوك واحد بوجهين،
         لأنّ الوجهة في الحالتين هي الخطوة الأولى.
       ======================================== */

    function mount(box, opts = {}) {
        if (!box) return;

        box.innerHTML = `
            <form class="auth-form" novalidate>
                <div class="auth-alert" hidden></div>

                <div class="auth-field">
                    <label for="au_email">البريد الإلكتروني</label>
                    <input type="email" id="au_email" dir="ltr" autocomplete="email"
                           placeholder="mail@example.com" required>
                </div>

                <div class="auth-field">
                    <label for="au_pass">كلمة السرّ</label>
                    <div class="auth-pass">
                        <input type="password" id="au_pass" autocomplete="current-password" required>
                        <button type="button" class="auth-eye" aria-label="إظهار كلمة السرّ">
                            <i class='bx bx-show'></i>
                        </button>
                    </div>
                </div>

                <button type="button" class="auth-forgot">نسيت كلمة السرّ؟</button>

                <button type="submit" class="auth-submit">
                    <i class='bx bx-log-in-circle'></i>
                    <span>تسجيل الدخول</span>
                </button>

                <p class="auth-foot">
                    إن لم يكن لديك حساب معنا
                    <button type="button" class="auth-here">اضغط هنا</button>
                </p>
            </form>
        `;

        const form   = box.querySelector(".auth-form");
        const alert  = box.querySelector(".auth-alert");
        const mail   = box.querySelector("#au_email");
        const pass   = box.querySelector("#au_pass");
        const submit = box.querySelector(".auth-submit");

        eye(box.querySelector(".auth-eye"), pass);

        box.querySelector(".auth-forgot")
           .addEventListener("click", () => openRecovery(mail.value.trim()));

        /* بلا حساب → الخطوة الأولى من نشر كتاب.
           الحساب يُولد من النشر لا من استمارة تسجيل،
           فهذه هي «صفحة إنشاء الحساب» عندنا. */
        box.querySelector(".auth-here")
           ?.addEventListener("click", () => {
               if (opts.onNoAccount) opts.onNoAccount();
               else location.href = "/upload-book.html";
           });

        form.addEventListener("input", () => { alert.hidden = true; });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const m = mail.value.trim();
            const p = pass.value;

            if (!m || !/^\S+@\S+\.\S+$/.test(m)) return say(alert, "err", "صيغة البريد غير صحيحة", mail);
            if (!p)                              return say(alert, "err", "الرجاء كتابة كلمة السرّ", pass);

            const old = busy(submit, "جارٍ الدخول...");

            try {
                const u = await Auth.login(m, p);
                opts.onDone ? opts.onDone(u) : location.reload();
            } catch (err) {
                say(alert, "err", err?.message || "تعذّر تسجيل الدخول", pass);
                unbusy(submit, old);
            }
        });
    }


    /* ========================================
       🔑 نافذة الاستعادة — ثلاث خطوات
       ======================================== */

    function openRecovery(prefill = "") {
        document.getElementById("authRecovery")?.remove();

        const box = document.createElement("div");
        box.className = "auth-overlay";
        box.id = "authRecovery";
        box.innerHTML = `
            <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="recTitle">
                <button class="auth-close" aria-label="إغلاق"><i class='bx bx-x'></i></button>

                <h2 id="recTitle"><i class='bx bx-key'></i> استعادة كلمة السرّ</h2>

                <ol class="rec-track">
                    <li class="on">البريد</li>
                    <li>الرمز</li>
                    <li>كلمة جديدة</li>
                </ol>

                <div class="auth-alert" hidden></div>

                <!-- ١ · البريد -->
                <div class="rec-step" data-s="1">
                    <p class="rec-lead">اكتب بريدك، ونرسل إليه رمزاً من ٦ أرقام.</p>
                    <div class="auth-field">
                        <label for="rec_mail">البريد الإلكتروني</label>
                        <input type="email" id="rec_mail" dir="ltr" autocomplete="email">
                    </div>
                    <button type="button" class="auth-submit" data-go="send">
                        <i class='bx bx-envelope'></i><span>أرسل الرمز</span>
                    </button>
                </div>

                <!-- ٢ · الرمز -->
                <div class="rec-step" data-s="2" hidden>
                    <p class="rec-lead">أدخل الرمز الذي وصل إلى <b class="rec-mail"></b>.</p>
                    <div class="auth-field">
                        <label for="rec_code">الرمز</label>
                        <input type="text" id="rec_code" dir="ltr" inputmode="numeric"
                               maxlength="6" class="rec-code" placeholder="——————">
                    </div>
                    <button type="button" class="auth-submit" data-go="verify">
                        <i class='bx bx-check'></i><span>تحقّق</span>
                    </button>
                    <button type="button" class="auth-link" data-go="resend">لم يصلني — أعد الإرسال</button>
                </div>

                <!-- ٣ · كلمة جديدة -->
                <div class="rec-step" data-s="3" hidden>
                    <p class="rec-lead">اختر كلمة سرّ جديدة.</p>
                    <div class="auth-field">
                        <label for="rec_pass">كلمة السرّ الجديدة</label>
                        <div class="auth-pass">
                            <input type="password" id="rec_pass" autocomplete="new-password">
                            <button type="button" class="auth-eye" aria-label="إظهار"><i class='bx bx-show'></i></button>
                        </div>
                        <div class="pw-meter"><span></span></div>
                        <small class="pw-note"></small>
                    </div>
                    <button type="button" class="auth-submit" data-go="reset">
                        <i class='bx bx-save'></i><span>احفظ كلمة السرّ</span>
                    </button>
                </div>

                <!-- ✓ -->
                <div class="rec-step rec-done" data-s="4" hidden>
                    <i class='bx bx-check-circle'></i>
                    <b>تم تغيير كلمة السرّ</b>
                    <span>يمكنك الآن تسجيل الدخول بها.</span>
                    <button type="button" class="auth-submit" data-go="close">
                        <span>عودة إلى الدخول</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(box);
        document.body.style.overflow = "hidden";

        const alert = box.querySelector(".auth-alert");
        const track = [...box.querySelectorAll(".rec-track li")];
        const mail  = box.querySelector("#rec_mail");
        const code  = box.querySelector("#rec_code");
        const pass  = box.querySelector("#rec_pass");

        if (prefill) mail.value = prefill;

        eye(box.querySelector(".rec-step[data-s='3'] .auth-eye"), pass);
        meter(pass, box.querySelector(".pw-meter span"), box.querySelector(".pw-note"));

        // الرمز أرقام فقط — اللصق من البريد يجلب مسافات أحياناً
        code.addEventListener("input", () => {
            code.value = code.value.replace(/\D/g, "").slice(0, 6);
            alert.hidden = true;
        });

        function step(n) {
            box.querySelectorAll(".rec-step").forEach(s => {
                s.hidden = Number(s.dataset.s) !== n;
            });
            track.forEach((li, i) => {
                li.classList.toggle("on",   i === n - 1);
                li.classList.toggle("done", i <  n - 1);
            });
            alert.hidden = true;
        }

        const close = () => {
            box.remove();
            document.body.style.overflow = "";
        };

        box.querySelector(".auth-close").addEventListener("click", close);
        box.addEventListener("click", e => { if (e.target === box) close(); });
        document.addEventListener("keydown", function esc(e) {
            if (e.key === "Escape" && document.getElementById("authRecovery")) {
                close();
                document.removeEventListener("keydown", esc);
            }
        });

        box.addEventListener("click", async (e) => {
            const btn = e.target.closest("[data-go]");
            if (!btn) return;

            const go = btn.dataset.go;

            if (go === "close") return close();

            if (go === "send" || go === "resend") {
                const m = mail.value.trim();
                if (!m || !/^\S+@\S+\.\S+$/.test(m)) return say(alert, "err", "صيغة البريد غير صحيحة", mail);

                const old = busy(btn, "جارٍ الإرسال...");
                try {
                    const res = await Auth.forgotStart(m);
                    box.querySelector(".rec-mail").textContent = m;
                    step(2);
                    say(alert, "ok", res?.message || "أُرسل رمز إلى بريدك");
                    code.focus();
                } catch (err) {
                    say(alert, "err", err?.message || "تعذّر إرسال الرمز");
                } finally {
                    unbusy(btn, old);
                }
                return;
            }

            if (go === "verify") {
                if (code.value.length !== 6) return say(alert, "err", "الرمز ستّة أرقام", code);

                const old = busy(btn, "جارٍ التحقّق...");
                try {
                    await Auth.forgotVerify(mail.value.trim(), code.value);
                    step(3);
                    pass.focus();
                } catch (err) {
                    say(alert, "err", err?.message || "الرمز غير صحيح", code);
                } finally {
                    unbusy(btn, old);
                }
                return;
            }

            if (go === "reset") {
                const problem = Auth.passwordProblem(pass.value);
                if (problem) return say(alert, "err", problem, pass);

                const old = busy(btn, "جارٍ الحفظ...");
                try {
                    await Auth.forgotReset(mail.value.trim(), code.value, pass.value);
                    step(4);
                } catch (err) {
                    say(alert, "err", err?.message || "تعذّر تغيير كلمة السرّ");
                } finally {
                    unbusy(btn, old);
                }
            }
        });

        setTimeout(() => (prefill ? box.querySelector("[data-go='send']") : mail)?.focus(), 60);
    }


    /* ========================================
       🧰 أدوات مشتركة
       ======================================== */

    /** مقياس قوّة كلمة السرّ — يُربط بحقل */
    function meter(input, bar, note) {
        if (!input) return;
        input.addEventListener("input", () => {
            const { score, label } = Auth.passwordScore(input.value);
            if (bar) {
                bar.style.width = `${(score / 5) * 100}%`;
                bar.className = score <= 1 ? "bad" : score <= 2 ? "mid" : score <= 3 ? "ok" : "good";
            }
            if (note) {
                note.textContent = input.value
                    ? label
                    : `${Auth.MIN_LEN} أحرف على الأقل، مع أرقام أو حروف كبيرة`;
                note.className = "pw-note" + (input.value && score <= 2 ? " weak" : "");
            }
        });
        input.dispatchEvent(new Event("input"));
    }

    function eye(btn, input) {
        btn?.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.innerHTML = show ? `<i class='bx bx-hide'></i>` : `<i class='bx bx-show'></i>`;
            input.focus();
        });
    }

    function say(box, kind, text, focusEl) {
        if (!box) return false;
        box.hidden = false;
        box.className = `auth-alert ${kind}`;
        box.innerHTML = `<i class='bx bx-${kind === "ok" ? "check" : "error"}-circle'></i>
                         <span>${escapeText(text)}</span>`;
        focusEl?.focus();
        return false;
    }

    function busy(btn, text) {
        const old = btn.innerHTML;
        btn.disabled  = true;
        btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i><span>${escapeText(text)}</span>`;
        return old;
    }

    function unbusy(btn, old) {
        btn.disabled  = false;
        btn.innerHTML = old;
    }


    return { mount, openRecovery, meter, eye };
})();
