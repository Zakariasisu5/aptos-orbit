This folder contains helper PowerShell scripts to compile and publish the Move package.

Scripts

- install-aptos.ps1
  - Downloads the latest Aptos CLI Windows release and installs it to C:\tools\aptos. Adds the folder to the user PATH.
  - Usage: Open PowerShell and run: .\install-aptos.ps1

- compile-move.ps1
  - Runs `aptos move compile --package-dir .` in `Smart-contracts/Move/Aptos-VM`.
  - Usage: .\compile-move.ps1

- publish-move.ps1
  - Publishes the Move package. You can either provide a `--KeyFile` path to a private key file or let the CLI use its configured profile.
  - Usage examples:
    .\publish-move.ps1 -KeyFile .\\my_key.yaml -NodeUrl https://fullnode.testnet.aptoslabs.com
    .\publish-move.ps1 # uses configured CLI profile

Security notes
- Keep private key files secure and never commit them to source control.
- When using publish-move.ps1 with a key file, make sure the folder permissions protect the key file.
