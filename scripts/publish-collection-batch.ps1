$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$components = @(
  @{
    file       = "app/submitted/collection/murmuration-boids/murmuration-boids.tsx"
    importPath = "./submitted/collection/murmuration-boids/murmuration-boids"
    importName = "MurmurationBoids"
    slug       = "murmuration-boids"
    desc       = "Starling murmuration with alignment, cohesion, separation, and a cursor hawk."
  },
  @{
    file       = "app/submitted/collection/holographic-foil-card/holographic-foil-card.tsx"
    importPath = "./submitted/collection/holographic-foil-card/holographic-foil-card"
    importName = "HolographicFoilCard"
    slug       = "holographic-foil-card"
    desc       = "Tilt-reactive trading card with holographic foil glare and spring motion."
  },
  @{
    file       = "app/submitted/collection/lorenz-attractor/lorenz-attractor.tsx"
    importPath = "./submitted/collection/lorenz-attractor/lorenz-attractor"
    importName = "LorenzAttractor"
    slug       = "lorenz-attractor"
    desc       = "3D Lorenz strange attractor whose sigma and rho follow the cursor."
  },
  @{
    file       = "app/submitted/collection/phyllotaxis-bloom/phyllotaxis-bloom.tsx"
    importPath = "./submitted/collection/phyllotaxis-bloom/phyllotaxis-bloom"
    importName = "PhyllotaxisBloom"
    slug       = "phyllotaxis-bloom"
    desc       = "Vogel sunflower spiral that grows with the cursor; click reseeds."
  },
  @{
    file       = "app/submitted/collection/moire-shear-field/moire-shear-field.tsx"
    importPath = "./submitted/collection/moire-shear-field/moire-shear-field"
    importName = "MoireShearField"
    slug       = "moire-shear-field"
    desc       = "Chromatic moire lattices in a cursor-warped field; click cycles modes."
  }
)

$results = @()

foreach ($c in $components) {
  Write-Host "`n========== $($c.slug) ==========" -ForegroundColor Cyan

  $page = @"
"use client";

import $($c.importName) from "$($c.importPath)";

export default function Page() {
  return <$($c.importName) />;
}
"@

  Set-Content -Path "app/page.tsx" -Value $page -Encoding UTF8

  $outDir = ".21st-previews/$($c.slug)"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null

  $previewPath = Join-Path $outDir "default.png"
  if (-not (Test-Path $previewPath)) {
    21st render $c.file --demo "app/page.tsx" --out $outDir
  }

  $previewArg = @()
  if ((Test-Path $previewPath) -and ((Get-Item $previewPath).Length -lt 3800000)) {
    $previewArg = @("--preview", $previewPath)
  } else {
    Write-Host "Skipping --preview (missing or too large)."
  }

  try {
    $publishOut = & 21st publish $c.file `
      --demo "app/page.tsx" `
      --description $c.desc `
      @previewArg `
      --auto `
      --no-open 2>&1 | Out-String

    Write-Host $publishOut
    $url = [regex]::Match($publishOut, 'https://21st\.dev/@\S+/components/\S+').Value
    $ok = ($LASTEXITCODE -eq 0)
  } catch {
    $publishOut = $_.Exception.Message
    Write-Host $publishOut
    $url = ""
    $ok = $false
  }

  $results += [pscustomobject]@{ slug = $c.slug; url = $url; ok = $ok }
}

Write-Host "`n========== SUMMARY ==========" -ForegroundColor Green
$results | Format-Table -AutoSize
