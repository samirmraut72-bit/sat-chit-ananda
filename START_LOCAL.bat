@echo off
title Sat-Chit-Ananda Production Website
echo.
echo ===============================================
echo   SAT-CHIT-ANANDA PRODUCTION WEBSITE
echo ===============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js was not found.
  echo Install Node.js 20.9 or newer and run this file again.
  pause
  exit /b 1
)

if not exist .env.local (
  echo ERROR: .env.local was not found.
  echo Copy .env.example to .env.local and add your Supabase keys.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages...
  call npm install
  if %errorlevel% neq 0 (
    echo Package installation failed.
    pause
    exit /b 1
  )
)

echo Starting website at http://localhost:3000
echo Keep this window open.
echo.
call npm run dev
pause
