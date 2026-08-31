FROM php:8.2-cli

# تثبيت الإضافات المطلوبة لـLaravel + PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# تثبيت Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# نسخ ملفات المشروع
COPY . .

# تثبيت الاعتماديات
RUN composer install --optimize-autoloader --no-dev

# صلاحيات storage و bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# نسخ سكريبت التشغيل وإعطاؤه صلاحية التنفيذ
COPY start.sh /var/www/html/start.sh
RUN chmod +x /var/www/html/start.sh

EXPOSE 10000

CMD ["/var/www/html/start.sh"]