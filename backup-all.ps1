# ============================================================================
# DARTMOUTH OS PROJECT - AUTOMATED BACKUP SCRIPT
# ============================================================================
# Purpose: Backup all projects to GitHub and create local ZIP backups
# Usage:   .\backup-all.ps1 [-SkipGitHub] [-GitHubOnly] [-SkipLocal]
# ============================================================================

param(
    [switch]$SkipGitHub,
    [switch]$GitHubOnly,
    [switch]$SkipLocal
)

# Configuration
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupRoot = "D:\coding\DARTMOUTH OS PROJECT FULL BACKUP"
$codingRoot = "D:\coding"

# Project definitions
$projects = @(
    @{
        Name = "Dartmouth OS Core"
        Path = "agent-army-system"
        HasGit = $true
        BackupName = "DARTMOUTH_OS"
    },
    @{
        Name = "Artwork Analyser AI Agent"
        Path = "Artwork Analyser AI Agent"
        HasGit = $true
        BackupName = "ARTWORK_AGENT"
    },
    @{
        Name = "McCarthy PA Agent"
        Path = "McCarthy PA Agent"
        HasGit = $false
        BackupName = "PA_AGENT"
    },
    @{
        Name = "Customer Service AI Agent"
        Path = "Customer Service AI Agent"
        HasGit = $false
        BackupName = "CUSTOMER_SERVICE"
    },
    @{
        Name = "PerfectPrint AI"
        Path = "PerfectPrint AI"
        HasGit = $false
        BackupName = "PERFECTPRINT"
    },
    @{
        Name = "AdFusion AI"
        Path = "AdFusion AI"
        HasGit = $false
        BackupName = "ADFUSION"
    }
)

# Colors for output
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Header { param($msg) Write-Host "`n========================================" -ForegroundColor Magenta; Write-Host $msg -ForegroundColor Magenta; Write-Host "========================================`n" -ForegroundColor Magenta }

# Statistics
$stats = @{
    TotalProjects = 0
    GitHubSuccess = 0
    GitHubFailed = 0
    LocalSuccess = 0
    LocalFailed = 0
    Skipped = 0
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

Write-Header "DARTMOUTH OS PROJECT - AUTOMATED BACKUP"
Write-Info "Timestamp: $timestamp"
Write-Info "Backup Location: $backupRoot"
Write-Info ""

# Ensure backup directory exists
if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    Write-Success "Created backup directory: $backupRoot"
}

# ============================================================================
# STEP 1: UPDATE DOCUMENTATION
# ============================================================================

if (-not $GitHubOnly) {
    Write-Header "STEP 1: Updating Documentation"
    
    $progressFile = "$codingRoot\DARTMOUTH_OS_PROJECT\PROGRESS_TO_DATE.md"
    if (Test-Path $progressFile) {
        # Update timestamp in PROGRESS_TO_DATE.md
        $content = Get-Content $progressFile -Raw
        $content = $content -replace '\*\*Last Updated:\*\* \d{4}-\d{2}-\d{2} \d{2}:\d{2} AEDT', "**Last Updated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm') AEDT"
        Set-Content $progressFile -Value $content
        Write-Success "Updated PROGRESS_TO_DATE.md timestamp"
    }
}

# ============================================================================
# STEP 2: PROCESS EACH PROJECT
# ============================================================================

foreach ($project in $projects) {
    $stats.TotalProjects++
    $projectPath = Join-Path $codingRoot $project.Path
    
    Write-Header "Processing: $($project.Name)"
    
    # Check if project exists
    if (-not (Test-Path $projectPath)) {
        Write-Warning "Project not found: $projectPath"
        $stats.Skipped++
        continue
    }
    
    # ========================================================================
    # GITHUB BACKUP
    # ========================================================================
    
    if ($project.HasGit -and -not $SkipGitHub) {
        Write-Info "GitHub Backup..."
        
        Push-Location $projectPath
        
        try {
            # Check for uncommitted changes
            $status = git status --porcelain
            
            if ($status) {
                Write-Info "Found uncommitted changes, committing..."
                
                # Add all changes
                git add .
                
                # Commit with timestamp
                $commitMsg = "Backup: Automated backup at $timestamp"
                git commit -m $commitMsg
                
                Write-Success "Committed changes"
            } else {
                Write-Info "No uncommitted changes"
            }
            
            # Push to GitHub
            Write-Info "Pushing to GitHub..."
            $pushResult = git push origin main 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Pushed to GitHub successfully"
                $stats.GitHubSuccess++
            } else {
                Write-Error "Failed to push to GitHub: $pushResult"
                $stats.GitHubFailed++
            }
            
        } catch {
            Write-Error "Git operation failed: $_"
            $stats.GitHubFailed++
        } finally {
            Pop-Location
        }
        
    } elseif (-not $project.HasGit) {
        Write-Info "No Git repository (skipping GitHub backup)"
    } else {
        Write-Info "GitHub backup skipped (flag)"
    }
    
    # ========================================================================
    # LOCAL BACKUP
    # ========================================================================
    
    if (-not $GitHubOnly -and -not $SkipLocal) {
        Write-Info "Local Backup..."
        
        $backupFileName = "$($project.BackupName)_BACKUP_$timestamp.zip"
        $backupFilePath = Join-Path $backupRoot $backupFileName
        
        try {
            # Create exclusion list
            $excludePatterns = @(
                "node_modules",
                "dist",
                "build",
                ".next",
                ".cache",
                ".env",
                ".dev.vars",
                "*.log",
                ".DS_Store",
                "Thumbs.db"
            )
            
            # Create temporary directory for filtered files
            $tempDir = Join-Path $env:TEMP "backup_temp_$($project.BackupName)"
            if (Test-Path $tempDir) {
                Remove-Item $tempDir -Recurse -Force
            }
            New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
            
            # Copy files excluding patterns
            Write-Info "Copying files (excluding node_modules, dist, etc.)..."
            robocopy $projectPath $tempDir /E /XD node_modules dist build .next .cache /XF .env .dev.vars *.log /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
            
            # Create ZIP from temp directory
            Write-Info "Creating ZIP archive..."
            Compress-Archive -Path "$tempDir\*" -DestinationPath $backupFilePath -Force
            
            # Clean up temp directory
            Remove-Item $tempDir -Recurse -Force
            
            # Verify backup
            if (Test-Path $backupFilePath) {
                $backupSize = (Get-Item $backupFilePath).Length / 1MB
                $sizeFormatted = "{0:N2}" -f $backupSize
                Write-Success "Local backup created: $backupFileName ($sizeFormatted MB)"
                $stats.LocalSuccess++
            } else {
                Write-Error "Failed to create local backup"
                $stats.LocalFailed++
            }
            
        } catch {
            Write-Error "Local backup failed: $_"
            $stats.LocalFailed++
        }
        
    } elseif ($GitHubOnly) {
        Write-Info "Local backup skipped (GitHub only mode)"
    } else {
        Write-Info "Local backup skipped (flag)"
    }
    
    Write-Info ""
}

