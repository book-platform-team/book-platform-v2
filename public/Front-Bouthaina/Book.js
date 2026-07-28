/* ========================================
   ⚙️ مكتبة سامي الرقمية - صفحة تفاصيل الكتاب
   التعامل مع الـ API (مراجعات، اقتباسات، تقييمات)
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // الحصول على معرف الكتاب من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        console.error('❌ لم يتم تحديد معرف الكتاب في الرابط');
        return;
    }
    
    // تحميل كل البيانات عند فتح الصفحة
    loadBookDetails(bookId);
    loadReviews(bookId);
    loadQuotes(bookId);
    loadSimilarBooks(bookId);
    
    // تفعيل أحداث النماذج
    setupReviewForm(bookId);
    setupQuoteForm(bookId);
    setupRatingInput(bookId);
    
    // تفعيل أزرار المشاركة
    setupShareButtons();
    
    // تفعيل التبويبات
    setupTabs();
    
    // تفعيل زر الصعود للأعلى
    setupScrollToTop();
    
    // تفعيل قائمة الجوال
    setupMobileNav();
    
    // تفعيل Modal البحث
    setupSearchModal();
});

/* ========================================
   📥 جلب تفاصيل الكتاب من الـ API
   ======================================== */

async function loadBookDetails(bookId) {
    try {
        const response = await fetch(`http://localhost:8000/api/books/${bookId}`);
        const data = await response.json();
        
        if (data.success && data.book) {
            displayBookDetails(data.book);
        }
    } catch (error) {
        console.error('Error loading book:', error);
        document.getElementById('bookTitle').textContent = 'حدث خطأ في التحميل';
    }
}

function displayBookDetails(book) {
    // المعلومات الأساسية
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookCategory').textContent = book.category;
    document.getElementById('bookYear').textContent = book.year || 'غير محدد';
    document.getElementById('bookDescription').textContent = book.description || 'لا يوجد وصف';
    
    // غلاف الكتاب
    if (book.cover_url) {
        document.getElementById('bookCover').src = book.cover_url;
        document.getElementById('sidebarBookCover').src = book.cover_url;
    }
    document.getElementById('sidebarBookTitle').textContent = book.title;
    
    // التقييم
    if (book.rating) {
        displayRating(book.rating.average, book.rating.count);
    }
    
    // الإحصائيات
    if (book.stats) {
        document.getElementById('searchCount').textContent = book.stats.searches?.toLocaleString('ar-DZ') || '0';
        document.getElementById('downloadCount').textContent = book.stats.downloads?.toLocaleString('ar-DZ') || '0';
        document.getElementById('readCount').textContent = book.stats.reads?.toLocaleString('ar-DZ') || '0';
    }
    
    // معلومات الكتاب التفصيلية
    document.getElementById('bookTitleInfo').textContent = book.title;
    document.getElementById('bookAuthorInfo').textContent = book.author;
    document.getElementById('categoryLink').textContent = book.category;
    document.getElementById('categoryLink').href = `/category/${book.category_id || '#'}`;
    document.getElementById('bookLanguageInfo').textContent = book.language || 'العربية';
    document.getElementById('bookPublisherInfo').textContent = book.publisher || 'غير محدد';
    document.getElementById('bookPublishDateInfo').textContent = formatDate(book.publish_date);
    document.getElementById('bookPagesInfo').textContent = book.pages || 'غير محدد';
    document.getElementById('bookFileSizeInfo').textContent = formatFileSize(book.file_size);
    document.getElementById('bookFileTypeInfo').textContent = book.file_type || 'PDF';
    document.getElementById('bookCreatedDateInfo').textContent = formatDate(book.created_at);
    
    if (book.popularity_rank) {
        document.getElementById('bookPopularityInfo').innerHTML = `
            <i class='bx bx-trophy'></i>
            رقم ${book.popularity_rank.toLocaleString('ar-DZ')} هو الأشهر!
        `;
    }
    
    // الرابط المختصر
    document.getElementById('shortLinkInput').value = `${window.location.origin}/book/${book.id}`;
    
    // عرض التقييم في قسم المعلومات
    if (book.rating) {
        displayRatingInfo(book.rating.average, book.rating.count);
    }
}

function displayRating(average, count) {
    const starsDisplay = document.getElementById('starsDisplay');
    const ratingValue = document.getElementById('ratingValue');
    const ratingCount = document.getElementById('ratingCount');
    
    ratingValue.textContent = average?.toFixed(1) || '0.0';
    ratingCount.textContent = `(${count?.toLocaleString('ar-DZ') || 0} تقييم)`;
    
    starsDisplay.innerHTML = '';
    const fullStars = Math.floor(average || 0);
    const hasHalfStar = (average || 0) % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= fullStars) {
            star.className = 'bx bxs-star';
        } else if (i === fullStars + 1 && hasHalfStar) {
            star.className = 'bx bxs-star-half';
        } else {
            star.className = 'bx bx-star';
        }
        starsDisplay.appendChild(star);
    }
}

