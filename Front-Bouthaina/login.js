const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".btn-primary");
const togglePassBtn = document.getElementById("togglePassBtn");

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
loginForm.addEventListener("submit", function(e){
    e.preventDefault();

    // تحديد نوع الاتصال وقيمته
    const contactType = document.getElementById('phoneContainer').style.display === 'none' ? 'email' : 'phone';
    const contactValue = contactType === 'phone' 
        ? document.getElementById('countryCode').value + document.getElementById('phoneInput').value
        : document.getElementById('emailInput').value;
    
    const password = document.getElementById('password').value;

    // تعطيل الزر مؤقتاً
    loginBtn.innerText = "جاري الدخول...";
    loginBtn.style.opacity = "0.8";

    const data = {
        [contactType]: contactValue,
        password: password
    };

    fetch("http://127.0.0.1:8000/api/login", {
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
            localStorage.setItem("authToken", response.token);
            alert("✅ تم تسجيل الدخول بنجاح!");
            window.location.href = "Library.html";
        } else {
            alert(response.message || "❌ البريد أو كلمة المرور خاطئة");
            loginBtn.innerText = "تسجيل الدخول";
            loginBtn.style.opacity = "1";
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ حدث خطأ. حاول مرة أخرى.");
        loginBtn.innerText = "تسجيل الدخول";
        loginBtn.style.opacity = "1";
    });
});