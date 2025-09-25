param(
  [string]$PackageDir = "D:\aptos-orbit\Smart-contracts\Move\Aptos-VM"
)

Write-Host "Checking for aptos CLI..."
if (-not (Get-Command aptos -ErrorAction SilentlyContinue)) {
  Write-Error "aptos CLI not found on PATH. Please install it first. See README or run scripts/install-aptos.ps1"
  exit 1
}

Write-Host "Compiling Move package in $PackageDir"
Push-Location $PackageDir
try {
  aptos move compile --package-dir .
  $exit = $LASTEXITCODE
  if ($exit -ne 0) { Write-Error "Move compile failed with exit code $exit"; exit $exit }
  Write-Host "Move compile succeeded"
} finally {
  Pop-Location
}
