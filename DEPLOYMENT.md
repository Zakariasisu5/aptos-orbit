# GlobePayX Smart Contract Deployment Guide

This guide explains how to deploy the GlobePayX smart contracts and integrate them with the frontend.

## Prerequisites

1. **Aptos CLI** installed ([Installation Guide](https://aptos.dev/tools/aptos-cli/install-cli/))
2. **Node.js** (v16 or higher)
3. **Aptos Wallet** (Petra, Martian, or Pontem)

## Step 1: Set Up Your Aptos Account

```bash
# Create a new Aptos account (or use existing one)
aptos init

# This will create a .aptos/config.yaml file with your account details
```

## Step 2: Configure Environment Variables

1. Copy your account address from `.aptos/config.yaml`
2. Create/update `.env` file in the project root:

```env
VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=0xYourAccountAddress
```

## Step 3: Update Contract Addresses

In `Contracts/Move.toml`, update the named addresses:

```toml
[addresses]
GLOBE_CORE = "0xYourAccountAddress"
GLOBE_BUSINESS = "0xYourAccountAddress"
```

## Step 4: Compile Contracts

```bash
cd Contracts
node compile.js
```

Or manually:

```bash
aptos move compile --package-dir Contracts --named-addresses GLOBE_CORE=0xYourAddress,GLOBE_BUSINESS=0xYourAddress
```

## Step 5: Deploy Contracts

Deploy to Aptos testnet:

```bash
aptos move publish --package-dir Contracts --named-addresses GLOBE_CORE=0xYourAddress,GLOBE_BUSINESS=0xYourAddress
```

**Important**: Save the transaction hash and contract addresses from the deployment output!

## Step 6: Update Frontend Configuration

After successful deployment, update `src/config/contracts.ts`:

```typescript
export const GLOBE_CORE = '0xYourDeployedCoreAddress';
export const GLOBE_BUSINESS = '0xYourDeployedBusinessAddress';
```

## Step 7: Initialize Contracts

The contracts need to be initialized after deployment. This happens automatically when the module is published, but you can verify:

### Verify GlobePayXCore Initialization

```bash
aptos move view --function-id '0xYourAddress::GlobePayXCore::get_swap_fee_bps'
```

Expected output: `25` (default 0.25% fee)

### Create Organization (for Business module)

Use the frontend or CLI:

```bash
aptos move run \
  --function-id '0xYourAddress::GlobePayXBusiness::create_org' \
  --assume-yes
```

## Step 8: Fund Your Wallet with Test APT

Get test APT from the faucet:

```bash
aptos account fund-with-faucet --account 0xYourAddress
```

Or use the [Aptos Faucet](https://aptoslabs.com/testnet-faucet)

## Contract Features

### GlobePayXCore Module

**Functions:**
- `send_stablecoin<CoinType>` - Send any supported coin type to a recipient
- `swap_request<CoinIn, CoinOut>` - Request a currency swap (2-step process)
- `execute_swap<CoinIn, CoinOut>` - Admin function to fulfill swap requests
- `set_swap_fee_bps` - Admin function to update swap fee

**Events Emitted:**
- `TransferEvent` - When coins are sent
- `SwapEvent` - When swap is executed
- `AuditEvent` - Generic audit trail

### GlobePayXBusiness Module

**Functions:**
- `create_org` - Initialize an organization
- `batch_pay<CoinType>` - Send payments to multiple recipients (payroll)
- `init_treasury<CoinType>` - Initialize treasury for a coin type
- `fund_treasury<CoinType>` - Fund organization treasury
- `internal_transfer<CoinType>` - Transfer between treasury tags
- `withdraw_from_tag<CoinType>` - Withdraw from treasury tag

**Events Emitted:**
- `PayrollEvent` - When batch payments are made
- `TreasuryEvent` - When treasury operations occur

## Frontend Integration

### Connecting Wallet

The app automatically connects to Petra, Martian, or Pontem wallets. Click "Connect Wallet" in the navbar.

### Sending Money

1. Navigate to "Send Money" page
2. Enter recipient address
3. Enter amount and select currency
4. Click "Send" and approve transaction in wallet

### Batch Payroll

1. Navigate to "Payroll" page
2. Add recipients (wallet address + amount)
3. Click "Send Payroll" and approve transaction

### Swapping Currency

1. Navigate to "Send Money" or create a dedicated swap page
2. Select from/to currencies
3. Enter amount
4. Approve transaction (2-step process: request + admin execution)

## Testing

### Test Sending APT

```typescript
// In browser console (after connecting wallet)
import { sendStablecoin } from '@/services/aptosService';
import { getWalletProvider } from '@/services/aptosService';

const wallet = getWalletProvider('petra');
await sendStablecoin(wallet, '0xRecipientAddress', 0.1, 'APT');
```

### Test Batch Payroll

```typescript
import { batchPayrollSend } from '@/services/aptosService';

const recipients = [
  { wallet: '0xAddress1', amount: 0.1, currency: 'APT' },
  { wallet: '0xAddress2', amount: 0.2, currency: 'APT' },
];

await batchPayrollSend(wallet, recipients);
```

## Troubleshooting

### "Module not found" Error

- Ensure contracts are deployed
- Verify `GLOBE_CORE` and `GLOBE_BUSINESS` addresses in `src/config/contracts.ts`

### "Insufficient Balance" Error

- Fund your wallet with test APT from faucet
- Check balance: `aptos account list --account 0xYourAddress`

### "Type not registered" Error

- Ensure recipient has registered the coin type
- For APT, this is automatic
- For custom coins, recipient must call `coin::register<CoinType>`

### Transaction Fails

- Check console logs for detailed error
- Verify function arguments match contract expectations
- Ensure you have enough APT for gas fees

## Production Deployment

For mainnet deployment:

1. Update `NETWORK` in `src/config/contracts.ts` to `'mainnet'`
2. Use mainnet account in `.aptos/config.yaml`
3. Deploy contracts to mainnet
4. Update contract addresses in config
5. Test thoroughly before releasing!

## Resources

- [Aptos Documentation](https://aptos.dev/)
- [Move Language Reference](https://aptos.dev/move/move-on-aptos/)
- [Aptos TypeScript SDK](https://aptos.dev/sdks/ts-sdk/)
- [GlobePayX Contracts Source](https://github.com/thebuildercore/Smart-contracts/tree/main/Move/Aptos-VM)