# ============================================================================
# STEP 3: BACKUP MASTER DOCUMENTATION
# ============================================================================

if (-not $GitHubOnly -and -not $SkipLocal) {
    Write-Header "Backing Up Master Documentation"
    
    $docsPath = "$codingRoot\DARTMOUTH_OS_PROJECT"
    $docsBackupFile = Join-Path $backupRoot "DARTMOUTH_OS_PROJECT_DOCS_$timestamp.zip"
    
    try {
        Compress-Archive -Path "$docsPath\*" -DestinationPath $docsBackupFile -Force
        $backupSize = (Get-Item $docsBackupFile).Length / 1MB
        $sizeFormatted = "{0:N2}" -f $backupSize
        Write-Success "Documentation backup created ($sizeFormatted MB)"
    } catch {
        Write-Error "Failed to backup documentation: $_"
    }
}

# ============================================================================
# STEP 4: CLEANUP OLD BACKUPS
# ============================================================================

if (-not $GitHubOnly -and -not $SkipLocal) {
    Write-Header "Cleaning Up Old Backups"
    
    try {
        # Keep only last 4 backups for each project
        $allBackups = Get-ChildItem $backupRoot -Filter "*.zip" | Sort-Object LastWriteTime -Descending
        
        $backupGroups = $allBackups | Group-Object { $_.Name -replace "_BACKUP_.*\.zip`$", "" }
        
        foreach ($group in $backupGroups) {
            if ($group.Count -gt 4) {
                $toDelete = $group.Group | Select-Object -Skip 4
                foreach ($file in $toDelete) {
                    Remove-Item $file.FullName -Force
                    Write-Info "Deleted old backup: $($file.Name)"
                }
            }
        }
        
        Write-Success "Cleanup complete (kept last 4 backups per project)"
    } catch {
        Write-Warning "Cleanup failed: $_"
    }
}

# ============================================================================
# FINAL SUMMARY
# ============================================================================

Write-Header "BACKUP SUMMARY"

Write-Host ""
Write-Host "Total Projects Processed: $($stats.TotalProjects)" -ForegroundColor White
Write-Host ""

if (-not $SkipGitHub) {
    Write-Host "GitHub Backups:" -ForegroundColor Cyan
    Write-Host "  [OK] Success: $($stats.GitHubSuccess)" -ForegroundColor Green
    if ($stats.GitHubFailed -gt 0) {
        Write-Host "  [ERROR] Failed:  $($stats.GitHubFailed)" -ForegroundColor Red
    }
    Write-Host ""
}

if (-not $GitHubOnly -and -not $SkipLocal) {
    Write-Host "Local Backups:" -ForegroundColor Cyan
    Write-Host "  [OK] Success: $($stats.LocalSuccess)" -ForegroundColor Green
    if ($stats.LocalFailed -gt 0) {
        Write-Host "  [ERROR] Failed:  $($stats.LocalFailed)" -ForegroundColor Red
    }
    Write-Host ""
}

if ($stats.Skipped -gt 0) {
    Write-Host "Skipped: $($stats.Skipped) (projects not found)" -ForegroundColor Yellow
    Write-Host ""
}

# Overall status
$totalErrors = $stats.GitHubFailed + $stats.LocalFailed
if ($totalErrors -eq 0) {
    Write-Success "ALL BACKUPS COMPLETED SUCCESSFULLY!"
} else {
    Write-Warning "BACKUP COMPLETED WITH $totalErrors ERROR(S)"
}

Write-Host ""
Write-Host "Backup Location: $backupRoot" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# END OF SCRIPT
# ============================================================================

