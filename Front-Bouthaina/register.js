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

// البريد / الهاتف داخل نفس المربع
let contactType = "email";
function toggleContact(){
    const input = document.getElementById("contactInput");
    const codeSelect = document.getElementById("countryCode");

    if(contactType === "email"){
        contactType = "phone";
        input.placeholder = "رقم الهاتف";
        input.type = "tel";
        codeSelect.style.display = "inline-block";
    } else {
        contactType = "email";
        input.placeholder = "البريد الإلكتروني";
        input.type = "email";
        codeSelect.style.display = "none";
    }
}