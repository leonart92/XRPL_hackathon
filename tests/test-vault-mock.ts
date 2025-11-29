import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { VaultService } from "../services/vault.service";
import { MockStrategy } from "./services/strategies/mock.strategy";

console.log("🧪 Testing Vault System (Mock Strategy)\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

const vaultWallet = Wallet.generate();
const userWallet = Wallet.generate();
const ngoWallet = Wallet.generate();

console.log("📍 Vault address:", vaultWallet.address);
console.log("📍 User address:", userWallet.address);
console.log("📍 NGO address:", ngoWallet.address);

console.log("\n💰 Funding wallets...");
await Promise.all([
  client.fundWallet(vaultWallet),
  client.fundWallet(userWallet),
  client.fundWallet(ngoWallet),
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

console.log("🏗️  Creating Vault with Mock Strategy...");
const strategy = new MockStrategy();

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
await new Promise((resolve) => setTimeout(resolve, 8000));

const userBalance = await xrplService.getAccountBalance(userWallet.address);
console.log("\n📊 User balances:");
console.log("   TST:", userBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   VTS:", userBalance.tokens.find((t) => t.currency === "VTS")?.balance || "0");

const userDeposit = vault.getUserDeposit(userWallet.address);
console.log("   Internal record - deposited:", userDeposit?.totalDeposited, "vTokens:", userDeposit?.vTokensIssued);

console.log("\n💎 Harvesting yields to NGO...");

const ngoTrustline = {
  TransactionType: "TrustSet" as const,
  Account: ngoWallet.address,
  LimitAmount: {
    currency: "TST",
    issuer: vaultWallet.address,
    value: "100000",
  },
};
const ngoTrustlinePrepared = await client.autofill(ngoTrustline);
const ngoTrustlineSigned = ngoWallet.sign(ngoTrustlinePrepared);
await client.submitAndWait(ngoTrustlineSigned.tx_blob);

await vault.harvestYields(ngoWallet.address);

const ngoBalance = await xrplService.getAccountBalance(ngoWallet.address);
console.log("   NGO TST balance:", ngoBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");

console.log("\n📤 User withdraws 25 VTS (capital only)...");
const { burnTx, paymentTx } = await vault.prepareUserWithdrawal(userWallet.address, "25");

const burnSigned = userWallet.sign(burnTx);
await client.submitAndWait(burnSigned.tx_blob);

const paymentSigned = vaultWallet.sign(paymentTx);
await client.submitAndWait(paymentSigned.tx_blob);

await new Promise((resolve) => setTimeout(resolve, 3000));

const finalBalance = await xrplService.getAccountBalance(userWallet.address);
console.log("\n📊 Final user balances:");
console.log("   TST:", finalBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   VTS:", finalBalance.tokens.find((t) => t.currency === "VTS")?.balance || "0");

const finalDeposit = vault.getUserDeposit(userWallet.address);
console.log("   Internal record - deposited:", finalDeposit?.totalDeposited, "vTokens:", finalDeposit?.vTokensIssued);

console.log("\n✅ Full vault flow completed successfully!");

await xrplService.disconnect();
