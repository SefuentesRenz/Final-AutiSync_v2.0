$oids = @(
    '41d5c314998bb7f85ba4ca8b8c3a404b63ef0f1ec9f137d7b9dd957db9c91901',
    '8db37151e83e2cb765ac24a1701be1d04a4d43eb12678fb8a76155621b8ad74a',
    'e7497b92bd52f23858f781a9cd3759b5026511ed967959e0d0ef7d24d2480c16'
)

$found = @()
Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $h = Get-FileHash -Algorithm SHA256 -Path $_.FullName -ErrorAction Stop
        if ($oids -contains $h.Hash.ToLower()) {
            $found += $_.FullName
        }
    } catch {}
}

if ($found.Count -gt 0) { $found | ForEach-Object { Write-Host "MATCH: $_" } } else { Write-Host "NO MATCH FOUND" }
