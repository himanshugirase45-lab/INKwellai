$css = Get-Content -Raw -Encoding UTF8 'c:\Users\himan\OneDrive\Documents\book\book-platform\styles.css'
$patchBk = Get-Content -Raw -Encoding UTF8 'c:\Users\himan\OneDrive\Documents\book\book-platform\patch_bk.css'

# Fix the broken bk section
$bkBad = '(?s)\.sec-sub\s*\{.*?\.bk-hot\s*\{.*?letter-spacing:\s*\.5px;\s*\}'
$css = [regex]::Replace($css, $bkBad, $patchBk)

[System.IO.File]::WriteAllText('c:\Users\himan\OneDrive\Documents\book\book-platform\styles.css', $css, [System.Text.Encoding]::UTF8)
Write-Output "Patch applied successfully."
