$ErrorActionPreference = "Stop"

$currentDir = Get-Location
$tempDir = Join-Path -Path $env:TEMP -ChildPath "linual-repo-temp-$(Get-Random)"

if (Test-Path -Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}

Write-Host "Cloning repository..." -ForegroundColor Cyan
git clone https://github.com/AleemKanyu/linual-life-manual $tempDir

Write-Host "Cleaning up current directory (keeping .git)..." -ForegroundColor Cyan
Get-ChildItem -Path $currentDir -Force | Where-Object { $_.Name -ne '.git' -and $_.Name -ne 'sync_repo.ps1' } | ForEach-Object {
    if ($_.PSIsContainer) {
        cmd.exe /c "rmdir /s /q `"$($_.FullName)`""
    } else {
        Remove-Item -Path $_.FullName -Force
    }
}

Write-Host "Copying new files..." -ForegroundColor Cyan
Get-ChildItem -Path $tempDir -Force | Where-Object { $_.Name -ne '.git' } | Copy-Item -Destination $currentDir -Recurse -Force

Write-Host "Committing and pushing to your remote..." -ForegroundColor Cyan
git add .
git commit -m "Sync with AleemKanyu/linual-life-manual"

# Try pushing to main or master
$branch = git rev-parse --abbrev-ref HEAD
git push origin $branch

Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Successfully replaced folder and pushed to your GitHub!" -ForegroundColor Green
