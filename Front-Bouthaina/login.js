// إظهار / إخفاء كلمة المرور
function togglePassword(){
    const pass = document.getElementById("password");
    pass.type = pass.type === "password" ? "text" : "password";
}

// تأثير عند الضغط على زر الدخول
document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();
    const btn = document.querySelector(".btn-primary");
    btn.innerText = "جاري الدخول...";
    btn.style.opacity = "0.8";
});

// تبديل بين البريد والهاتف
function toggleContact(){
    const type = document.getElementById("contactType").value;
    const emailBox = document.getElementById("emailBox");
    const phoneBox = document.getElementById("phoneBox");

    if(type === "email"){
        emailBox.style.display = "block";
        phoneBox.style.display = "none";
    }else{
        emailBox.style.display = "none";
        phoneBox.style.display = "flex";
    }
}