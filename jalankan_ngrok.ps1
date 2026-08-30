Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Menjalankan Ngrok Tunnel..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$ngrok = "C:\Users\ASUS\ngrok-bin\ngrok.exe"

if (-not (Test-Path $ngrok)) {
    Write-Host "ERROR: ngrok.exe tidak ditemukan!" -ForegroundColor Red
    pause; exit
}

Write-Host ""
Write-Host "Tunnel aktif: https://parabola-feminism-elective.ngrok-free.dev" -ForegroundColor Green
Write-Host "Pastikan Laragon sudah berjalan di port 8000!" -ForegroundColor Yellow
Write-Host ""
& $ngrok http --url=parabola-feminism-elective.ngrok-free.dev 8000
