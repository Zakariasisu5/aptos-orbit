param(
  [string]$PackageDir = "D:\aptos-orbit\Smart-contracts\Move\Aptos-VM",
  [string]$KeyFile = "",
  [string]$NodeUrl = "https://fullnode.testnet.aptoslabs.com",
  [int]$MaxGas = 200000
)

if (-not (Get-Command aptos -ErrorAction SilentlyContinue)) {
  Write-Error "aptos CLI not found on PATH. Please install it first."
  exit 1
}

if (-not (Test-Path $PackageDir)) { Write-Error "Package dir not found: $PackageDir"; exit 1 }

Push-Location $PackageDir
try {
  if (-not $KeyFile) {
    Write-Host "Publishing using configured CLI profile..."
    aptos move publish --package-dir . --max-gas $MaxGas --assume-yes --node-url $NodeUrl
  } else {
    if (-not (Test-Path $KeyFile)) { Write-Error "Key file not found: $KeyFile"; exit 1 }
    Write-Host "Publishing using key file: $KeyFile"
    aptos move publish --package-dir . --private-key-file $KeyFile --max-gas $MaxGas --assume-yes --node-url $NodeUrl
  }
} finally {
  Pop-Location
}
