#!/bin/bash
php artisan config:clear
php artisan migrate --force
php artisan storage:link
php artisan db:seed --force --class=DatabaseSeeder || true
php artisan serve --host 0.0.0.0 --port $PORT