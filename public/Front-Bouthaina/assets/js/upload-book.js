/* ========================================
   📤 مكتبة سامي الرقمية — رفع كتاب
   ----------------------------------------
   ⚠️ الهيدر · قائمة الجوال · مودال البحث · الفوتر ·
      زر الصعود · السنة · تسجيل الخروج  →  في partials.js
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- حماية الصفحة ---------- */

    if (!localStorage.getItem("auth_token")) {
        window.location.href = "/login.html?redirect=/upload-book.html";
        return;
    }

    /* ---------- عناصر النموذج ---------- */

    const uploadForm    = document.getElementById("uploadBookForm");
    const fileInput     = document.getElementById("files");
    const fileList      = document.getElementById("fileList");
    const formAlert     = document.getElementById("formAlert");
    const alertMessage  = document.getElementById("alertMessage");
    const uploadStatus  = document.getElementById("uploadStatus");
    const uploadSuccess = document.getElementById("uploadSuccess");
    const submitBtn     = document.getElementById("submitBtn");
    const rightsConfirm = document.getElementById("rightsConfirm");


    /* ========================================
       📎 عرض الملفات المختارة
       ======================================== */

    fileInput?.addEventListener("change", function () {
        if (!fileList) return;
        fileList.innerHTML = "";

        Array.from(this.files).forEach(file => {
            const item = document.createElement("div");
            item.className = "file-item";
            item.innerHTML = `
                <i class='bx bx-file'></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;
            fileList.appendChild(item);
        });
    });

    function formatFileSize(bytes) {
        if (!bytes) return "0 بايت";
        const k = 1024;
        const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }


    /* ========================================
       📢 الرسائل
       ======================================== */

    function showAlert(message, type) {
        if (!formAlert || !alertMessage) return;
        formAlert.className = `alert alert-${type}`;
        alertMessage.textContent = message;
        formAlert.style.display = "flex";

        if (type === "success") {
            setTimeout(() => { formAlert.style.display = "none"; }, 5000);
        }
    }


    /* ========================================
       📤 إرسال النموذج
       ======================================== */

    uploadForm?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const token = localStorage.getItem("auth_token");
        if (!token) {
            showAlert("يجب تسجيل الدخول أولاً", "error");
            return;
        }

        const title = document.getElementById("title")?.value.trim();
        if (!title) {
            showAlert("الرجاء إدخال عنوان الكتاب", "error");
            return;
        }

        const files = fileInput?.files;
        if (!files || files.length === 0) {
            showAlert("الرجاء اختيار ملف للكتاب", "error");
            return;
        }

        // ⚠️ فحص الامتداد فقط للراحة — السيرفر هو من يتحقق فعلياً من MIME
        const allowedTypes = ["application/pdf", "application/epub+zip"];
        for (const file of files) {
            if (file.type && !allowedTypes.includes(file.type)) {
                showAlert("نوع الملف غير مدعوم. استخدم PDF أو EPUB فقط", "error");
                return;
            }
        }

        if (rightsConfirm && !rightsConfirm.checked) {
            showAlert("الرجاء الإقرار بحقوق النشر", "error");
            return;
        }

        // إظهار حالة التحميل
        if (uploadStatus) uploadStatus.style.display = "block";
        if (submitBtn) submitBtn.disabled = true;
        if (formAlert) formAlert.style.display = "none";

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", document.getElementById("description")?.value.trim() || "");

            for (const file of files) {
                formData.append("files[]", file);
            }

            // ✅ المسار الصحيح: /api/books
            const response = await fetch("/api/books", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Accept": "application/json",
                    // لا نضع Content-Type مع FormData — المتصفح يضبطه بنفسه
                },
                body: formData
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok && result.success) {
                showAlert("تم رفع كتابك بنجاح! في انتظار مراجعة الأدمن", "success");
                uploadForm.style.display   = "none";
                if (uploadStatus)  uploadStatus.style.display  = "none";
                if (uploadSuccess) uploadSuccess.style.display = "block";
            } else {
                if (uploadStatus) uploadStatus.style.display = "none";
                showAlert("خطأ: " + (result.message || "تعذر رفع الكتاب"), "error");
            }

        } catch (error) {
            console.error("Upload error:", error);
            if (uploadStatus) uploadStatus.style.display = "none";
            showAlert("حدث خطأ في الاتصال بالسيرفر", "error");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});