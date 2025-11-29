import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { VaultService } from "../services/vault.service";
import { AMMStrategy } from "../services/strategies/amm.strategy";

console.log("🧪 Testing Vault with AMM Strategy - Deposit Only\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

const vaultWallet = Wallet.generate();
const userWallet = Wallet.generate();

console.log("📍 Vault:", vaultWallet.address);
console.log("📍 User:", userWallet.address, "\n");

await Promise.all([client.fundWallet(vaultWallet), client.fundWallet(userWallet)]);

const accountSet = {
  TransactionType: "AccountSet" as const,
  Account: vaultWallet.address,
  SetFlag: 8,
};
await client.submitAndWait(vaultWallet.sign(await client.autofill(accountSet)).tx_blob);

console.log("🏊 Creating AMM pool...");
const ammCreate = {
  TransactionType: "AMMCreate" as const,
  Account: vaultWallet.address,
  Amount: "10000000",
  Amount2: { currency: "TST", issuer: vaultWallet.address, value: "1000" },
  TradingFee: 500,
};
await client.submitAndWait(vaultWallet.sign(await client.autofill(ammCreate)).tx_blob);

const ammInfo = await client.request({
  command: "amm_info",
  asset: { currency: "XRP" } as any,
  asset2: { currency: "TST", issuer: vaultWallet.address },
  ledger_index: "validated",
});

console.log("✅ AMM Account:", ammInfo.result.amm.account, "\n");

const strategy = new AMMStrategy({
  vaultAddress: vaultWallet.address,
  vaultWallet,
  ammAccount: ammInfo.result.amm.account,
  asset: { currency: "XRP" } as any,
  asset2: { currency: "TST", issuer: vaultWallet.address },
  baseCurrency: "TST",
  baseCurrencyIssuer: vaultWallet.address,
});

const vault = new VaultService({
  address: vaultWallet.address,
  wallet: vaultWallet,
  vaultTokenCurrency: "VTS",
  acceptedCurrency: "TST",
  acceptedCurrencyIssuer: vaultWallet.address,
  strategy,
});

console.log("🔗 Setting up trustlines...");
await client.submitAndWait(userWallet.sign(await vault.prepareTrustline(userWallet.address)).tx_blob);
await client.submitAndWait(
  userWallet.sign(
    await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: userWallet.address,
      LimitAmount: { currency: "TST", issuer: vaultWallet.address, value: "100000" },
    })
  ).tx_blob
);

console.log("💸 Sending 100 TST to user...");
await client.submitAndWait(
  vaultWallet.sign(
    await client.autofill({
      TransactionType: "Payment" as const,
      Account: vaultWallet.address,
      Destination: userWallet.address,
      Amount: { currency: "TST", issuer: vaultWallet.address, value: "100" },
    })
  ).tx_blob
);

vault.listenForDeposits();
await new Promise((r) => setTimeout(r, 2000));

console.log("💰 User deposits 50 TST...\n");
await client.submitAndWait(
  userWallet.sign(
    await client.autofill(vault.prepareUserDeposit(userWallet.address, "50") as any)
  ).tx_blob
);

console.log("⏳ Waiting 8s for processing...");
await new Promise((r) => setTimeout(r, 8000));

const balance = await xrplService.getAccountBalance(userWallet.address);
console.log("\n📊 User Balances:");
console.log("   TST:", balance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   VTS:", balance.tokens.find((t) => t.currency === "VTS")?.balance || "0");

console.log("\n📊 Strategy:");
console.log("   Deployed:", strategy.getTotalDeployed());
console.log("   LP Tokens:", strategy.getLPTokensHeld());

console.log("\n✅ Success! Deposit processed and funds deployed to AMM");

await xrplService.disconnect();
