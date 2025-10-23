param(
    [string]$Remote = "upstream",
    [string]$Branch = "main",
    [switch]$AllowForce
)

$ErrorActionPreference = 'Stop'

Write-Host "Push helper: remote=$Remote branch=$Branch"

Write-Host "1) Attempting to upload all LFS objects to $Remote/$Branch..."
try {
    & git lfs push --all $Remote $Branch | Write-Host
} catch {
    Write-Host "Warning: git lfs push failed or had warnings. Continuing to try normal push."
}

Write-Host "2) Attempting normal git push $Remote $Branch..."
try {
    $pushOutput = & git push $Remote $Branch 2>&1
    $pushExit = $LASTEXITCODE
} catch {
    $pushOutput = $_.Exception.Message
    $pushExit = 1
}

if ($pushExit -eq 0) {
    Write-Host "Push successful to $Remote/$Branch"
    exit 0
}

Write-Host ("Push failed. Output:`n" + $pushOutput)

# If push failed due to LFS missing objects and user allowed force, we could force update remote main.
if ($AllowForce.IsPresent) {
    Write-Host "--AllowForce specified. Creating remote backup and force-updating $Remote/$Branch with a clean branch."
} else {
    Write-Host "No -AllowForce. Will create a clean branch and push it instead. You can rerun with -AllowForce to force-refresh remote main after review."
}

$ts = Get-Date -Format "yyyyMMddHHmmss"
$backupName = "backup-before-clean-upload-$ts"
$cleanName = "clean-upload-$ts"

Write-Host "3) Creating remote backup: $backupName (pushes current remote $Branch to that ref)..."
& git fetch $Remote --prune | Out-Null
& git push $Remote "$Branch:refs/heads/$backupName" | Write-Host

Write-Host "4) Creating local clean branch: $cleanName from local $Branch..."
& git checkout -b $cleanName $Branch | Out-Null

Write-Host "5) Removing LFS-tracked files from the index on branch $cleanName (so we can push without missing LFS objects)..."
$lfsOut = & git lfs ls-files -n 2>$null
$lfsFiles = @()
if ($lfsOut) { $lfsFiles = $lfsOut -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" } }

if ($lfsFiles.Count -gt 0) {
    foreach ($f in $lfsFiles) {
        Write-Host "Removing from index: $f"
        & git rm --cached --ignore-unmatch -- "$f" | Out-Null
    }
    & git commit -m "Clean upload: remove LFS-tracked files (temporary)" --allow-empty | Out-Null
} else {
    Write-Host "No LFS-tracked files found (or git lfs not installed)."
}

Write-Host "6) Pushing clean branch to remote as $cleanName..."
& git push $Remote $cleanName | Write-Host

if ($AllowForce.IsPresent) {
    Write-Host "7) Force-updating remote $Remote/$Branch from $cleanName (because -AllowForce was specified)..."
    & git push $Remote "$cleanName:refs/heads/$Branch" --force | Write-Host
    Write-Host "Remote $Remote/$Branch has been force-updated to cleaned tree."
} else {
    Write-Host "7) Skipping force update of $Remote/$Branch. Review branch $cleanName on the remote and merge/replace main manually when ready."
}

Write-Host "Done. Returned to original branch will not be automatically performed by this script - please checkout your working branch if needed."
