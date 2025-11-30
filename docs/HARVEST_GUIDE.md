# Yield Harvesting Guide

## Overview

This guide explains how to harvest yield from vaults and distribute it to NGOs.

## How It Works

1. **Vault Accumulates Yield**: As users deposit funds, the vault deploys them to yield strategies (e.g., AMM pools)
2. **LP Tokens Grow**: The vault holds LP tokens that represent its share of the AMM pool
3. **Harvest Yield**: A harvest script withdraws a portion of LP tokens and converts them to XRP
4. **Send to NGO**: The harvested yield is automatically sent to the NGO address configured in the vault metadata

## Running the Harvest Script

### Prerequisites

- Vault must have accumulated LP tokens in an AMM pool
- Vault metadata must have a valid NGO address (25-35 character XRPL address starting with 'r')
- Vault seed must be available in environment or script

### Manual Harvest

```bash
bun scripts/harvest-yield.ts
```

### What the Script Does

1. Connects to XRPL testnet
2. Fetches vault metadata from registry (including NGO address)
3. Checks vault's LP token balance in AMM pool
4. Withdraws 5% of LP tokens from the AMM
5. Calculates yield (XRP received - reserves)
6. Sends yield to NGO wallet
7. Logs transaction hashes for verification

### Example Output

```
🌾 Harvesting vault yield...
   Vault: rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9
   AMM Pool: rhWjzUgR1dhTNS5BLc8d1xrdUncEATZXAa
   NGO Address: rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak

💰 Current LP Token Balance: 27007.25091849531

🔄 Withdrawing yield portion from AMM...
   Withdrawing: 1350.36254592 LP tokens
   ✅ Withdrawal TX: 96F5ADA0A123...

💵 Vault XRP after withdrawal: 123.518192
   Estimated yield: 103.52 XRP

💝 Sending yield to NGO...
   Amount: 103.018192 XRP
   To: rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak
   ✅ Payment TX: 2301F4AED9D18A37...

🎉 Yield harvested and sent to NGO!
```

## Verifying NGO Received Funds

```bash
bun scripts/check-ngo-balance.ts
```

## NGO Wallet Setup

### Creating an NGO Wallet

```bash
bun scripts/create-ngo-wallet.ts
```

This will:
1. Generate a new XRPL wallet
2. Fund it from testnet faucet
3. Display the address and seed
4. Provide environment variables to add to `.env`

### Updating Vault NGO Address

```bash
bun scripts/update-vault-ngo.ts
```

This updates the vault's metadata to point to a valid NGO address.

## Harvest Frequency

For production:
- Set up a cron job or scheduled task
- Recommended: Daily or weekly harvests
- Consider gas costs vs. yield accumulated
- Minimum threshold: 1 XRP yield

## Monitoring

### Check All Vault NGO Addresses

```bash
bun scripts/list-vault-ngos.ts
```

Shows all vaults and their NGO addresses with validation status.

### Key Metrics to Monitor

- LP token balance growth
- AMM pool trading volume
- Yield per harvest
- NGO wallet balance
- Transaction success rate

## Troubleshooting

### "Invalid field Destination" Error

**Cause**: NGO address in vault metadata is invalid (not a proper XRPL address)

**Solution**: 
1. Create valid NGO wallet: `bun scripts/create-ngo-wallet.ts`
2. Update vault metadata: `bun scripts/update-vault-ngo.ts`

### "Decimal precision out of range" Error

**Cause**: LP token amount has too many decimal places

**Solution**: Use `.toFixed(8)` when converting LP token amounts to strings

### "Vault has no LP tokens" Error

**Cause**: Vault hasn't deployed funds to AMM yet, or all LP tokens have been withdrawn

**Solution**: Wait for deposits to be processed, or check vault deposit listener is running

## Advanced: Automatic Periodic Harvesting

To implement automatic harvesting:

1. Create a cron job or scheduled task
2. Run harvest script on schedule
3. Monitor logs for errors
4. Alert on failures
5. Track yield distribution over time

### Example Cron Setup (Linux/Mac)

```bash
# Harvest yield daily at 2 AM
0 2 * * * cd /path/to/XRPL_hackathon && bun scripts/harvest-yield.ts >> logs/harvest.log 2>&1
```

## Security Considerations

- **Vault Seeds**: Store vault seeds securely (environment variables, secrets manager)
- **NGO Verification**: Verify NGO addresses before updating vault metadata
- **Transaction Monitoring**: Monitor all harvest transactions for anomalies
- **Rate Limiting**: Don't harvest too frequently (wastes gas)
- **Reserve Requirements**: Always maintain minimum XRP reserve in vault (20 XRP + buffer)

## Related Scripts

- `scripts/harvest-yield.ts` - Main harvest script
- `scripts/generate-amm-yield.ts` - Generate demo yield by swapping on AMM
- `scripts/create-ngo-wallet.ts` - Create new NGO wallet
- `scripts/update-vault-ngo.ts` - Update vault NGO address
- `scripts/check-ngo-balance.ts` - Check NGO wallet balance
- `scripts/list-vault-ngos.ts` - List all vault NGO addresses
