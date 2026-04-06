$htmlPath = 'c:\Users\himan\OneDrive\Documents\book\book-platform\index.html'
$cssPath = 'c:\Users\himan\OneDrive\Documents\book\book-platform\styles.css'
$jsPath = 'c:\Users\himan\OneDrive\Documents\book\book-platform\app.js'

$content = [System.IO.File]::ReadAllText($htmlPath)

$styles = [regex]::Matches($content, '(?s)<style.*?>(.*?)</style>') | ForEach-Object { $_.Groups[1].Value }
$cssContent = $styles -join "`n"
[System.IO.File]::WriteAllText($cssPath, $cssContent.Trim(), [System.Text.Encoding]::UTF8)

$scripts = [regex]::Matches($content, '(?s)<script>(.*?)</script>') | ForEach-Object { $_.Groups[1].Value }
$jsContent = $scripts -join "`n"
[System.IO.File]::WriteAllText($jsPath, $jsContent.Trim(), [System.Text.Encoding]::UTF8)

$newContent = [regex]::Replace($content, '(?s)<style.*?>.*?</style>', '')
$newContent = [regex]::Replace($newContent, '(?s)<script>.*?</script>', '')

$newContent = $newContent -replace '</head>', "<link rel=`"stylesheet`" href=`"styles.css`" />`n</head>"
$newContent += "`n<script src=`"app.js`"></script>`n</body>`n</html>"

[System.IO.File]::WriteAllText($htmlPath, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Extraction completed."
