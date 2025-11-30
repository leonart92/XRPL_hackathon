# YAID - Yield Aggregator for Impact Donations

> **DeFi for Good**: A yield-generating vault platform on XRPL that automatically donates profits to environmental NGOs

[![XRPL](https://img.shields.io/badge/XRPL-Testnet-blue)](https://xrpl.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Overview

YAID (Yield Aggregator for Impact Donations) is a decentralized finance platform built on the XRP Ledger that enables users to earn yield on their crypto assets while automatically donating a portion of profits to environmental organizations. By combining automated market maker (AMM) strategies with social impact, YAID creates a win-win ecosystem where users grow their wealth and environmental NGOs receive sustainable funding.

## The Problem We Solve

Environmental organizations struggle with consistent funding, while crypto investors seek meaningful ways to generate passive income. YAID bridges this gap by creating an automated system where:

- Users earn competitive yields on their deposits
- Environmental NGOs receive automatic, transparent donations
- All transactions are verifiable on the XRPL blockchain
- No intermediaries reduce the impact of contributions

## How It Works

### On the Blockchain

YAID leverages several XRPL features to create a transparent, automated yield distribution system:

#### 1. Vault Creation (XRPL Accounts)
Each vault is a dedicated XRPL account that:
- Issues its own **vault tokens** (e.g., TAT - Toto Association Token)
- Accepts deposits in **XRP** or specific tokens
- Stores metadata in the **Domain field** (vault config, NGO address, strategy)
- Registers in a **central registry** via trustlines

```
User Wallet → Vault Account → AMM Pool
              ↓
         Issues vTokens (1:1)
```

#### 2. Deposit Flow
When a user deposits:
1. Sends XRP/tokens to vault address
2. Vault listens for incoming payments (via XRPL subscriptions)
3. Vault **issues vault tokens** (vTokens) to the user at 1:1 ratio
4. Vault **deploys funds** to AMM strategy (liquidity pool)
5. Vault receives **LP tokens** representing pool position

```typescript
// Example: User deposits 100 XRP
Payment: User → Vault (100 XRP)
↓
Vault issues: 100 TAT tokens → User
↓
Vault deposits: 100 XRP → AMM Pool
↓
Vault receives: LP tokens (representing 100 XRP position)
```

#### 3. Yield Generation (AMM Strategy)
The vault deploys capital to XRPL AMM pools:
- **Automated Market Makers** (AMM) are XRPL's built-in liquidity pools
- Users trade against the pool, generating **trading fees**
- Fees accrue to LP token holders (the vault)
- LP tokens increase in value over time

Example AMM pools:
- XRP/USD pool
- XRP/rUSD pool
- Custom token pairs

#### 4. Yield Harvesting & NGO Distribution
Periodically (manual or automated):
1. **Harvest script** calculates accrued yield (LP token value increase)
2. Withdraws a percentage (e.g., 5%) of LP tokens from AMM
3. Receives underlying assets (XRP/tokens) from AMM withdrawal
4. **Sends 100% of harvested yield** to NGO wallet address
5. Transaction recorded on-chain for transparency

```
Harvest Cycle (Example):
- Vault holds: 27,007 LP tokens
- Harvest 5%: 1,350 LP tokens
- AMM returns: 103.5 XRP
- Send to NGO: 103 XRP ✅
```

#### 5. User Withdrawal
When users want to exit:
1. Send **vault tokens** back to vault
2. Vault withdraws from AMM strategy
3. Vault returns **original asset** (XRP/tokens) to user
4. Vault tokens are burned

### XRPL Technical Components

| Component | XRPL Feature | Purpose |
|-----------|--------------|---------|
| Vaults | XRPL Accounts | Hold deposits, issue tokens, execute strategy |
| Vault Tokens | Fungible Tokens | Represent user stake (1:1 with deposit) |
| Registry | Account Trustlines | Discover all vaults in ecosystem |
| Metadata | Domain Field | Store vault config (compressed JSON) |
| Yield Strategy | AMM Pools | Generate yield via trading fees |
| NGO Payments | Payment Transactions | Distribute harvested yield |
| Deposits/Withdrawals | Payment + TrustSet | User interactions |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         XRPL Ledger                         │
│                                                             │
│  ┌──────────┐         ┌──────────┐        ┌─────────────┐ │
│  │   User   │────────▶│  Vault   │───────▶│  AMM Pool   │ │
│  │  Wallet  │◀────────│ (Account)│◀───────│  (XRP/USD)  │ │
│  └──────────┘         └──────────┘        └─────────────┘ │
│       │                    │                      │        │
│    Deposit              Issues                 Returns    │
│    100 XRP              vTokens                LP Tokens  │
│                            │                              │
│                            ▼                              │
│                    ┌───────────────┐                      │
│                    │  Harvest Tx   │                      │
│                    │  (Periodic)   │                      │
│                    └───────┬───────┘                      │
│                            │                              │
│                            ▼                              │
│                    ┌───────────────┐                      │
│                    │  NGO Wallet   │                      │
│                    │ (Zero Waste)  │                      │
│                    └───────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Features

### For Users
- **Deposit & Earn**: Stake XRP/tokens to earn automatic yield
- **Transparent Returns**: Track your vault tokens and deposited amount
- **Easy Withdrawal**: Redeem vault tokens for original assets anytime
- **Impact Dashboard**: See how much your deposits contributed to NGOs
- **Multiple Vaults**: Choose vaults supporting different NGOs

### For NGOs
- **Passive Income**: Receive automatic donations from yield harvests
- **Transparent Tracking**: All donations visible on XRPL explorer
- **No Setup Required**: Just provide an XRPL wallet address
- **Sustainable Funding**: Recurring income as long as vault operates

### For Developers
- **Open Source**: Full codebase available for auditing
- **Extensible Strategies**: Add new yield sources (lending, staking, etc.)
- **Registry System**: Discover all vaults programmatically
- **API Server**: REST API for vault operations

## Tech Stack

### Blockchain
- **XRPL (XRP Ledger)**: Base layer for all transactions
- **xrpl.js v4.4.3**: JavaScript library for XRPL interaction
- **AMM Pools**: Native XRPL automated market makers
- **Fungible Tokens**: XRPL token standard for vault shares

### Frontend
- **React 19** + **TypeScript**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Recharts**: Yield visualization charts
- **Lucide Icons**: Beautiful icon set

### Backend
- **Bun**: Ultra-fast JavaScript runtime
- **Bun.serve()**: Native HTTP server with WebSocket support
- **TypeScript**: Type-safe backend code

### Wallet Integration
- **GemWallet**: Browser extension wallet
- **XUMM**: Mobile wallet integration
- **xrpl-wallet-kit**: Multi-wallet support

## Getting Started

### Prerequisites
- **Bun** v1.0+ ([install](https://bun.sh))
- **XRPL Wallet** (Testnet for development)
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/XRPL_hackathon.git
cd XRPL_hackathon

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your XRPL wallet seeds (NEVER commit!)
```

### Environment Variables

```bash
# XRPL Network
XRPL_NETWORK=testnet  # or 'mainnet'

# Registry (central vault discovery)
VITE_REGISTRY_ADDRESS=rUTZUX7DEtx3ytmS5pFLhquMuUaPx27mtt
REGISTRY_SEED=sEdS... # KEEP SECRET!

# Example NGO Wallet
NGO_ZERO_WASTE_ADDRESS=rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak
NGO_ZERO_WASTE_SEED=sEdT... # KEEP SECRET!
```

### Run Development Server

```bash
# Terminal 1: Frontend dev server
bun run dev

# Terminal 2: API server (for vault operations)
bun run api

# Visit http://localhost:5173
```

### Deploy a Vault

```bash
# Create a new vault for an NGO
bun scripts/deploy-vault.ts

# Follow prompts to configure:
# - Vault token currency (e.g., "TAT")
# - Accepted deposit currency (e.g., "XRP")
# - Yield strategy (AMM, SWAP, TOKEN_YIELD)
# - NGO wallet address
# - Vault name & description
```

### Start Vault Listeners

```bash
# Monitor all vaults for incoming deposits
bun scripts/start-vault-listeners.ts

# Output:
# 🎧 Listening for deposits on vault rsyu6pQ... (TAT vault)
# 💰 Detected deposit: 100 XRP from rUser...
# ✅ Issued 100 TAT tokens
# ✅ Deployed to AMM strategy
```

### Harvest Yield

```bash
# Extract yield and send to NGO
bun scripts/harvest-yield.ts

# Output:
# 📊 Vault has 27,007 LP tokens
# 🌾 Harvesting 5% (1,350 LP tokens)
# 💰 Withdrew 103.5 XRP from AMM
# 💸 Sent 103 XRP to NGO rBcW9Gt...
# ✅ Harvest complete!
```

## Demo Walkthrough

### 1. User Deposits 100 XRP
```typescript
// User connects wallet (GemWallet/XUMM)
// Selects "Zero Waste" vault
// Clicks "Deposit 100 XRP"

// Behind the scenes:
Payment {
  Account: "rUserWallet...",
  Destination: "rsyu6pQUbm...", // Vault address
  Amount: "100000000" // 100 XRP in drops
}

// Vault receives, issues tokens:
Payment {
  Account: "rsyu6pQUbm...", // Vault
  Destination: "rUserWallet...",
  Amount: {
    currency: "TAT",
    issuer: "rsyu6pQUbm...",
    value: "100"
  }
}

// Vault deploys to AMM:
AMMDeposit {
  Account: "rsyu6pQUbm...",
  Amount: "100000000",
  // Receives LP tokens
}
```

### 2. Yield Accrues Over Time
```
Day 0:  100 XRP deposited → 100 LP tokens (1.0 XRP/LP)
Day 7:  Trading fees accumulate
        LP tokens now worth 1.05 XRP each
        Vault position: 105 XRP (5% gain)
```

### 3. Harvest & Donate
```typescript
// Admin/automated script runs:
bun scripts/harvest-yield.ts

// Withdraws 5% of LP tokens
AMMWithdraw {
  LPTokens: "5" // 5% of position
}
// Receives: 5.25 XRP

// Send to NGO
Payment {
  Account: "rsyu6pQUbm...", // Vault
  Destination: "rBcW9Gt...", // NGO
  Amount: "5250000" // 5.25 XRP
}
```

### 4. User Withdraws
```typescript
// User sends vault tokens back
Payment {
  Account: "rUserWallet...",
  Destination: "rsyu6pQUbm...",
  Amount: {
    currency: "TAT",
    value: "100"
  }
}

// Vault returns XRP
Payment {
  Account: "rsyu6pQUbm...",
  Destination: "rUserWallet...",
  Amount: "100000000" // 100 XRP (original deposit)
}
```

## Live Demo (Testnet)

- **Frontend**: https://your-deployment.up.railway.app
- **Registry**: `rUTZUX7DEtx3ytmS5pFLhquMuUaPx27mtt`
- **Example Vault**: `rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9` (TAT - Zero Waste)
- **NGO Wallet**: `rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak`

### Test Transactions
- Successful harvest: [`2301F4AED9D18A37CFD65F99E928855FAD8308265738E79B2734FAE2F066B702`](https://testnet.xrpl.org/transactions/2301F4AED9D18A37CFD65F99E928855FAD8308265738E79B2734FAE2F066B702)
- LP withdrawal: [`96F5ADA0A123D37C5D8099CB33045CC9A61B96998A446D66E68466F4572B5DE6`](https://testnet.xrpl.org/transactions/96F5ADA0A123D37C5D8099CB33045CC9A61B96998A446D66E68466F4572B5DE6)

## Supported NGOs

The platform currently supports environmental organizations:

| NGO | Focus Area | XRPL Address |
|-----|------------|--------------|
| Zero Waste Circular Economy | Waste reduction & recycling | `rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak` |
| Ocean Cleanup Initiative | Marine conservation | `rOceanC...` |
| Reforestation Project | Carbon offsetting | `rForest...` |

*NGO metadata stored in `associations.json`*

## Roadmap

### Phase 1: MVP (Complete ✅)
- [x] Vault system with XRPL accounts
- [x] AMM strategy implementation
- [x] Automatic yield harvesting
- [x] NGO distribution system
- [x] Registry for vault discovery
- [x] Frontend UI for deposits/withdrawals
- [x] Multi-strategy vaults (AMM + lending)

### Phase 2: Automation (In Progress 🚧)
- [ ] Scheduled yield harvesting (cron jobs)
- [ ] Email notifications for harvests
- [ ] Governance token for vault parameters

### Phase 3: Mainnet Launch (Planned 📋)
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Partnership with real NGOs
- [ ] Marketing campaign

### Phase 4: Advanced Features (Future 🔮)
- [ ] Cross-chain bridges (Ethereum, Solana)
- [ ] Vault insurance via smart contracts
- [ ] Impact verification (proof of donation usage)
- [ ] DAO for NGO selection

## Security Considerations

- All private keys stored in `.env` (never committed to Git)
- Vault operations use XRPL's built-in multisig for future upgrades
- AMM withdrawals limited to prevent drain attacks
- Registry prevents unauthorized vault registration
- Frontend validates all user inputs
- API endpoints use CORS restrictions

## Testing

```bash
# Run end-to-end vault test
bun tests/test-vault-full-cycle.ts

# Test AMM deployment
bun test-amm-check.ts

# Test real deposits
bun test-real-deposit.ts

# Verify NGO balance
bun scripts/check-ngo-balance.ts
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **XRPL Foundation** for the amazing blockchain infrastructure
- **Ripple** for AMM implementation on XRPL
- **Environmental NGOs** partnering with us
- **Hackathon organizers** for the opportunity
- **Open source community** for invaluable tools

## Contact & Support

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/XRPL_hackathon/issues)
- **Twitter**: [@YAIDProtocol](https://twitter.com/YAIDProtocol)
- **Discord**: [Join our community](https://discord.gg/yaid)
- **Email**: hello@yaid.finance

---

**Built with ❤️ for the planet using XRPL**

*Making DeFi work for environmental causes, one block at a time.*
