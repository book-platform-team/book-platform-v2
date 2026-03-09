// =============================
// 🔧 إعدادات الروابط
// =============================
const CONFIG = {
    DEBUG: false,  // ← غيري هذا فقط!
    API_URL: "/api/login",
    // ...
};


// =============================
// 👁️ إظهار وإخفاء كلمة المرور
// =============================
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById("togglePassBtn");
    const passwordInput = document.getElementById("password");
    
    if(toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", function(e){
            e.preventDefault();
            if(passwordInput.type === "password") {
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
    if(e) e.preventDefault();
    const emailContainer = document.getElementById('emailContainer');
    const phoneContainer = document.getElementById('phoneContainer');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');
    
    if(emailContainer) emailContainer.style.display = 'none';
    if(phoneContainer) phoneContainer.style.display = 'flex';
    if(phoneInput) phoneInput.required = true;
    if(emailInput) { emailInput.required = false; emailInput.value = ''; }
}

function switchToEmail(e) {
    if(e) e.preventDefault();
    const emailContainer = document.getElementById('emailContainer');
    const phoneContainer = document.getElementById('phoneContainer');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');
    
    if(phoneContainer) phoneContainer.style.display = 'none';
    if(emailContainer) emailContainer.style.display = 'flex';
    if(emailInput) emailInput.required = true;
    if(phoneInput) { phoneInput.required = false; phoneInput.value = ''; }
}

const phoneToggle = document.getElementById("phoneToggle");
const emailToggle = document.getElementById("emailToggle");
if(phoneToggle) phoneToggle.addEventListener("click", switchToPhone);
if(emailToggle) emailToggle.addEventListener("click", switchToEmail);

// =============================
// 🌍 تحسين قائمة الدول
// =============================
const countryCode = document.getElementById('countryCode');
if(countryCode) {
    countryCode.addEventListener('focus', function() { this.size = 10; });
    countryCode.addEventListener('blur', function() { this.size = 1; });
    countryCode.addEventListener('change', function() { this.size = 1; });
}

// =============================
// 📤 إرسال الفورم
// =============================
const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".btn-primary");

if(loginForm){
    loginForm.addEventListener("submit", async function(e){
        e.preventDefault();
        e.stopPropagation();
        console.log("🚀 بدء عملية تسجيل الدخول...");
        
        const phoneContainer = document.getElementById('phoneContainer');
        const contactType = phoneContainer && phoneContainer.style.display === 'none' ? 'email' : 'phone';
        
        let contactValue = '';
        if(contactType === 'phone') {
            const code = document.getElementById('countryCode')?.value || '';
            const phone = document.getElementById('phoneInput')?.value.trim() || '';
            contactValue = (code + ' ' + phone).trim();
        } else {
            contactValue = document.getElementById('emailInput')?.value.trim() || '';
        }
        
        const password = document.getElementById('password')?.value || '';
        const data = { 
            [contactType]: contactValue, 
            password: password, 
            timestamp: new Date().toISOString() 
        };
        
        console.log("📦 البيانات المرسلة:", data);
        
        if(loginBtn){
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
                    "X-Requested-With": "XMLHttpRequest" 
                },
                body: JSON.stringify(data),
                mode: "cors", 
                cache: "no-cache"
            });
            
            const result = await response.json().catch(() => ({}));
            console.log("📥 الرد:", { status: response.status,  result });
            
            // 🔹 ⭐⭐⭐ التعديل المهم هنا - توجيه مباشر بدون شروط معقدة
            if(CONFIG.DEBUG) {
                // ✅ وضع الاختبار - توجيه مباشر دائماً عند أي رد
                console.log("✅ البيانات أرسلت بنجاح!");
                localStorage.setItem("authToken", "test_token_123");
                
                // ✅ توجيه فوري بدون أي شرط
                setTimeout(() => {
                    window.location.href = "Library.html";
                }, 100);  // ننتظرو 100ms فقط باش الـ console يتسجل
                
            } else {
                // ✅ وضع الإنتاج مع Laravel
                if(response.ok && result.token) {
                    localStorage.setItem("authToken", result.token);
                    window.location.href = "Library.html";
                } else if(response.status === 401) {
                    alert("❌ " + (result.message || "البيانات خاطئة"));
                    if(loginBtn){
                        loginBtn.innerText = "تسجيل الدخول";
                        loginBtn.disabled = false;
                        loginBtn.style.opacity = "1";
                    }
                } else {
                    alert("❌ خطأ: " + (result.message || response.status));
                    if(loginBtn){
                        loginBtn.innerText = "تسجيل الدخول";
                        loginBtn.disabled = false;
                        loginBtn.style.opacity = "1";
                    }
                }
            }
            
        } catch(error) {
            console.error("❌ خطأ في الاتصال:", error);
            
            if(CONFIG.DEBUG) {
                console.log("⚠️ فشل الاتصال، لكن البيانات:", data);
                // حتى في الخطأ نوجوه للتجربة
                setTimeout(() => {
                    window.location.href = "Library.html";
                }, 100);
            } else {
                alert("❌ تعذر الاتصال بالسيرفر");
                if(loginBtn){
                    loginBtn.innerText = "تسجيل الدخول";
                    loginBtn.disabled = false;
                    loginBtn.style.opacity = "1";
                }
            }
        }
    });
}