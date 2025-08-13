# PowerShell script for Android build fix on Windows

Write-Host "Fixing Android build for Windows..." -ForegroundColor Green

try {
    # Clean Gradle
    Write-Host "Cleaning Gradle..." -ForegroundColor Yellow
    Set-Location android
    & .\gradlew.bat clean
    
    # Remove build folder
    Write-Host "Removing build folder..." -ForegroundColor Yellow
    if (Test-Path "app\build") {
        Remove-Item -Recurse -Force "app\build"
    }
    
    # Rebuild
    Write-Host "Rebuilding..." -ForegroundColor Yellow
    & .\gradlew.bat assembleDebug
    
    Set-Location ..
    Write-Host "Done!" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try: npm run fix:android" -ForegroundColor Yellow
}