function displayRatingInfo(average, count) {
    const ratingInfo = document.getElementById('bookRatingInfo');
    ratingInfo.innerHTML = '';
    
    const fullStars = Math.floor(average || 0);
    const hasHalfStar = (average || 0) % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        if (i <= fullStars) {
            star.className = 'bx bxs-star';
        } else if (i === fullStars + 1 && hasHalfStar) {
            star.className = 'bx bxs-star-half';
        } else {
            star.className = 'bx bx-star';
        }
        ratingInfo.appendChild(star);
    }
    
    const ratingText = document.createElement('span');
    ratingText.className = 'rating-text';
    ratingText.textContent = `(${count?.toLocaleString('ar-DZ') || 0} تقييمات)`;
    ratingInfo.appendChild(ratingText);
}

/* ========================================
   💬 جلب وعرض المراجعات من الـ API
   ======================================== */

async function loadReviews(bookId, page = 1) {
    const reviewsList = document.getElementById('reviewsList');
    
    try {
        const response = await fetch(`http://localhost:8000/api/books/${bookId}/reviews?page=${page}`);
        const data = await response.json();
        
        if (data.success) {
            if (page === 1) {
                reviewsList.innerHTML = '';
            }
            
            if (data.reviews && data.reviews.length > 0) {
                data.reviews.forEach(review => {
                    reviewsList.appendChild(createReviewElement(review));
                });
                
                document.getElementById('reviewsCount').textContent = data.total?.toLocaleString('ar-DZ') || '0';
                
                const loadMoreBtn = document.getElementById('loadMoreReviews');
                if (data.current_page < data.last_page) {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.onclick = () => loadReviews(bookId, page + 1);
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            } else if (page === 1) {
                reviewsList.innerHTML = '<p class="no-reviews">لا توجد مراجعات بعد. كن أول من يراجع!</p>';
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = '<p class="error">حدث خطأ في تحميل المراجعات</p>';
    }
}

function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const avatarContent = review.user_avatar 
        ? `<img src="${review.user_avatar}" alt="${review.user_name}">`
        : `<span>${review.user_name?.charAt(0) || 'م'}</span>`;
    
    div.innerHTML = `
        <div class="reviewer-info">
            <div class="reviewer-avatar">${avatarContent}</div>
            <div class="reviewer-details">
                <h4 class="reviewer-name">${review.user_name || 'مستخدم'}</h4>
                <div class="review-rating">
                    ${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}
                </div>
            </div>
            <span class="review-date">${formatDate(review.created_at)}</span>
        </div>
        <p class="review-text">${review.text || ''}</p>
        <div class="review-actions">
            <button class="btn-helpful" onclick="toggleHelpful(${review.id}, this)">
                <i class='bx bx-like'></i> مفيد (${review.helpful_count || 0})
            </button>
            <button class="btn-report" onclick="reportReview(${review.id})">
                <i class='bx bx-flag'></i> إبلاغ
            </button>
        </div>
    `;
    return div;
}

/* ========================================
   📝 إرسال مراجعة جديدة للـ API
   ======================================== */

function setupReviewForm(bookId) {
    const submitBtn = document.getElementById('submitReview');
    
    submitBtn?.addEventListener('click', async () => {
        const reviewText = document.getElementById('reviewText')?.value.trim();
        const token = localStorage.getItem('auth_token');
        
        if (!reviewText) {
            alert('الرجاء كتابة مراجعة');
            return;
        }
        
        if (!token) {
            alert('يجب تسجيل الدخول لإضافة مراجعة');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري النشر...';
            
            const response = await fetch(`http://localhost:8000/api/books/${bookId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: reviewText })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ تم نشر مراجعتك بنجاح!');
                document.getElementById('reviewText').value = '';
                loadReviews(bookId, 1);
            } else {
                alert('❌ ' + (result.message || 'حدث خطأ في نشر المراجعة'));
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('حدث خطأ في الاتصال بالسيرفر');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bx bx-send"></i> نشر المراجعة';
        }
    });
}

/* ========================================
   💭 جلب وعرض الاقتباسات من الـ API
   ======================================== */

async function loadQuotes(bookId) {
    const quotesList = document.getElementById('quotesList');
    
    try {
        const response = await fetch(`http://localhost:8000/api/books/${bookId}/quotes`);
        const data = await response.json();
        
        if (data.success) {
            quotesList.innerHTML = '';
            
            if (data.quotes && data.quotes.length > 0) {
                data.quotes.forEach(quote => {
                    quotesList.appendChild(createQuoteElement(quote));
                });
                document.getElementById('quotesCount').textContent = data.total?.toLocaleString('ar-DZ') || '0';
            } else {
                quotesList.innerHTML = '<p class="no-quotes">لا توجد اقتباسات بعد. أضف أول اقتباس!</p>';
            }
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
        quotesList.innerHTML = '<p class="error">حدث خطأ في تحميل الاقتباسات</p>';
    }
}

function createQuoteElement(quote) {
    const div = document.createElement('div');
    div.className = 'quote-item';
    
    const escapedText = (quote.text || '').replace(/'/g, "\\'");
    
    div.innerHTML = `
        <div class="quote-content">
            <i class='bx bxs-quote-alt-right quote-icon'></i>
            <p class="quote-text">"${quote.text || ''}"</p>
        </div>
        <div class="quote-footer">
            <span class="quote-author">— ${quote.user_name || 'مستخدم'}</span>
        </div>
        <div class="quote-actions">
            <button class="btn-copy-quote" onclick="copyQuote('${escapedText}')">
                <i class='bx bx-copy'></i> نسخ
            </button>
            <button class="btn-share-quote" onclick="shareQuote('${escapedText}')">
                <i class='bx bx-share'></i> مشاركة
            </button>
        </div>
    `;
    return div;
}

/* ========================================
   ✍️ إرسال اقتباس جديد للـ API
   ======================================== */

function setupQuoteForm(bookId) {
    const submitBtn = document.getElementById('submitQuote');
    
    submitBtn?.addEventListener('click', async () => {
        const quoteText = document.getElementById('quoteText')?.value.trim();
        const token = localStorage.getItem('auth_token');
        
        if (!quoteText) {
            alert('الرجاء كتابة اقتباس');
            return;
        }
        
        if (!token) {
            alert('يجب تسجيل الدخول لإضافة اقتباس');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري الإضافة...';
            
            const response = await fetch(`http://localhost:8000/api/books/${bookId}/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: quoteText })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ تم إضافة اقتباسك بنجاح!');
                document.getElementById('quoteText').value = '';
                loadQuotes(bookId);
            } else {
                alert('❌ ' + (result.message || 'حدث خطأ في إضافة الاقتباس'));
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
            alert('حدث خطأ في الاتصال بالسيرفر');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bx bx-plus"></i> إضافة اقتباس';
        }
    });
}

/* ========================================
   ⭐ إرسال تقييم للكتاب
   ======================================== */

function setupRatingInput(bookId) {
    const starsInput = document.querySelectorAll('#starsInput i');
    
    starsInput.forEach(star => {
        star.addEventListener('click', async function() {
            const rating = parseInt(this.dataset.rating);
            const token = localStorage.getItem('auth_token');
            
            if (!token) {
                alert('يجب تسجيل الدخول لتقييم الكتاب');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:8000/api/books/${bookId}/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ rating: rating })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    displayRating(result.new_average, result.total_ratings);
                    alert(`✅ شكراً لتقييمك! منحت ${rating} نجوم`);
                } else {
                    alert('❌ ' + (result.message || 'حدث خطأ في حفظ التقييم'));
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
                alert('حدث خطأ في الاتصال بالسيرفر');
            }
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    document.querySelector('.stars-input')?.addEventListener('mouseleave', () => {
        // يمكن إضافة كود لإعادة العرض الأصلي هنا
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#starsInput i');
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        star.className = starRating <= rating ? 'bx bxs-star active' : 'bx bx-star';
    });
}

/* ========================================
   📚 جلب الكتب المشابهة من الـ API
   ======================================== */

async function loadSimilarBooks(bookId) {
    const grid = document.getElementById('similarBooksGrid');
    
    try {
        const response = await fetch(`http://localhost:8000/api/books/${bookId}/similar?limit=4`);
        const data = await response.json();
        
        if (data.success && data.books && data.books.length > 0) {
            grid.innerHTML = '';
            data.books.forEach(book => {
                grid.appendChild(createSimilarBookCard(book));
            });
        } else {
            grid.innerHTML = '<p class="no-similar">لا توجد كتب مشابهة حالياً</p>';
        }
    } catch (error) {
        console.error('Error loading similar books:', error);
        grid.innerHTML = '<p class="error">حدث خطأ في التحميل</p>';
    }
}

function createSimilarBookCard(book) {
    const div = document.createElement('div');
    div.className = 'similar-book-card';
    div.onclick = () => window.location.href = `book-details.html?id=${book.id}`;
    
    div.innerHTML = `
        <img src="${book.cover_url || 'https://via.placeholder.com/150x220/7a0c16/ffffff?text=كتاب'}" alt="${book.title}">
        <h4>${book.title}</h4>
        <p>${book.author}</p>
        <div class="book-rating-small">
            <i class='bx bxs-star'></i>
            <span>${book.rating?.toFixed(1) || '0.0'}</span>
        </div>
    `;
    return div;
}

/* ========================================
   🔗 وظائف مساعدة
   ======================================== */

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatFileSize(bytes) {
    if (!bytes) return 'غير محدد';
    const kilobytes = bytes / 1024;
    if (kilobytes < 1024) {
        return `${kilobytes.toFixed(2)} كيلو بايت`;
    }
    const megabytes = kilobytes / 1024;
    return `${megabytes.toFixed(2)} ميجا بايت`;
}

function copyShortLink() {
    const shortLinkInput = document.getElementById('shortLinkInput');
    shortLinkInput.select();
    shortLinkInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(shortLinkInput.value).then(() => {
        const btnCopy = document.querySelector('.btn-copy');
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i class="bx bx-check"></i> تم النسخ';
        btnCopy.style.background = '#28a745';
        
        setTimeout(() => {
            btnCopy.innerHTML = originalText;
            btnCopy.style.background = '';
        }, 2000);
    }).catch(() => {
        alert('❌ حدث خطأ في نسخ الرابط');
    });
}

function copyQuote(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ تم نسخ الاقتباس!');
    }).catch(() => {
        alert('❌ حدث خطأ في النسخ');
    });
}

function shareQuote(text) {
    const shareText = encodeURIComponent(`"${text}" - من مكتبة سامي الرقمية`);
    const url = `https://twitter.com/intent/tweet?text=${shareText}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function toggleHelpful(reviewId, btn) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        alert('يجب تسجيل الدخول');
        return;
    }
    console.log('Mark review as helpful:', reviewId);
}

function reportReview(reviewId) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        alert('يجب تسجيل الدخول');
        return;
    }
    const reason = prompt('سبب الإبلاغ (اختياري):');
    console.log('Report review:', reviewId, reason);
    alert('✅ تم إرسال الإبلاغ، شكراً لمساعدتك!');
}

function setupShareButtons() {
    const bookTitle = document.getElementById('bookTitle')?.textContent || 'كتاب';
    const bookUrl = window.location.href;
    
    document.getElementById('shareFacebook')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookUrl)}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('shareTwitter')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(bookTitle)}&url=${encodeURIComponent(bookUrl)}`, '_blank', 'width=600,height=400');
    });
    
    document.getElementById('shareWhatsApp')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://wa.me/?text=${encodeURIComponent(bookTitle + ' - ' + bookUrl)}`, '_blank');
    });
    
    document.getElementById('copyLink')?.addEventListener('click', () => {
        navigator.clipboard.writeText(bookUrl).then(() => {
            alert('✅ تم نسخ الرابط!');
        });
    });
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId + 'Tab')?.classList.add('active');
        });
    });
}

