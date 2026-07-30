// =============================
// 🔧 إعدادات الروابط
// =============================
const CONFIG = {
    DEBUG: false,            // ⚠️ true = تجاوز السيرفر تماماً (أي كلمة سر تنجح). لازم false قبل النشر
    API_URL: "/api/login",
    TEST_URL: "/api/login",  // نفس المسار — الفرق في السلوك لا في العنوان
};


// =============================
// 👁️ إظهار وإخفاء كلمة المرور
// =============================
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("togglePassBtn");
    const passwordInput = document.getElementById("password");

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                toggleBtn.innerText = "إخفاء";
                toggleBtn.style.color = "#c31432";
            } else {
                passwordInput.type = "password";
                toggleBtn.innerText = "إظهار";
                toggleBtn.style.color = "#7a0c16";
            }
        });
    }
});


// =============================
// 📱📧 التبديل بين الهاتف والبريد
// =============================
function switchToPhone(e) {
    if (e) e.preventDefault();
    const emailContainer = document.getElementById("emailContainer");
    const phoneContainer = document.getElementById("phoneContainer");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");

    if (emailContainer) emailContainer.style.display = "none";
    if (phoneContainer) phoneContainer.style.display = "flex";
    if (phoneInput) phoneInput.required = true;
    if (emailInput) { emailInput.required = false; emailInput.value = ""; }
}

function switchToEmail(e) {
    if (e) e.preventDefault();
    const emailContainer = document.getElementById("emailContainer");
    const phoneContainer = document.getElementById("phoneContainer");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");

    if (phoneContainer) phoneContainer.style.display = "none";
    if (emailContainer) emailContainer.style.display = "flex";
    if (emailInput) emailInput.required = true;
    if (phoneInput) { phoneInput.required = false; phoneInput.value = ""; }
}


// =============================
// 🌍 تحسين قائمة الدول
// =============================
const countryCode = document.getElementById("countryCode");
if (countryCode) {
    countryCode.addEventListener("focus",  function () { this.size = 10; });
    countryCode.addEventListener("blur",   function () { this.size = 1; });
    countryCode.addEventListener("change", function () { this.size = 1; });
}


// =============================
// 📤 إرسال الفورم
// =============================
const loginForm = document.getElementById("loginForm");
const loginBtn  = document.querySelector(".btn-primary");

function resetLoginBtn() {
    if (!loginBtn) return;
    loginBtn.innerText = "تسجيل الدخول";
    loginBtn.disabled = false;
    loginBtn.style.opacity = "1";
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("🚀 بدء عملية تسجيل الدخول...");

        // تحديد نوع الاتصال: هاتف إذا كانت خانة الهاتف ظاهرة، وإلا بريد
        const phoneContainer = document.getElementById("phoneContainer");
        const phoneVisible = phoneContainer && phoneContainer.style.display !== "none";
        const contactType = phoneVisible ? "phone" : "email";

        let contactValue = "";
        if (contactType === "phone") {
            const code  = document.getElementById("countryCode")?.value || "";
            const phone = document.getElementById("phoneInput")?.value.trim() || "";
            contactValue = (code + " " + phone).trim();
        } else {
            contactValue = document.getElementById("emailInput")?.value.trim() || "";
        }

        const password = document.getElementById("password")?.value || "";

        if (!contactValue || !password) {
            alert("الرجاء إدخال البيانات كاملة");
            return;
        }

        const data = {
            [contactType]: contactValue,
            password: password,
        };

        if (loginBtn) {
            loginBtn.innerText = "جاري الدخول...";
            loginBtn.disabled = true;
            loginBtn.style.opacity = "0.8";
        }

        const endpoint = CONFIG.DEBUG ? CONFIG.TEST_URL : CONFIG.API_URL;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(data),
                cache: "no-cache",
            });

            const result = await response.json().catch(() => ({}));
            console.log("📥 الرد:", { status: response.status, result });

            if (CONFIG.DEBUG) {
                // ⚠️ وضع الاختبار — يتجاوز السيرفر ويدخل دائماً
                console.log("✅ وضع الاختبار: توجيه مباشر");
                localStorage.setItem("auth_token", "test_token_123");
                setTimeout(() => { window.location.href = "/library.html"; }, 100);

            } else {
                // ✅ وضع الإنتاج
                // TODO (اليوم الثالث): حسب API.md الرد هو { success, data: { token, user } }
                //                      يعني result.data.token — نوحّدها مع زميلتك
                if (response.ok && result.token) {
                    localStorage.setItem("auth_token", result.token);
                    window.location.href = "/library.html";

                } else if (response.status === 401) {
                    alert("❌ " + (result.message || "البيانات خاطئة"));
                    resetLoginBtn();

                } else {
                    alert("❌ خطأ: " + (result.message || response.status));
                    resetLoginBtn();
                }
            }

        } catch (error) {
            console.error("❌ خطأ في الاتصال:", error);

            if (CONFIG.DEBUG) {
                console.log("⚠️ فشل الاتصال — توجيه رغم ذلك (وضع الاختبار)");
                setTimeout(() => { window.location.href = "/library.html"; }, 100);
            } else {
                alert("❌ تعذر الاتصال بالسيرفر");
                resetLoginBtn();
            }
        }
    });
}