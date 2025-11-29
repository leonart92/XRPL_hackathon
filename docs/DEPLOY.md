# Deploy Vault Script

Deploy un nouveau vault sur le registry configuré dans `.env`.

## Configuration

Copier `.env.example` vers `.env` et remplir les valeurs:

```bash
cp .env.example .env
```

Ou créer un nouveau registry:

```bash
bun create-registry.ts
```

## Utilisation

### 1. Deploy un vault avec la config par défaut:

```bash
bun deploy-vault.ts
```

### 2. Deploy un vault personnalisé:

```typescript
import { deployVault } from "./deploy-vault";

await deployVault({
  vaultName: "XRP/EUR AMM Vault",
  vaultDescription: "Earn yield on XRP/EUR liquidity",
  vaultTokenCurrency: "VEU",
  acceptedCurrency: "EUR",
  acceptedCurrencyIssuer: "r...",
  strategyType: "AMM",
});
```

### 3. Lister les vaults déployés:

```bash
bun test-vaults-fetch.ts
```

## Variables d'environnement requises

- `REGISTRY_ADDRESS` - Adresse du registry XRPL
- `REGISTRY_SEED` - Seed du wallet registry
- `XRPL_NETWORK` - Network XRPL (testnet/mainnet)
- `DEFAULT_CURRENCY_ISSUER` - (Optional) Issuer par défaut pour tests

## Structure

```
.env                  # Config (gitignored)
.env.example          # Template de config
create-registry.ts    # Créer un nouveau registry
deploy-vault.ts       # Script de déploiement
test-vaults-fetch.ts  # Test de récupération des vaults
```
