document.addEventListener("DOMContentLoaded", () => {
    // كل الكود القديم كما هو، بدون تعديل أي خاصية
    // + search modal يعمل الآن لأن كل العناصر موجودة
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchModalClose = document.getElementById("searchModalClose");
    const modalSearchInput = document.getElementById("modalSearchInput");
    const searchBtnLarge = document.querySelector(".search-btn-large");

    const allSearchTriggers = document.querySelectorAll(".search-trigger, .search-icon-btn");
    allSearchTriggers.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if(searchModalOverlay) {
                searchModalOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
                setTimeout(() => modalSearchInput?.focus(), 300);
            }
        });
    });

    if(searchModalClose && searchModalOverlay) {
        searchModalClose.addEventListener("click", () => {
            searchModalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    if(searchModalOverlay) {
        searchModalOverlay.addEventListener("click", (e) => {
            if(e.target === searchModalOverlay) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
        document.addEventListener("keydown", (e) => {
            if(e.key === "Escape" && searchModalOverlay.classList.contains("active")) {
                searchModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    if(searchBtnLarge && modalSearchInput) {
        searchBtnLarge.addEventListener("click", () => {
            const query = modalSearchInput.value.trim();
            if(query) {
                searchBtnLarge.innerHTML = '<i class="bx bx-check"></i> تم';
                setTimeout(() => {
                    searchBtnLarge.innerHTML = '<i class="bx bx-search"></i><span>بحث</span>';
                    searchModalOverlay.classList.remove("active");
                    document.body.style.overflow = "";
                }, 1500);
            }
        });
        modalSearchInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter") {
                const query = modalSearchInput.value.trim();
                if(query) searchBtnLarge.click();
            }
        });
    }

    // باقي الكود القديم كما هو
});