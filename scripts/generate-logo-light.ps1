Add-Type -AssemblyName System.Drawing

$inputPath = 'G:\Downloads\unified_ventures_transparent_logo.png'
$tempOutputPath = 'c:\Users\Stefin\OneDrive\Desktop\intereor\temp_light.png'
$finalOutputPath = 'c:\Users\Stefin\OneDrive\Desktop\intereor\public\logo-light.png'

$src = [System.Drawing.Bitmap]::FromFile($inputPath)
$bmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height)

for ($y = 0; $y -lt $src.Height; $y++) {
    for ($x = 0; $x -lt $src.Width; $x++) {
        $c = $src.GetPixel($x, $y)
        if ($c.A -eq 0) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            continue
        }
        $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
        $isGold = ($c.R -gt 130) -and ($c.G -gt 100) -and ($c.B -lt 120) -and ($c.R -gt $c.G) -and ($c.G -gt $c.B)
        if ($isGold) {
            $newR = [Math]::Min(255, $c.R + 20)
            $newG = [Math]::Min(255, $c.G + 15)
            $newB = [Math]::Min(255, $c.B + 10)
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, $newR, $newG, $newB))
        } elseif ($lum -lt 170) {
            $amt = (170 - $lum) / 170.0
            $newR = [Math]::Min(255, [int]($c.R + (250 - $c.R) * $amt))
            $newG = [Math]::Min(255, [int]($c.G + (249 - $c.G) * $amt))
            $newB = [Math]::Min(255, [int]($c.B + (246 - $c.B) * $amt))
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, $newR, $newG, $newB))
        } else {
            $bmp.SetPixel($x, $y, $c)
        }
    }
}

$src.Dispose()
if (Test-Path $tempOutputPath) { Remove-Item $tempOutputPath -Force }
$bmp.Save($tempOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Move-Item -Path $tempOutputPath -Destination $finalOutputPath -Force
Write-Host "Generated $finalOutputPath successfully"
