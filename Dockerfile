FROM php:8.2-cli

# تثبيت الإضافات المطلوبة لـ Laravel + PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip intl \
    && rm -rf /var/lib/apt/lists/*

# تثبيت Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# نسخ ملفات المشروع
COPY . .

# إنشاء مجلدات Laravel المطلوبة قبل تشغيل Composer
RUN mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    bootstrap/cache

# إعطاء Laravel صلاحية الكتابة
RUN chmod -R 775 storage bootstrap/cache

# تثبيت الاعتماديات
RUN composer install --optimize-autoloader --no-dev

# نسخ سكريبت التشغيل وإعطاؤه صلاحية التنفيذ
COPY start.sh /var/www/html/start.sh
RUN chmod +x /var/www/html/start.sh

EXPOSE 10000

CMD ["/var/www/html/start.sh"]