function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 250) {
                scrollToTopBtn.classList.add('active');
            } else {
                scrollToTopBtn.classList.remove('active');
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function setupMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const closeMobileNav = document.getElementById('closeMobileNav');
    
    if (hamburgerBtn && mobileNavOverlay) {
        hamburgerBtn.addEventListener('click', () => {
            mobileNavOverlay.classList.add('active');
            hamburgerBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMobileNav && mobileNavOverlay) {
        closeMobileNav.addEventListener('click', () => {
            mobileNavOverlay.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', (e) => {
            if (e.target === mobileNavOverlay) {
                mobileNavOverlay.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

function setupSearchModal() {
    const searchModalOverlay = document.getElementById('searchModalOverlay');
    const searchModalClose = document.getElementById('searchModalClose');
    const modalSearchInput = document.getElementById('modalSearchInput');
    
    document.querySelectorAll('.search-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchModalOverlay) {
                searchModalOverlay.classList.add('active');
                setTimeout(() => modalSearchInput?.focus(), 300);
            }
        });
    });
    
    if (searchModalClose && searchModalOverlay) {
        searchModalClose.addEventListener('click', () => {
            searchModalOverlay.classList.remove('active');
        });
    }
    
    if (searchModalOverlay) {
        searchModalOverlay.addEventListener('click', (e) => {
            if (e.target === searchModalOverlay) {
                searchModalOverlay.classList.remove('active');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModalOverlay.classList.contains('active')) {
                searchModalOverlay.classList.remove('active');
            }
        });
    }
}

// دوال عامة للتصدير (إذا احتجتها في ملفات أخرى)
window.copyShortLink = copyShortLink;
window.copyQuote = copyQuote;
window.shareQuote = shareQuote;
window.toggleHelpful = toggleHelpful;
window.reportReview = reportReview;