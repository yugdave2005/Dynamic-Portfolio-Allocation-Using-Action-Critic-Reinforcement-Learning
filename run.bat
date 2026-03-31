@echo off
echo ========================================================
echo       DALAL.AI — Live Actor-Critic Optimizer
echo ========================================================
echo.

cd /d d:\RL\frontend\

:: Check if port 8000 is already in use
netstat -ano | find "LISTENING" | find ":8000" >nul
if %errorlevel% equ 0 (
    echo [INFO] Local server is already running on port 8000.
) else (
    echo [INFO] Starting local Python HTTP server on port 8000...
    start /B python -m http.server 8000 >nul 2>&1
    :: Give the server a moment to spin up
    timeout /t 2 /nobreak >nul
)

echo [INFO] Launching dashboard in your default web browser...
start http://localhost:8000/dalal_live_rl.html

echo.
echo [SUCCESS] Dashboard is live! You can safely leave this window open.
echo To stop the server later, just close this command prompt window.
pause
