# PowerShell script to fix the Unicode issue
$filePath = "src\components\Flashcards.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Replace the problematic line
$content = $content -replace 'setMatchingFeedbackMessage\("🎉 PERFECT SCORE! All 10 answers correct! Excellent work! 🎊"\); .\"\);', 'setMatchingFeedbackMessage("🎉 PERFECT SCORE! All 10 answers correct! Excellent work! 🎊");'

# Write back to file
Set-Content $filePath $content -Encoding UTF8
Write-Host "Fixed Unicode issue in Flashcards.jsx"