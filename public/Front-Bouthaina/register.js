// =============================
// 🔧 إعدادات الروابط
// =============================
const CONFIG = {
    DEBUG: false,
    API_URL: "/api/register",
    GOOGLE_LOGIN_URL: "/auth/google" // ← رابط تسجيل الدخول بجوجل
};

// =============================
// 🔵 تسجيل الدخول بجوجل
// =============================
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", function(e) {
        e.preventDefault();
        
        // ✅ التأكد أن الرابط يبدأ بـ /
        const url = CONFIG.GOOGLE_LOGIN_URL.startsWith('/')
            ? CONFIG.GOOGLE_LOGIN_URL
            : '/' + CONFIG.GOOGLE_LOGIN_URL;
        
        window.location.href = url; // ← يوجه مباشرة للجذر
    });
}

// =============================
// 👁️ إظهار وإخفاء كلمة المرور
// =============================
const togglePassBtn = document.getElementById("togglePassBtn");
if(togglePassBtn){
    togglePassBtn.addEventListener("click", function(e){
        e.preventDefault();
        const pass = document.getElementById("password");
        
        if(pass){
            if(pass.type === "password"){
                pass.type = "text";
                togglePassBtn.innerText = "إخفاء";
                togglePassBtn.style.color = "#c31432";
            } else {
                pass.type = "password";
                togglePassBtn.innerText = "إظهار";
                togglePassBtn.style.color = "#7a0c16";
            }
        }
    });
}

// =============================
// 📱📧 التبديل بين الهاتف والبريد
// =============================
function switchToPhone(e){
    if(e) e.preventDefault();
    
    const emailContainer = document.getElementById("emailContainer");
    const phoneContainer = document.getElementById("phoneContainer");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    
    if(emailContainer) emailContainer.style.display = "none";
    if(phoneContainer) phoneContainer.style.display = "flex";
    
    if(phoneInput) phoneInput.required = true;
    if(emailInput){
        emailInput.required = false;
        emailInput.value = "";
    }
}

function switchToEmail(e){
    if(e) e.preventDefault();
    
    const emailContainer = document.getElementById("emailContainer");
    const phoneContainer = document.getElementById("phoneContainer");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    
    if(phoneContainer) phoneContainer.style.display = "none";
    if(emailContainer) emailContainer.style.display = "flex";
    
    if(emailInput) emailInput.required = true;
    if(phoneInput){
        phoneInput.required = false;
        phoneInput.value = "";
    }
}

// ربط الدوال بالأزرار (إذا موجودة)
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
// 📅 دالة مساعدة: تحويل الشهر من نص لرقم
// =============================
function getMonthNumber(monthName) {
    const months = {
        'يناير': '01', 'فبراير': '02', 'مارس': '03', 'أبريل': '04',
        'مايو': '05', 'يونيو': '06', 'يوليو': '07', 'أغسطس': '08',
        'سبتمبر': '09', 'أكتوبر': '10', 'نوفمبر': '11', 'ديسمبر': '12',
        // دعم الأرقام مباشرة إذا كانت موجودة
        '1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06',
        '7': '07', '8': '08', '9': '09', '10': '10', '11': '11', '12': '12'
    };
    return months[monthName] || '01'; // القيمة الافتراضية 01 إذا ما لقيناش
}

// =============================
// 📤 إرسال الفورم
// =============================
const registerForm = document.getElementById("registerForm");

if(registerForm){
    registerForm.addEventListener("submit", async function(e){
        
        // 🔹 منع الإرسال التقليدي
        e.preventDefault();
        e.stopPropagation();
        
        console.log("🚀 بدء عملية التسجيل...");
        
        // 🔹 1. جمع البيانات الأساسية
        const name = document.getElementById("name")?.value.trim() || "";
        const gender = document.getElementById("gender")?.value || "";
        
        // 🔹 2. تاريخ الميلاد بصيغة رقمية (YYYY-MM-DD) لـ Laravel
        const day = document.getElementById("birthDay")?.value || "";
        const monthName = document.getElementById("birthMonth")?.value || "";
        const year = document.getElementById("birthYear")?.value || "";
        
        // تحويل الشهر لرقم
        const month = getMonthNumber(monthName);
        const birthDate = `${year}-${month}-${day}`; // مثال: 2000-01-15
        
        const password = document.getElementById("password")?.value || "";
        const passwordConfirmation = document.getElementById("passwordConfirm")?.value || "";
        
        // 🔹 3. التحقق من ت