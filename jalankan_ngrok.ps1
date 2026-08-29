Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Menjalankan Ngrok Tunnel..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

& "C:\laragon\www\Tim Pembina Posyandu Desa Tubanan\ngrok.exe" http --url=parabola-feminism-elective.ngrok-free.dev 8000
