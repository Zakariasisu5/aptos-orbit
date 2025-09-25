# Contract Integration (Aptos)

This project contains minimal helpers to integrate on-chain Move modules and the frontend.

Files added:

- `src/integrations/aptos/client.ts` — REST helpers for reading account resources and submitting transactions.
- `src/hooks/useContract.ts` — React hook exposing `readResource` and `submitWithWallet`.

How to wire a real wallet adapter

1. Implement wallet adapter methods on `src/store/walletStore.ts` or add a new adapter module. Your store should expose at least:
   - `isConnected`, `address`, `walletType`
   - `signAndSubmit(payload)` — sign and submit a transaction using the wallet provider and return transaction result.

2. The `submitWithWallet` helper in `useContract` will call `wallet.signAndSubmit(payload)` if available.

Reading on-chain resources

- Example:

```ts
const { readResource } = useContract();
const resource = await readResource('0xabc...', '0x1::Token::TokenStore');
```

Submitting transactions

- If wallet adapter supports `signAndSubmit`, call:

```ts
const { submitWithWallet } = useContract();
const result = await submitWithWallet({ /* transaction payload for your wallet */ });
```

- Or, if you already have a signed transaction object (e.g., signed bytes), pass `{ signedTxn }` and the hook will submit via REST.

Configure node URL

- Set `REACT_APP_APTOS_NODE_URL` in your environment to point to an Aptos fullnode REST endpoint, e.g.:

```
REACT_APP_APTOS_NODE_URL=https://fullnode.devnet.aptos.dev/v1
```

Notes & next steps

- The wallet store currently contains mocked connect/disconnect logic. To enable full on-chain interactions, wire a real Aptos wallet adapter (Petra, Martian, Pontem) that implements `signAndSubmit`.
- If you’d like, I can add an example of signing a simple transfer transaction using Petra/Martian SDKs and wiring it into `walletStore`.

## Alternatives for testing and deployment

If you want to test or deploy the Move contracts without installing the Aptos CLI locally (or in addition to it), here are several supported options. All examples use PowerShell-friendly commands for this repository (Windows users).

1) Local Aptos CLI (recommended for development)

- Install the Aptos CLI (see official docs). Once `aptos` is on your PATH, compile from the Move package directory:

```powershell
cd .\Smart-contracts\Move\Aptos-VM
aptos move compile --package-dir .
```

- Publish (requires a funded account / private key file):

```powershell
# example using a private key file
aptos move publish --package-dir . --private-key-file C:\path\to\key.txt --assume-yes --node-url https://fullnode.devnet.aptos.dev
```

- This repository includes helper scripts you can use instead of typing the commands manually:
   - `scripts\compile-move.ps1` — runs the compile command from the project Move package
   - `scripts\publish-move.ps1` — publish wrapper that accepts a key file or profile

2) Run Aptos CLI inside Docker (no local install)

- If you prefer not to install the CLI on Windows, you can run it inside a container. Example (replace IMAGE with a container that contains the Aptos CLI; see aptos-core repo for images or build your own):

```powershell
# run compile inside a temporary container, mounting the package dir
docker run --rm -v ${PWD}:/workspace -w /workspace/Smart-contracts/Move/Aptos-VM IMAGE_NAME aptos move compile --package-dir .
```

- To publish from Docker you can mount a file containing the private key and pass it through the container. Keep secrets safe and prefer GitHub Actions or a secure runner for automation.

3) GitHub Actions / CI (recommended for automated deploys)

- Create a workflow that installs or downloads the Aptos CLI in the CI step, then runs compile and optionally publish. Keep private keys in GitHub Secrets and use the `--private-key-file` option with a temporarily created file in the runner.

- Example job outline (pseudo-steps):
   - Checkout
   - Install dependencies / download aptos CLI
   - aptos move compile --package-dir Smart-contracts/Move/Aptos-VM
   - If publishing: write secret key to a file and run aptos move publish --private-key-file keyfile

4) Move unit tests & Move Prover (static verification)

- Use Move unit tests to drive local logic tests (if your package includes tests). The Aptos Move toolchain supports writing unit tests inside Move modules and running them with `aptos move test`.

- Example (once aptos CLI is available):

```powershell
cd .\Smart-contracts\Move\Aptos-VM
aptos move test --package-dir .
```

- Run the Move Prover for formal properties where applicable (more advanced; requires writing .exp specs and using the Move Prover toolchain).

5) Quick tips and security notes

- Don't store private keys in the repository. Use environment variables, OS-level key stores, or CI secrets.
- For local manual publish, prefer using a temporary profile and funding an account with small gas on testnet/devnet.
- If you need me to add a CI workflow or a Dockerfile that packages the Aptos CLI for this repo, say which option you prefer and I can add it.

If you'd like, I can also add a short GitHub Actions workflow or a Dockerfile/example image to this repo — tell me which you prefer and I'll add it.
