#!/usr/bin/env pwsh

# Git Backup Script for AnonChat Project
# Automatic backup with logging and status

param(
    [string]$CommitMessage = ""
)

# Output colors
$Green = "[SUCCESS]"
$Red = "[ERROR]"
$Yellow = "[WARNING]"
$Info = "[INFO]"

# Logging function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output
    switch ($Level) {
        "SUCCESS" { Write-Host "$Green $Message" -ForegroundColor Green }
        "ERROR" { Write-Host "$Red $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "$Yellow $Message" -ForegroundColor Yellow }
        default { Write-Host "$Info $Message" -ForegroundColor Cyan }
    }
    
    # Write to log file
    $logFile = "backup.log"
    $logEntry | Out-File -FilePath $logFile -Append -Encoding UTF8
}

# Git status check function
function Test-GitStatus {
    try {
        $status = git status --porcelain
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            Write-Log "Git status check error" "ERROR"
            return $false
        }
    } catch {
        Write-Log "Exception during Git status check: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Changes check function
function Test-HasChanges {
    try {
        $changes = git status --porcelain
        return $changes -ne $null -and $changes.Length -gt 0
    } catch {
        Write-Log "Error checking changes: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Current branch function
function Get-CurrentBranch {
    try {
        $branch = git branch --show-current
        if ($LASTEXITCODE -eq 0) {
            return $branch.Trim()
        } else {
            Write-Log "Error getting current branch" "ERROR"
            return $null
        }
    } catch {
        Write-Log "Exception getting branch: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# Commit creation function
function New-GitCommit {
    param(
        [string]$Message
    )
    
    try {
        Write-Log "Creating commit: $Message"
        
        # Add all files
        Write-Log "Adding files to index..."
        git add -A
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Error adding files to index" "ERROR"
            return $false
        }
        
        # Create commit
        Write-Log "Creating commit..."
        git commit -m $Message
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Error creating commit" "ERROR"
            return $false
        }
        
        Write-Log "Commit created successfully" "SUCCESS"
        return $true
        
    } catch {
        Write-Log "Exception creating commit: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Push function
function Push-GitChanges {
    param(
        [string]$Branch
    )
    
    try {
        Write-Log "Pushing changes to branch: $Branch"
        
        git push origin $Branch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Changes pushed successfully" "SUCCESS"
            return $true
        } else {
            Write-Log "Error pushing changes" "ERROR"
            return $false
        }
        
    } catch {
        Write-Log "Exception pushing changes: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main backup logic
function Start-GitBackup {
    Write-Log "=== Starting Git backup for AnonChat ===" "INFO"
    
    # Check if we're in a Git repository
    if (-not (Test-Path ".git")) {
        Write-Log "Error: Git repository not found in current directory" "ERROR"
        return $false
    }
    
    # Check Git status
    if (-not (Test-GitStatus)) {
        Write-Log "Error: Git status problems" "ERROR"
        return $false
    }
    
    # Get current branch
    $currentBranch = Get-CurrentBranch
    if (-not $currentBranch) {
        Write-Log "Error: Could not determine current branch" "ERROR"
        return $false
    }
    
    Write-Log "Current branch: $currentBranch" "INFO"
    
    # Check for changes
    if (-not (Test-HasChanges)) {
        Write-Log "No changes to commit" "WARNING"
        return $true
    }
    
    # Generate commit message if not provided
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $CommitMessage = "Auto backup - $timestamp"
        Write-Log "Generated commit message: $CommitMessage" "INFO"
    }
    
    # Create commit
    if (-not (New-GitCommit -Message $CommitMessage)) {
        Write-Log "Error: Could not create commit" "ERROR"
        return $false
    }
    
    # Push changes
    if (-not (Push-GitChanges -Branch $currentBranch)) {
        Write-Log "Error: Could not push changes" "ERROR"
        return $false
    }
    
    Write-Log "=== Git backup completed successfully ===" "SUCCESS"
    return $true
}

# Run backup
try {
    $success = Start-GitBackup
    
    if ($success) {
        Write-Log "Backup completed successfully" "SUCCESS"
        exit 0
    } else {
        Write-Log "Backup completed with errors" "ERROR"
        exit 1
    }
} catch {
    Write-Log "Critical error: $($_.Exception.Message)" "ERROR"
    exit 1
}
