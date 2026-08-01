/* ========================================
   👤 مكتبة سامي الرقمية — الملف الشخصي
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة · الخروج  →  في partials.js
   ----------------------------------------
   العقد (API.md):
     GET  /api/user/profile
     PUT  /api/user/profile
     POST /api/user/become-author   (ترقية فورية)
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- حماية الصفحة ---------- */

    if (!localStorage.getItem("auth_token")) {
        window.location.href = "/login.html?redirect=/profile.html";
        return;
    }


    /* ---------- عناصر الصفحة ---------- */

    const profileImage = document.getElementById("profileImage");
    const uploadImage  = document.getElementById("uploadImage");

    const userName  = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const roleBadge = document.getElementById("roleBadge");

    const editName  = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editPhone = document.getElementById("editPhone");
    const saveBtn   = document.getElementById("saveProfileBtn");

    const readerOption = document.getElementById("readerOption");
    const authorOption = document.getElementById("authorOption");
    const readerStatus = document.getElementById("readerStatus");
    const authorStatus = document.getElementById("authorStatus");
    const changeRoleBtn      = document.getElementById("changeRoleBtn");
    const roleChangeMessage  = document.getElementById("roleChangeMessage");

    const booksCount = document.getElementById("booksCount");
    const avgRating  = document.getElementById("avgRating");
    const viewsCount = document.getElementById("viewsCount");

    let currentUser   = null;
    let selectedRole  = null;


    /* ========================================
       📥 تحميل بيانات البروفايل
       ======================================== */

    const card = document.querySelector(".profile-card");

    async function loadProfile() {
        setBusy(true);

        try {
            // API.md: { success, data: { ... } }
            const res  = await apiGet("/user/profile");
            const user = res.data;

            if (!user) throw new Error("رد فارغ");

            currentUser = user;
            fillProfile(user);
            setBusy(false);

        } catch (error) {
            console.error("Error loading profile:", error);

            // التوكن منتهٍ أو غير صالح → إعادة للدخول
            if (error.status === 401) {
                localStorage.removeItem("auth_token");
                const next = encodeURIComponent(location.pathname);
                window.location.href = `/login.html?redirect=${next}`;
                return;
            }

            if (card) {
                card.innerHTML = "";
                showError(card, loadProfile, "تعذّر تحميل بيانات الحساب");
            }
        }
    }

    /* أثناء التحميل نُخفت البطاقة ونعطّل الإدخال —
       أفضل من ترك حقول فارغة قابلة للكتابة ثم استبدال محتواها. */
    function setBusy(busy) {
        if (!card) return;
        card.style.opacity       = busy ? "0.55" : "1";
        card.style.pointerEvents = busy ? "none" : "";
        card.style.transition    = "opacity .25s ease";
    }

    function fillProfile(user) {
        // الرأس
        if (userName)  userName.textContent  = user.name  || "بدون اسم";
        if (userEmail) userEmail.textContent = user.email || user.phone || "—";

        if (profileImage && user.avatar) profileImage.src = user.avatar;

        // شارة الدور
        setRoleBadge(user.role);

        // النموذج
        if (editName)  editName.value  = user.name  || "";
        if (editEmail) editEmail.value = user.email || "";
        if (editPhone) editPhone.value = user.phone || "";

        // الإحصائيات
        const stats = user.stats || {};
        if (booksCount) booksCount.textContent = stats.books_count ?? 0;
        if (avgRating)  avgRating.textContent  = (stats.avg_rating ?? 0).toFixed
                                                ? Number(stats.avg_rating ?? 0).toFixed(1)
                                                : "0.0";
        if (viewsCount) viewsCount.textContent = stats.views_count ?? 0;

        // حالة الدور الحالي
        markCurrentRole(user.role);
    }

    function setRoleBadge(role) {
        if (!roleBadge) return;

        const isAuthor = role === "author";
        roleBadge.innerHTML = isAuthor
            ? `<i class='bx bx-pencil'></i><span>مؤلف</span>`
            : `<i class='bx bx-user'></i><span>قارئ</span>`;
    }

    function markCurrentRole(role) {
        const isAuthor = role === "author";

        readerOption?.classList.toggle("active", !isAuthor);
        authorOption?.classList.toggle("active",  isAuthor);

        // بطاقة القارئ تُعطَّل بعد الترقية (لا رجوع)
        readerOption?.classList.toggle("locked", isAuthor);
        if (readerOption) {
            readerOption.style.cursor  = isAuthor ? "default" : "pointer";
            readerOption.style.opacity = isAuthor ? "0.55"    : "1";
        }

        if (readerStatus) readerStatus.style.display = isAuthor ? "none" : "flex";
        if (authorStatus) authorStatus.style.display = isAuthor ? "flex" : "none";

        // زر التحويل يظهر للقارئ فقط
        if (changeRoleBtn) changeRoleBtn.style.display = "none";
        if (roleChangeMessage) roleChangeMessage.style.display = "none";

        selectedRole = role;
    }


    /* ========================================
       💾 حفظ التغييرات
       ======================================== */

    saveBtn?.addEventListener("click", async () => {
        const name  = editName?.value.trim()  || "";
        const email = editEmail?.value.trim() || "";
        const phone = editPhone?.value.trim() || "";

        if (!name) {
            alert("الرجاء إدخال الاسم");
            editName?.focus();
            return;
        }

        if (!email && !phone) {
            alert("الرجاء إدخال البريد الإلكتروني أو رقم الهاتف");
            return;
        }

        const original = saveBtn.innerHTML;
        saveBtn.disabled  = true;
        saveBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جاري الحفظ...`;

        try {
            await apiPut("/user/profile", { name, email, phone });

            saveBtn.innerHTML = `<i class='bx bx-check'></i> تم الحفظ`;

            // تحديث الرأس فوراً
            if (userName)  userName.textContent  = name;
            if (userEmail) userEmail.textContent = email || phone;

            setTimeout(() => {
                saveBtn.innerHTML = original;
                saveBtn.disabled  = false;
            }, 2000);

        } catch (error) {
            console.error("Error saving profile:", error);
            const msg = error.errors
                ? Object.values(error.errors).flat().join("\n")
                : (error.message || "خطأ في الاتصال");
            alert("تعذّر حفظ التغييرات:\n" + msg);
            saveBtn.innerHTML = original;
            saveBtn.disabled  = false;
        }
    });


    /* ========================================
       🔄 ترقية الحساب إلى مؤلف (اتجاه واحد)
       ----------------------------------------
       قرار تصميمي: الدور صلاحية تراكمية لا هوية متبادلة.
       المؤلف يبقى قارئاً، فلا معنى للرجوع — والكتب المنشورة
       باسمه تبقى بلا مالك لو سمحنا بذلك.
       والبوابة الحقيقية على الكتاب (pending) لا على الشخص،
       لذلك الترقية فورية بلا موافقة أدمن.
       ======================================== */

    authorOption?.addEventListener("click", () => {
        if (!currentUser) return;
        if (currentUser.role === "author") return;   // مؤلف أصلاً

        selectedRole = "author";

        readerOption?.classList.remove("active");
        authorOption?.classList.add("active");

        if (changeRoleBtn)     changeRoleBtn.style.display     = "flex";
        if (roleChangeMessage) roleChangeMessage.style.display = "flex";
    });

    // بطاقة "قارئ" عرض حالة فقط — لا رجوع من مؤلف إلى قارئ
    readerOption?.addEventListener("click", () => {
        if (!currentUser) return;
        if (currentUser.role === "author") return;   // معطّلة

        // إلغاء اختيار الترقية
        markCurrentRole(currentUser.role);
    });

    changeRoleBtn?.addEventListener("click", async () => {
        if (selectedRole !== "author") return;

        const original = changeRoleBtn.innerHTML;
        changeRoleBtn.disabled  = true;
        changeRoleBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جاري الترقية...`;

        try {
            const res = await apiPost("/user/become-author", {});

            currentUser.role = res.data?.role || "author";
            setRoleBadge(currentUser.role);
            markCurrentRole(currentUser.role);

            alert("تم تحويل حسابك إلى مؤلف. يمكنك الآن نشر كتبك");

        } catch (error) {
            console.error("Error upgrading role:", error);
            alert("تعذّر ترقية الحساب: " + (error.message || "خطأ في الاتصال"));
            changeRoleBtn.innerHTML = original;
            changeRoleBtn.disabled  = false;
        }
    });


    /* ========================================
       🖼️ معاينة الصورة المختارة
       ======================================== */

    uploadImage?.addEventListener("change", function () {
        const file = this.files?.[0];
        if (!file || !profileImage) return;

        if (!file.type.startsWith("image/")) {
            alert("الرجاء اختيار ملف صورة");
            return;
        }

        // معاينة محلية فقط — الرفع الفعلي مع PUT /api/user/profile
        profileImage.src = URL.createObjectURL(file);

        // TODO (اليوم الثالث): إرسال الصورة عبر FormData
    });


    /* ---------- التشغيل ---------- */

    loadProfile();
});