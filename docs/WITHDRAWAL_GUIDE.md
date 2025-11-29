# Guide: Withdrawal (Retrait)

## Comment ça fonctionne

Lorsqu'un utilisateur fait un withdrawal:

1. **L'utilisateur envoie ses vault tokens au vault** (ex: 10 WWF → vault)
2. **Le vault listener détecte la transaction** (script `start-vault-listeners.ts`)
3. **Le vault renvoie automatiquement les tokens sous-jacents à l'utilisateur** (ex: 10 XRP → utilisateur)

## Pour que les withdrawals fonctionnent

### 1. Lancer le listener de vaults

Le script `start-vault-listeners.ts` doit être en cours d'exécution:

```bash
bun scripts/start-vault-listeners.ts
```

Ce script:
- Se connecte à XRPL Testnet
- Charge tous les vaults depuis le registry
- Écoute les transactions sur chaque vault
- Traite automatiquement:
  - **Deposits**: Quand quelqu'un envoie XRP/tokens → émet vault tokens
  - **Withdrawals**: Quand quelqu'un renvoie vault tokens → renvoie XRP/tokens

### 2. Utiliser l'interface web

Dans l'application:
1. Connectez votre wallet
2. Allez sur un vault où vous avez des tokens
3. Cliquez sur l'onglet **"Withdraw"**
4. Entrez le montant ou cliquez **"MAX"**
5. Cliquez **"Withdraw"**
6. Approuvez la transaction dans votre wallet

### 3. Le vault renvoie automatiquement les fonds

Si le listener est actif:
- ✅ Il détecte votre transaction immédiatement
- ✅ Il renvoie automatiquement les tokens sous-jacents
- ✅ Vous recevez vos fonds en quelques secondes

## Architecture technique

### VaultService - Gestion des withdrawals

Le `VaultService` (dans `services/vault.service.ts`) gère automatiquement:

**Détection** (ligne 62-68):
```typescript
if (amount.currency === this.config.vaultTokenCurrency &&
    amount.issuer === this.config.address) {
  await this.handleWithdrawal(transaction.Account, amount.value);
  return;
}
```

**Traitement** (méthode `handleWithdrawal`):
1. Withdraw funds from strategy (AMM, staking, etc.)
2. Envoie les tokens sous-jacents à l'utilisateur
3. Met à jour les balances internes

### Support XRP et tokens

Le système gère:
- **XRP**: Convertit en drops (1 XRP = 1,000,000 drops)
- **Issued currencies**: Utilise l'objet {currency, issuer, value}

## Test manuel d'un withdrawal

Si vous voulez tester le withdrawal avec un script:

```bash
# Ajouter vos credentials à .env
TEST_USER_ADDRESS=rYourAddress
TEST_USER_SEED=sYourSeed

# Lancer le test
bun scripts/test-withdrawal.ts
```

## Dépannage

### "Transaction failed or was rejected"
- ✅ Vérifiez que vous avez assez de vault tokens
- ✅ Vérifiez que votre wallet est bien connecté

### Les fonds ne reviennent pas
- ❌ Le listener n'est probablement pas lancé
- ✅ Lancez `bun scripts/start-vault-listeners.ts`
- ✅ Vérifiez les logs du listener

### "No supported wallet found"
- ✅ Installez GemWallet, Xaman, ou Crossmark
- ✅ Connectez votre wallet avant de withdraw

## Scripts disponibles

- `start-vault-listeners.ts` - Lance les listeners pour TOUS les vaults
- `process-deposits.ts` - Traite manuellement les deposits passés
- `test-withdrawal.ts` - Test un withdrawal avec un wallet de test
