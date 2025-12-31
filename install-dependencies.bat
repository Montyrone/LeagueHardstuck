@echo off
echo Installing SummonerSense Dependencies...
echo.

echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Backend dependency installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Frontend dependency installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo All dependencies installed successfully!
pause

