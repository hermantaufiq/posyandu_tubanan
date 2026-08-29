@echo off
echo =========================================
echo Menjalankan Server Backend Posyandu
echo =========================================
start cmd /k "cd /d C:\laragon\www\Tim Pembina Posyandu Desa Tubanan\backend && php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3
echo =========================================
echo Menjalankan Ngrok
echo =========================================
start powershell -NoExit -ExecutionPolicy Bypass -File "C:\laragon\www\Tim Pembina Posyandu Desa Tubanan\jalankan_ngrok.ps1"
echo =========================================
echo Server dan Ngrok sudah berjalan!
echo =========================================
