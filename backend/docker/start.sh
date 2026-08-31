#!/bin/bash
set -e

echo "=== Starting Laravel Application ==="

# Cache config untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Buat symlink storage
php artisan storage:link || true

# Jalankan migrasi (jika ada yang baru)
php artisan migrate --force || true

echo "=== Starting PHP-FPM ==="
php-fpm -D

echo "=== Configuring Nginx Port ==="
# Railway injects $PORT, if not set default to 8080
export PORT=${PORT:-8080}
sed -i "s/listen 10000;/listen ${PORT};/g" /etc/nginx/sites-available/default

echo "=== Starting Nginx ==="
nginx -g "daemon off;"
