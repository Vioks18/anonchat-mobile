param (
  [string]$commitMessage = ""
)

# Автосообщение если ничего не введено
if ($commitMessage -eq "") {
  $commitMessage = "Auto backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host "📦 Creating backup with message: $commitMessage" -ForegroundColor Cyan

git add .
git commit -m "$commitMessage"
git push

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Backup created successfully!" -ForegroundColor Green
} else {
  Write-Host "❌ Error creating backup." -ForegroundColor Red
  exit 1
}