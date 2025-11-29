import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { VaultService } from "../services/vault.service";
import { AMMStrategy } from "../services/strategies/amm.strategy";

console.log("🧪 Testing Vault with AMM Strategy (Simple)\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

const vaultWallet = Wallet.generate();
const userWallet = Wallet.generate();

console.log("📍 Vault address:", vaultWallet.address);
console.log("📍 User address:", userWallet.address);

console.log("\n💰 Funding wallets...");
await Promise.all([
  client.fundWallet(vaultWallet),
  client.fundWallet(userWallet),
]);
console.log("✅ Wallets funded\n");

console.log("⚙️  Setting up TST token with rippling...");
const accountSet = {
  TransactionType: "AccountSet" as const,
  Account: vaultWallet.address,
  SetFlag: 8,
};
const accountSetPrepared = await client.autofill(accountSet);
const accountSetSigned = vaultWallet.sign(accountSetPrepared);
await client.submitAndWait(accountSetSigned.tx_blob);
console.log("✅ DefaultRipple enabled\n");

console.log("🏊 Creating AMM pool (XRP/TST)...");
const ammCreate = {
  TransactionType: "AMMCreate" as const,
  Account: vaultWallet.address,
  Amount: "10000000",
  Amount2: {
    currency: "TST",
    issuer: vaultWallet.address,
    value: "1000",
  },
  TradingFee: 500,
};

const prepared = await client.autofill(ammCreate);
const signed = vaultWallet.sign(prepared);
const result = await client.submitAndWait(signed.tx_blob);

console.log("✅ AMM created:", result.result.hash);

const ammInfo = await client.request({
  command: "amm_info",
  asset: { currency: "XRP" } as any,
  asset2: {
    currency: "TST",
    issuer: vaultWallet.address,
  },
  ledger_index: "validated",
});

const ammAccount = ammInfo.result.amm.account;
console.log("   AMM Account:", ammAccount);
console.log("   LP Token:", ammInfo.result.amm.lp_token);

console.log("\n🏗️  Creating Vault with AMM Strategy...");
const strategy = new AMMStrategy({
  vaultAddress: vaultWallet.address,
  vaultWallet,
  ammAccount,
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

console.log("✅ Vault created\n");

console.log("🔗 User creates trustline for VTS...");
const trustlineTx = await vault.prepareTrustline(userWallet.address);
const trustlineSigned = userWallet.sign(trustlineTx);
await client.submitAndWait(trustlineSigned.tx_blob);
console.log("✅ Trustline created\n");

console.log("🔗 User creates trustline for TST...");
const tstTrustline = {
  TransactionType: "TrustSet" as const,
  Account: userWallet.address,
  LimitAmount: {
    currency: "TST",
    issuer: vaultWallet.address,
    value: "100000",
  },
};
const tstPrepared = await client.autofill(tstTrustline);
const tstSigned = userWallet.sign(tstPrepared);
await client.submitAndWait(tstSigned.tx_blob);
console.log("✅ TST trustline created\n");

console.log("💸 Vault sends 100 TST to user...");
const sendTST = {
  TransactionType: "Payment" as const,
  Account: vaultWallet.address,
  Destination: userWallet.address,
  Amount: {
    currency: "TST",
    issuer: vaultWallet.address,
    value: "100",
  },
};
const tstPaymentPrepared = await client.autofill(sendTST);
const tstPaymentSigned = vaultWallet.sign(tstPaymentPrepared);
await client.submitAndWait(tstPaymentSigned.tx_blob);
console.log("✅ User has 100 TST\n");

console.log("👂 Starting deposit listener...");
vault.listenForDeposits();

await new Promise((resolve) => setTimeout(resolve, 2000));

console.log("💰 User deposits 50 TST...");
const depositTx = vault.prepareUserDeposit(userWallet.address, "50");
const depositPrepared = await client.autofill(depositTx as any);
const depositSigned = userWallet.sign(depositPrepared);
await client.submitAndWait(depositSigned.tx_blob);

console.log("⏳ Waiting for deposit to be processed...");
await new Promise((resolve) => setTimeout(resolve, 15000));

const userBalance = await xrplService.getAccountBalance(userWallet.address);
console.log("\n📊 User balances after deposit:");
console.log("   TST:", userBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   VTS:", userBalance.tokens.find((t) => t.currency === "VTS")?.balance || "0");

console.log("\n📊 Strategy state:");
console.log("   Total deployed:", strategy.getTotalDeployed());
console.log("   LP tokens held:", strategy.getLPTokensHeld());

console.log("\n⏳ Waiting before withdrawal...");
await new Promise((resolve) => setTimeout(resolve, 3000));

console.log("\n📤 User withdraws 25 VTS...");
try {
  const { burnTx, paymentTx } = await vault.prepareUserWithdrawal(userWallet.address, "25");

  console.log("   Burning 25 VTS...");
  const burnSigned = userWallet.sign(burnTx);
  await client.submitAndWait(burnSigned.tx_blob);

  console.log("   Sending 25 TST back...");
  const paymentSigned = vaultWallet.sign(paymentTx);
  await client.submitAndWait(paymentSigned.tx_blob);

  console.log("✅ Withdrawal complete");
} catch (error: any) {
  console.error("❌ Withdrawal error:", error.message);
  console.error("   Full error:", error);
}

await new Promise((resolve) => setTimeout(resolve, 3000));

const finalBalance = await xrplService.getAccountBalance(userWallet.address);
console.log("\n📊 Final user balances:");
console.log("   TST:", finalBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   VTS:", finalBalance.tokens.find((t) => t.currency === "VTS")?.balance || "0");

console.log("\n📊 Final strategy state:");
console.log("   Total deployed:", strategy.getTotalDeployed());
console.log("   LP tokens held:", strategy.getLPTokensHeld());

console.log("\n✅ Test completed!");

await xrplService.disconnect();
