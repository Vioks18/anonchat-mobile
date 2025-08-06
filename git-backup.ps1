# Git Auto Backup Script (PowerShell)
# Usage: .\git-backup.ps1 [commit_message]

param(
    [string]$CommitMessage = ""
)

# Получаем сообщение коммита
if ($CommitMessage -eq "") {
    # Если аргумент не передан, используем сообщение по умолчанию
    $CommitMessage = "Auto backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Выполняем git команды
Write-Host "Creating backup..." -ForegroundColor Cyan
git add . | Out-Null
git commit -m $CommitMessage | Out-Null
git push | Out-Null

# Проверяем результат
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup created successfully: $CommitMessage" -ForegroundColor Green
} else {
    Write-Host "Error creating backup" -ForegroundColor Red
    exit 1
}
