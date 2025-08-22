@echo off
echo 🃏 MTG Collection Tracker - PWA Server
echo =====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    echo.
    pause
    exit /b 1
)

echo ✅ Python found
echo 🚀 Starting local HTTPS server...
echo.
echo 📱 Once started, open https://localhost:8443 in your browser
echo ⚠️  You may need to accept the security warning for the self-signed certificate
echo.
echo 🛑 Press Ctrl+C to stop the server
echo =====================================
echo.

REM Start the Python server
python serve.py

echo.
echo 👋 Server stopped
pause
