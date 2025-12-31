# Add Node.js to PATH for this session
$env:Path += ";C:\Program Files\nodejs"

# Verify Node.js is accessible
Write-Host "Node.js version:" -ForegroundColor Cyan
node --version
Write-Host "npm version:" -ForegroundColor Cyan
npm --version
Write-Host ""

# Navigate to backend directory
Set-Location "C:\Users\Charles\OneDrive\Documents\League Project\backend"

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Server will run on http://localhost:5000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm start


