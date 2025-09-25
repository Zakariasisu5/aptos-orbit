# Installs aptos CLI to C:\tools\aptos and adds it to the user PATH (non-elevated)
$release = Invoke-RestMethod -UseBasicParsing -Uri "https://api.github.com/repos/aptos-labs/aptos-core/releases/latest"
$asset = $release.assets | Where-Object { $_.name -like "*x86_64-pc-windows-msvc.zip" } | Select-Object -First 1
if (-not $asset) { Write-Error "No Windows asset found on releases page. Please download it manually from the releases URL."; exit 1 }
$out = "$env:TEMP\aptos.zip"
Invoke-WebRequest -UseBasicParsing -Uri $asset.browser_download_url -OutFile $out
$dest = 'C:\tools\aptos'
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Expand-Archive -Path $out -DestinationPath $dest -Force
[Environment]::SetEnvironmentVariable('Path', $env:Path + ';' + $dest, 'User')
Write-Host "aptos installed to $dest. Open a NEW PowerShell window and run: aptos --version"
