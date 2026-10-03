# ============================================================================
# MADA â€” BRAND ASSET GENERATOR (developer tool, not used by the website)
# Creates favicon.ico and assets/social/og-cover.png (used for link previews).
# Run from the project root:   powershell -File scripts/generate-brand-assets.ps1
# ============================================================================

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot

# ---------------------------------------------------------------- favicon.ico
$bmp = New-Object System.Drawing.Bitmap 32, 32
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::Transparent)

$r = New-Object System.Drawing.Rectangle 1, 1, 30, 30
$rad = 8
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($r.X, $r.Y, $rad * 2, $rad * 2, 180, 90)
$path.AddArc($r.Right - $rad * 2, $r.Y, $rad * 2, $rad * 2, 270, 90)
$path.AddArc($r.Right - $rad * 2, $r.Bottom - $rad * 2, $rad * 2, $rad * 2, 0, 90)
$path.AddArc($r.X, $r.Bottom - $rad * 2, $rad * 2, $rad * 2, 90, 90)
$path.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::Black, $path)

$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 4
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawLine($pen, 8, 24, 8, 9)
$g.DrawLine($pen, 8, 9, 16, 19)
$g.DrawLine($pen, 16, 19, 24, 9)
$g.DrawLine($pen, 24, 9, 24, 24)

$hicon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hicon)
$fs = [System.IO.File]::Create((Join-Path $root 'favicon.ico'))
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()
Write-Output "favicon.ico written"

# ------------------------------------------------------------- og-cover.png
$social = Join-Path $root 'assets\social'
if (-not (Test-Path $social)) { New-Item -ItemType Directory -Path $social | Out-Null }

$W = 1200
$H = 630
$img = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($img)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.Clear([System.Drawing.Color]::FromArgb(11, 11, 11))

# faint frame
$framePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(38, 38, 38)), 2
$g.DrawRectangle($framePen, 40, 40, ($W - 80), ($H - 80))

$typographic = [System.Drawing.StringFormat]::GenericTypographic

# --- MADA wordmark (letterspaced)
$font = New-Object System.Drawing.Font 'Arial', 168, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$white = [System.Drawing.Brushes]::White
$x = 118.0
foreach ($ch in 'MADA'.ToCharArray()) {
  $s = $ch.ToString()
  $size = $g.MeasureString($s, $font, (New-Object System.Drawing.PointF(0.0, 0.0)), $typographic)
  $g.DrawString($s, $font, $white, (New-Object System.Drawing.PointF($x, 150.0)), $typographic)
  $x += $size.Width + 24
}

# --- accent rule
$accent = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(209, 58, 23)), 8
$g.DrawLine($accent, 122, 392, 452, 392)

# --- GO BEYOND. (letterspaced)
$font2 = New-Object System.Drawing.Font 'Arial', 52, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$x = 122.0
foreach ($ch in 'GO BEYOND.'.ToCharArray()) {
  $s = $ch.ToString()
  $size = $g.MeasureString($s, $font2, (New-Object System.Drawing.PointF(0.0, 0.0)), $typographic)
  $g.DrawString($s, $font2, $white, (New-Object System.Drawing.PointF($x, 430.0)), $typographic)
  $x += $size.Width + 12
}

# --- small caption
$font3 = New-Object System.Drawing.Font 'Arial', 26, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$gray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(138, 138, 138))
$caption = 'MODERN STREETWEAR'
$capSize = $g.MeasureString($caption, $font3, (New-Object System.Drawing.PointF(0.0, 0.0)), $typographic)
$g.DrawString($caption, $font3, $gray, (New-Object System.Drawing.PointF(($W - 122 - $capSize.Width), 445.0)), $typographic)

$img.Save((Join-Path $social 'og-cover.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Write-Output "assets\social\og-cover.png written"

