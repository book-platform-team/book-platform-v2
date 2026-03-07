// =============================
// 🔧 إعدادات الروابط
// =============================
// ✅ إلى هذا
const CONFIG = {
    DEBUG: false,
    API_URL: "https://book-platform-production.up.railway.app/api/register", // بدون مسافات في النهاية!
};

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
        
        // 🔹 3. التحقق من تطابق كلمة المرور
        if(password !== passwordConfirmation){
            alert("❌ كلمة المرور غير متطابقة");
            return;
        }
        
        // 🔹 4. تحديد نوع الاتصال وقيمته
        const phoneContainer = document.getElementById("phoneContainer");
        let contactType, contactValue;
        
        if(phoneContainer && phoneContainer.style.display === "none"){
            // وضع البريد الإلكتروني
            contactType = "email";
            contactValue = document.getElementById("emailInput")?.value.trim() || "";
        } else {
            // وضع الهاتف
            contactType = "phone";
            const code = document.getElementById("countryCode")?.value || "";
            const phone = document.getElementById("phoneInput")?.value.trim() || "";
            contactValue = (code + " " + phone).trim();
        }
        
        // 🔹 5. تجميع البيانات النهائية
        const data = {
            name: name,
            gender: gender,
            birth_date: birthDate,  // ✅ صيغة رقمية جاهزة لـ Laravel
            password: password,
            password_confirmation: passwordConfirmation
        };
        
        // إضافة حقل الاتصال ديناميكياً (إما email أو phone)
        data[contactType] = contactValue;
        
        console.log("📦 البيانات المرسلة:", data);
        console.log("📅 تاريخ الميلاد بعد التحويل:", birthDate);
        
        // 🔹 6. تحديد الرابط (تجريبي أو حقيقي)
        const endpoint = CONFIG.DEBUG ? CONFIG.TEST_URL : CONFIG.API_URL;
        
        // 🔹 7. إعدادات الطلب
        const fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"  // ⭐ مهم جداً لـ Laravel
            },
            body: JSON.stringify(data),
            mode: "cors",
            cache: "no-cache"
        };
        
        console.log("🌐 جاري الاتصال بـ:", endpoint);
        
        // 🔹 8. تعطيل الزر مؤقتاً
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.innerText || "إنشاء حساب";
        
        if(submitBtn){
            submitBtn.innerText = "جاري الإنشاء...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.8";
        }
        
        // 🔹 9. الإرسال
        try {
            const response = await fetch(endpoint, fetchOptions);
            
            console.log("📡 حالة الرد:", response.status, response.statusText);
            
            // قراءة الرد كـ JSON
            let result;
            try {
                result = await response.json();
            } catch(e) {
                result = { message: await response.text().catch(() => 'خطأ غير معروف') };
            }
            
            console.log("📥 الرد:", result);
            
            // 🔹 10. معالجة النتيجة
            if(CONFIG.DEBUG) {
                // ✅ وضع الاختبار مع httpbin
                if(result.json || response.ok) {
                    console.log("✅ البيانات وصلت:", result.json || result);
                    alert("✅ تم الإرسال بنجاح!\nشوفي Console باش تشوفي التفاصيل");
                    
                    // محاكاة النجاح للتجربة
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1500);
                }
            } else {
                // ✅ وضع الإنتاج مع Laravel
                if(response.ok) {
                    alert("✅ " + (result.message || "تم إنشاء الحساب بنجاح!"));
                    
                    if(result.token) {
                        localStorage.setItem("authToken", result.token);
                    }
                    
                    window.location.href = "login.html";
                    
                } else if(response.status === 422) {
                    // ❌ أخطاء التحقق من Laravel
                    let errorMsg = "❌ يرجى تصحيح الأخطاء:\n";
                    if(result.errors) {
                        for(let field in result.errors) {
                            errorMsg += "• " + result.errors[field][0] + "\n";
                        }
                    }
                    alert(errorMsg);
                    
                } else if(response.status === 401 || response.status === 403) {
                    alert("❌ " + (result.message || "غير مصرح"));
                    
                } else {
                    alert("❌ " + (result.message || "حدث خطأ غير متوقع"));
                }
            }
            
        } catch(error) {
            console.error("❌ خطأ في الاتصال:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            if(CONFIG.DEBUG) {
                alert("⚠️ فشل الاتصال، لكن البيانات جاهزة:\n" + JSON.stringify(data, null, 2));
            } else {
                if(error.message.includes("Failed to fetch")) {
                    alert("⚠️ تعذر الاتصال بالسيرفر!\n\nتأكدي من:\n1. Laravel شغّال (php artisan serve)\n2. العنوان صحيح: " + CONFIG.API_URL + "\n3. CORS مفعل في config/cors.php");
                } else {
                    alert("❌ خطأ: " + error.message);
                }
            }
            
        } finally {
            // 🔹 11. إعادة الزر لحالته
            if(submitBtn){
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        }
        
    });
}