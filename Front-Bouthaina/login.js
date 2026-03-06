// إظهار/إخفاء كلمة المرور
function togglePassword(e){
    if(e) e.preventDefault(); // منع إرسال الفورم بالغلط
    const pass = document.getElementById("password");
    pass.type = pass.type === "password" ? "text" : "password";
}
function togglePassword(){
    const pass = document.getElementById("password");
    const toggleBtn = document.getElementById("togglePassBtn");
    
    // تأثير بسيط عند التبديل
    toggleBtn.style.opacity = "0.6";
    setTimeout(() => toggleBtn.style.opacity = "1", 150);
    
    if(pass.type === "password"){
        pass.type = "text";
        toggleBtn.innerText = "إخفاء";
        toggleBtn.style.color = "#c31432"; // لون أحمر لما تكون ظاهرة
    } else {
        pass.type = "password";
        toggleBtn.innerText = "إظهار";
        toggleBtn.style.color = "#7a0c16"; // لون عادي
    }
}

// التبديل إلى الهاتف
function switchToPhone(e) {
    if(e) e.preventDefault();
    document.getElementById('emailContainer').style.display = 'none';
    document.getElementById('phoneContainer').style.display = 'flex';
    document.getElementById('phoneInput').required = true;
    document.getElementById('emailInput').required = false;
    document.getElementById('emailInput').value = ''; // مسح الحقل القديم
}

// التبديل إلى البريد
function switchToEmail(e) {
    if(e) e.preventDefault();
    document.getElementById('phoneContainer').style.display = 'none';
    document.getElementById('emailContainer').style.display = 'flex';
    document.getElementById('emailInput').required = true;
    document.getElementById('phoneInput').required = false;
    document.getElementById('phoneInput').value = ''; // مسح الحقل القديم
}

// تحسين قائمة الدول (اختياري)
const countryCode = document.getElementById('countryCode');
if(countryCode) {
    countryCode.addEventListener('focus', function() { this.size = 10; });
    countryCode.addEventListener('blur', function() { this.size = 1; });
    countryCode.addEventListener('change', function() { this.size = 1; });
}

// معالجة الفورم
document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();
    
    // جمع البيانات
    const contactType = document.getElementById('phoneContainer').style.display === 'none' ? 'email' : 'phone';
    const contactValue = contactType === 'phone' 
        ? countryCode.value + ' ' + document.getElementById('phoneInput').value
        : document.getElementById('emailInput').value;
    
    console.log("نوع الاتصال:", contactType);
    console.log("القيمة:", contactValue);
    
    const btn = document.querySelector(".btn-primary");
    btn.innerText = "جاري الدخول...";
    btn.style.opacity = "0.8";
    
    // هنا ترسل البيانات للسيرفر
    setTimeout(() => {
        alert("✅ تم تسجيل الدخول بنجاح!");
        btn.innerText = "تسجيل الدخول";
        btn.style.opacity = "1";
    }, 1500);
});