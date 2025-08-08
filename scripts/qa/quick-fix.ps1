$ErrorActionPreference = "Stop"

Write-Host "[QA] Running autofix (P0) ..." -ForegroundColor Cyan
npm run qa:fix

Write-Host "[QA] Running QA scan ..." -ForegroundColor Cyan
npm run qa

$branch = "fix/qa-lite"
Write-Host "[QA] Switching/creating branch $branch ..." -ForegroundColor Cyan
git checkout -B $branch | Out-Null

Write-Host "[QA] Staging changes ..." -ForegroundColor Cyan
git add -A

# Check if there is anything to commit
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "[QA] No changes to commit. Done." -ForegroundColor Yellow
  exit 0
}

Write-Host "[QA] Committing changes ..." -ForegroundColor Cyan
git commit -m "QA: autofix P0 + report" | Out-Null

Write-Host "[QA] Pushing branch to origin ..." -ForegroundColor Cyan
git push -u origin $branch

Write-Host "[QA] Completed successfully." -ForegroundColor Green


