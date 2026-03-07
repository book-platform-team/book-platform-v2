// ===== إرسال الفورم (النسخة النهائية مع Laravel) =====
const registerForm = document.getElementById("registerForm");

// رابط الـ API الحقيقي
const API_URL = "http://127.0.0.1:8000/api/register";

if(registerForm){
    registerForm.addEventListener("submit", async function(e){
        
        // 🔹 منع الإرسال التقليدي للفورم
        e.preventDefault();
        e.stopPropagation();
        
        console.log("🚀 بدء عملية التسجيل...");

        // 🔹 2. جمع البيانات
        const data = {
            name: document.getElementById("name")?.value || "",
            gender: document.getElementById("gender")?.value || "",
            birth_date: (document.getElementById("birthYear")?.value || "") + "-" + 
                       (document.getElementById("birthMonth")?.value || "") + "-" + 
                       (document.getElementById("birthDay")?.value || ""),
            password: document.getElementById("password")?.value || "",
            password_confirmation: document.getElementById("passwordConfirm")?.value || ""
        };
        
        // 🔹 3. إضافة حقل الاتصال (هاتف أو بريد)
        const phoneContainer = document.getElementById("phoneContainer");
        if(phoneContainer && phoneContainer.style.display === "none"){
            // وضع البريد الإلكتروني
            data.email = document.getElementById("emailInput")?.value || "";
        } else {
            // وضع الهاتف
            const code = document.getElementById("countryCode")?.value || "";
            const phone = document.getElementById("phoneInput")?.value || "";
            data.phone = (code + " " + phone).trim();
        }
        
        console.log("📦 البيانات المرسلة:", data);
        
        // 🔹 4. إعدادات الطلب لـ Laravel
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
        
        console.log("🌐 جاري الاتصال بـ:", API_URL);
        
        // 🔹 5. الإرسال للـ Laravel
        try {
            const response = await fetch(API_URL, fetchOptions);
            
            console.log("📡 حالة الرد:", response.status, response.statusText);
            
            // محاولة قراءة الرد كـ JSON
            let result;
            try {
                result = await response.json();
            } catch(e) {
                // إذا ما كانش الرد JSON (مثلاً خطأ 500)
                result = { message: await response.text() };
            }
            
            console.log("📥 الرد من Laravel:", result);
            
            // 🔹 6. معالجة النتيجة
            if(response.ok) {
                // ✅ نجاح
                alert("✅ " + (result.message || "تم إنشاء الحساب بنجاح!"));
                
                // إذا فيه توكن، احفظيه
                if(result.token) {
                    localStorage.setItem("authToken", result.token);
                }
                
                // توجيه لصفحة الدخول
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
                // ❌ غير مصرح
                alert("❌ " + (result.message || "غير مصرح لك بالوصول"));
                
            } else {
                // ❌ خطأ آخر
                alert("❌ " + (result.message || "حدث خطأ غير متوقع"));
            }
            
        } catch(error) {
            console.error("❌ خطأ في الاتصال:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // رسائل خطأ مفيدة للمستخدم
            if(error.message.includes("Failed to fetch")) {
                alert("⚠️ تعذر الاتصال بالسيرفر!\n\nتأكدي من:\n1. الـ Laravel شغّال (php artisan serve)\n2. العنوان صحيح: " + API_URL + "\n3. CORS مفعّل في config/cors.php");
            } else {
                alert("❌ خطأ: " + error.message);
            }
        }
        
    });
}