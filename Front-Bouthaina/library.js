/* جلب العناصر */

let menuBtn = document.getElementById("menuBtn");

let menu = document.getElementById("menu");

let closeMenu = document.getElementById("closeMenu");



/* فتح القائمة */

menuBtn.onclick = function(){

menu.style.display = "flex";

}



/* غلق القائمة */

closeMenu.onclick = function(){

menu.style.display = "none";

}

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
