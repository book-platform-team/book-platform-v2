const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".btn-primary");

function showToast(msg, type="success"){
    let toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(()=> toast.remove(), 3000);
}

// إظهار/إخفاء كلمة المرور
togglePassBtn.addEventListener("click", function(e){
    e.preventDefault();
    const pass = document.getElementById("password");
    if(pass.type === "password"){
        pass.type = "text";
        togglePassBtn.innerText = "إخفاء";
        togglePassBtn.style.color = "#c31432";
    } else {
        pass.type = "password";
        togglePassBtn.innerText = "إظهار";
        togglePassBtn.style.color = "#7a0c16";
    }
});

// التبديل بين البريد والهاتف
function switchToPhone(e) {
    if(e) e.preventDefault();
    document.getElementById('emailContainer').style.display = 'none';
    document.getElementById('phoneContainer').style.display = 'flex';
    document.getElementById('phoneInput').required = true;
    document.getElementById('emailInput').required = false;
    document.getElementById('emailInput').value = '';
}

function switchToEmail(e) {
    if(e) e.preventDefault();
    document.getElementById('phoneContainer').style.display = 'none';
    document.getElementById('emailContainer').style.display = 'flex';
    document.getElementById('emailInput').required = true;
    document.getElementById('phoneInput').required = false;
    document.getElementById('phoneInput').value = '';
}

// تحسين قائمة الدول
const countryCode = document.getElementById('countryCode');
if(countryCode) {
    countryCode.addEventListener('focus', function() { this.size = 10; });
    countryCode.addEventListener('blur', function() { this.size = 1; });
    countryCode.addEventListener('change', function() { this.size = 1; });
}

// معالجة الفورم وإرسال البيانات للـ API
registerForm.addEventListener("submit", function(e){
    e.preventDefault();

    // التحقق من الكابتشا أولاً
    const inputCaptcha = document.getElementById("captchaInput").value.trim();
    const codeCaptcha = document.getElementById("captchaCode").innerText.trim();
    if(inputCaptcha !== codeCaptcha){
        alert("❌ رمز التحقق غير صحيح!");
        generateCaptcha();
        return;
    }

    // تحديد نوع الاتصال وقيمته
    const contactType = document.getElementById('phoneContainer').style.display === 'none' ? 'email' : 'phone';
    const contactValue = contactType === 'phone' 
        ? document.getElementById('countryCode').value + document.getElementById('phoneInput').value
        : document.getElementById('emailInput').value;
    
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    // التحقق من كلمة المرور
    if(password !== passwordConfirm){
        alert("❌ كلمة المرور غير مطابقة");
        return;
    }

    // تعطيل الزر مؤقتاً
    registerBtn.innerText = "جاري التسجيل...";
    registerBtn.style.opacity = "0.8";

    const data = {
        [contactType]: contactValue,
        password: password,
        password_confirmation: passwordConfirm
    };

    fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        console.log(response);

        if(response.token){
            // تسجيل ناجح
            localStorage.setItem("authToken", response.token);
            alert("✅ تم إنشاء الحساب بنجاح!");

            // إعادة توجيه للـ login page
            window.location.href = "Library.html";
        } else {
            alert(response.message || "❌ حدث خطأ في التسجيل");
            registerBtn.innerText = "إنشاء حساب";
            registerBtn.style.opacity = "1";
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ حدث خطأ. حاول مرة أخرى.");
        registerBtn.innerText = "إنشاء حساب";
        registerBtn.style.opacity = "1";
    });
});