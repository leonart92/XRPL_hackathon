import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { VaultService } from "../services/vault.service";
import { AMMStrategy } from "../services/strategies/amm.strategy";

console.log("🧪 Testing Vault AMM Full Cycle\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

const issuerWallet = Wallet.generate();
const vaultWallet = Wallet.generate();
const userWallet = Wallet.generate();

console.log("📍 Issuer:", issuerWallet.address);
console.log("📍 Vault:", vaultWallet.address);
console.log("📍 User:", userWallet.address, "\n");

console.log("💰 Funding wallets...");
await Promise.all([
  client.fundWallet(issuerWallet),
  client.fundWallet(vaultWallet),
  client.fundWallet(userWallet),
]);
console.log("✅ Funded\n");

console.log("⚙️  Enabling DefaultRipple on issuer...");
await client.submitAndWait(
  issuerWallet.sign(
    await client.autofill({
      TransactionType: "AccountSet" as const,
      Account: issuerWallet.address,
      SetFlag: 8,
    })
  ).tx_blob
);
console.log("✅ Done\n");

console.log("🏊 Creating AMM pool (XRP/TST)...");
await client.submitAndWait(
  issuerWallet.sign(
    await client.autofill({
      TransactionType: "AMMCreate" as const,
      Account: issuerWallet.address,
      Amount: "10000000",
      Amount2: { currency: "TST", issuer: issuerWallet.address, value: "1000" },
      TradingFee: 500,
    })
  ).tx_blob
);

const ammInfo = await client.request({
  command: "amm_info",
  asset: { currency: "XRP" } as any,
  asset2: { currency: "TST", issuer: issuerWallet.address },
  ledger_index: "validated",
});

console.log("✅ AMM Account:", ammInfo.result.amm.account, "\n");

console.log("🔗 Vault creates TST trustline...");
await client.submitAndWait(
  vaultWallet.sign(
    await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: vaultWallet.address,
      LimitAmount: { currency: "TST", issuer: issuerWallet.address, value: "1000000" },
    })
  ).tx_blob
);
console.log("✅ Done\n");

const strategy = new AMMStrategy({
  vaultAddress: vaultWallet.address,
  vaultWallet,
  ammAccount: ammInfo.result.amm.account,
  asset: { currency: "XRP" } as any,
  asset2: { currency: "TST", issuer: issuerWallet.address },
  baseCurrency: "TST",
  baseCurrencyIssuer: issuerWallet.address,
});

const vault = new VaultService({
  address: vaultWallet.address,
  wallet: vaultWallet,
  vaultTokenCurrency: "VTS",
  acceptedCurrency: "TST",
  acceptedCurrencyIssuer: issuerWallet.address,
  strategy,
});

console.log("🔗 User creates trustlines...");
await client.submitAndWait(userWallet.sign(await vault.prepareTrustline(userWallet.address)).tx_blob);
await client.submitAndWait(
  userWallet.sign(
    await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: userWallet.address,
      LimitAmount: { currency: "TST", issuer: issuerWallet.address, value: "100000" },
    })
  ).tx_blob
);
console.log("✅ Done\n");

console.log("💸 Issuer sends 100 TST to user...");
await client.submitAndWait(
  issuerWallet.sign(
    await client.autofill({
      TransactionType: "Payment" as const,
      Account: issuerWallet.address,
      Destination: userWallet.address,
      Amount: { currency: "TST", issuer: issuerWallet.address, value: "100" },
    })
  ).tx_blob
);
console.log("✅ Done\n");

vault.listenForDeposits();
await new Promise((r) => setTimeout(r, 2000));

console.log("💰 User deposits 50 TST...");
await client.submitAndWait(
  userWallet.sign(
    await client.autofill(vault.prepareUserDeposit(userWallet.address, "50") as any)
  ).tx_blob
);

console.log("⏳ Waiting for deployment...");
await new Promise((r) => setTimeout(r, 10000));

console.log("\n💸 User withdraws 25 TST (burns 25 VTS)...");
await client.submitAndWait(
  userWallet.sign(
    await client.autofill({
      TransactionType: "Payment" as const,
      Account: userWallet.address,
      Destination: vaultWallet.address,
      Amount: { currency: "VTS", issuer: vaultWallet.address, value: "25" },
    })
  ).tx_blob
);

console.log("⏳ Waiting for withdrawal...");
await new Promise((r) => setTimeout(r, 15000));

// Query balance directly from XRPL
const userLines = await client.request({
  command: "account_lines",
  account: userWallet.address,
  ledger_index: "validated",
});

console.log("\n📊 Final User Balances:");
for (const line of userLines.result.lines) {
  console.log(`   ${line.currency}: ${line.balance} (issuer: ${line.account})`);
}

console.log("\n📊 Strategy:");
console.log("   Deployed:", strategy.getTotalDeployed());
console.log("   LP Tokens:", strategy.getLPTokensHeld());

console.log("\n✅ Full cycle test complete!");

await xrplService.disconnect();
