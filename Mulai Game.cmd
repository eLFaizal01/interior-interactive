@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Pasang Node.js sebelum menjalankan game.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Komponen game belum terpasang. Jalankan npm install di folder ini dahulu.
  pause
  exit /b 1
)
echo.
echo Ayo Lengkapi Ruangan!
echo Buka http://127.0.0.1:5173 setelah tulisan Local muncul.
echo Biarkan jendela ini terbuka selama bermain.
echo Tekan Ctrl+C untuk menghentikan game.
echo.
call npm run dev
pause
