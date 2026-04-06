$css = Get-Content -Raw -Encoding UTF8 'c:\Users\himan\OneDrive\Documents\book\book-platform\styles.css'
$patchNav = Get-Content -Raw -Encoding UTF8 'c:\Users\himan\OneDrive\Documents\book\book-platform\patch_nav.css'
$patchBk = Get-Content -Raw -Encoding UTF8 'c:\Users\himan\OneDrive\Documents\book\book-platform\patch_bk.css'

# Fix the broken nav section
$navBad = '(?s)\.nav\.stuck\s*\{\s*justify-content:\s*center;\s*font-size:\s*1rem;'
$navGood = "$patchNav`n            justify-content: center;`n            font-size: 1rem;"
$css = [regex]::Replace($css, $navBad, $navGood)

# Fix the broken bk section
$bkBad = '(?s)\.sec-sub\s*\{.*?\.bk-hot\s*\{.*?\letter-spacing:\s*\.5px;\s*\}'
$css = [regex]::Replace($css, $bkBad, $patchBk)

[System.IO.File]::WriteAllText('c:\Users\himan\OneDrive\Documents\book\book-platform\styles.css', $css, [System.Text.Encoding]::UTF8)
Write-Output "Patch applied successfully."
