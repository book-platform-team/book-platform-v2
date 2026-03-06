/* عند الضغط على البحث */

document.querySelector(".search-box button").onclick = function(){

/* جلب النص من حقل البحث */

let text = document.querySelector(".search-box input").value;

/* تحقق اذا الحقل فارغ */

if(text === ""){

alert("اكتب اسم كتاب للبحث");

}

else{

alert("جاري البحث عن: " + text);

}

}
