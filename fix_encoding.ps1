# Fix BOM encoding issues
$files = @(
    'src/Admin/AlarmingEmotions.jsx',
    'src/Admin/Students.jsx',
    'src/components/ParentProfileModal.jsx',
    'src/pages/HomePage.jsx',
    'src/pages/StudentProfile.jsx',
    'src/parents/ParentDashboard.jsx'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing: $file"
        $content = Get-Content $file -Raw -Encoding UTF8
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText((Resolve-Path $file).Path, $content, $utf8NoBom)
        Write-Host "Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan
