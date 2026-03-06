// كلمة المرور
function togglePassword(){
    const pass = document.getElementById("password");
    pass.type = pass.type === "password" ? "text" : "password";
}

// الكابتشا
function generateCaptcha() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for(let i=0;i<6;i++){
        code += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    document.getElementById("captchaCode").innerText = code;
}

// عند تحميل الصفحة
generateCaptcha();

// زر إعادة الكابتشا
document.getElementById("reloadCaptcha").addEventListener("click", generateCaptcha);

// تحقق عند التسجيل
document.getElementById("registerForm").addEventListener("submit", function(e){
    e.preventDefault();
    const input = document.getElementById("captchaInput").value.trim();
    const code = document.getElementById("captchaCode").innerText.trim();
    if(input !== code){
        alert("رمز التحقق غير صحيح!");
        generateCaptcha();
        return false;
    }
    alert("تم التسجيل بنجاح!");
});

// التبديل إلى الهاتف
function switchToPhone() {
    document.getElementById('emailContainer').style.display = 'none';
    document.getElementById('phoneContainer').style.display = 'flex';
    
    document.getElementById('phoneInput').required = true;
    document.getElementById('emailInput').required = false;
}

// التبديل إلى البريد
function switchToEmail() {
    document.getElementById('phoneContainer').style.display = 'none';
    document.getElementById('emailContainer').style.display = 'flex';
    
    document.getElementById('emailInput').required = true;
    document.getElementById('phoneInput').required = false;
}

// زيد هذا الكود باش المستخدم يقدر يبحث على الدولة
document.getElementById('countryCode').addEventListener('change', function() {
    this.size = 1; // ترجع القائمة صغيرة بعد الاختيار
});

// باش تفتح القائمة كبيرة لما تضغط عليها
document.getElementById('countryCode').addEventListener('focus', function() {
    this.size = 10; // تظهر 10 دول في نفس الوقت
});