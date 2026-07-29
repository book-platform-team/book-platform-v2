/* ========================================
   ⚙️ مكتبة سامي الرقمية - رفع كتاب
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // التحقق من تسجيل الدخول
    const auth_token = localStorage.getItem('auth_token');
    if (!auth_token) {
        window.location.href = '/login.html';
        return;
    }
    
    // عناصر النموذج
    const uploadForm = document.getElementById('uploadBookForm');
    const fileInput = document.getElementById('files');
    const fileList = document.getElementById('fileList');
    const formAlert = document.getElementById('formAlert');
    const alertMessage = document.getElementById('alertMessage');
    const uploadStatus = document.getElementById('uploadStatus');
    const progressFill = document.getElementById('progressFill');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const submitBtn = document.getElementById('submitBtn');
    
    // عرض الملفات المختارة
    fileInput?.addEventListener('change', function() {
        fileList.innerHTML = '';
        Array.from(this.files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class='bx bx-file'></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <i class='bx bx-x remove-file' onclick="this.parentElement.remove()"></i>
            `;
            fileList.appendChild(fileItem);
        });
    });
    
    // دالة تنسيق حجم الملف
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // إرسال النموذج
    uploadForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // التحقق من التوكن
        const token = localStorage.getItem('auth_token');
        if (!token) {
            showAlert('يجب تسجيل الدخول أولاً', 'error');
            return;
        }
        
        // التحقق من الملفات
        const files = fileInput.files;
        if (files.length === 0) {
            showAlert('الرجاء اختيار ملف للكتاب', 'error');
            return;
        }
        
        // التحقق من نوع الملف
        const allowedTypes = ['application/pdf', 'application/epub+zip'];
        for (let file of files) {
            if (!allowedTypes.includes(file.type)) {
                showAlert('نوع الملف غير مدعوم. استخدم PDF أو EPUB فقط', 'error');
                return;
            }
        }
        
        // إظهار حالة التحميل
        uploadStatus.style.display = 'block';
        submitBtn.disabled = true;
        formAlert.style.display = 'none';
        
        try {
            // تحضير البيانات بنفس الأسماء تاع بسمة ✅
            const formData = new FormData();
            formData.append('title', document.getElementById('title').value.trim());
            formData.append('description', document.getElementById('description').value.trim());
            
            // ✅ مهم: files[] بنفس الاسم اللي قالته بسمة
            for (let file of files) {
                formData.append('files[]', file);
            }
            
            // إرسال للـ Backend
            const response = await fetch('/books', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                    // لا تضع Content-Type مع FormData، المتصفح يضيفه تلقائياً
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // ✅ النجاح: الكتاب في حالة "pending"
                showAlert('تم رفع كتابك بنجاح! في انتظار مراجعة الأدمن', 'success');
                uploadForm.style.display = 'none';
                uploadStatus.style.display = 'none';
                uploadSuccess.style.display = 'block';
                
                // تحديث عداد الإشعارات
                updateNotificationCount();
            } else {
                showAlert('خطأ: ' + (result.message || 'تعذر رفع الكتاب'), 'error');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('حدث خطأ في الاتصال بالسيرفر', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });
    
    // عرض الرسائل
    function showAlert(message, type) {
        formAlert.className = `alert alert-${type}`;
        alertMessage.textContent = message;
        formAlert.style.display = 'flex';
        
        if (type === 'success') {
            setTimeout(() => { formAlert.style.display = 'none'; }, 5000);
        }
    }
    
    // تحديث عداد الإشعارات
    async function updateNotificationCount() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/notifications/count', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.count) {
                document.getElementById('notifCount').textContent = data.count;
            }
        } catch (e) {
            console.log('Could not fetch notifications');
        }
    }
    
    // تسجيل الخروج
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        window.location.href = 'index.html';
    });
    
    // تحميل معلومات المستخدم
    async function loadUserInfo() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/user/profile', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await response.json();
            if (data.user) {
                document.getElementById('userInitial').textContent = 
                    data.user.name.charAt(0) || 'أ';
            }
        } catch (e) {
            console.log('Could not load user info');
        }
    }
    
    loadUserInfo();
    updateNotificationCount();
});