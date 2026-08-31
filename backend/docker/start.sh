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

echo "=== Starting Nginx ==="
nginx -g "daemon off;"
