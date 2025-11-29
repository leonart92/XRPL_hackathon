import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

console.log("🧪 Testing AMM Deposit Transaction\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

const wallet = Wallet.generate();
console.log("📍 Wallet:", wallet.address);

console.log("\n💰 Funding wallet...");
await client.fundWallet(wallet);
console.log("✅ Funded\n");

console.log("⚙️  Enabling DefaultRipple...");
const accountSet = {
  TransactionType: "AccountSet" as const,
  Account: wallet.address,
  SetFlag: 8,
};
const accountSetPrepared = await client.autofill(accountSet);
const accountSetSigned = wallet.sign(accountSetPrepared);
await client.submitAndWait(accountSetSigned.tx_blob);
console.log("✅ DefaultRipple enabled\n");

console.log("🏊 Creating AMM pool (XRP/TST)...");
const ammCreate = {
  TransactionType: "AMMCreate" as const,
  Account: wallet.address,
  Amount: "10000000", // 10 XRP
  Amount2: {
    currency: "TST",
    issuer: wallet.address,
    value: "100",
  },
  TradingFee: 500,
};

const ammPrepared = await client.autofill(ammCreate);
const ammSigned = wallet.sign(ammPrepared);
const ammResult = await client.submitAndWait(ammSigned.tx_blob);

console.log("✅ AMM Created:", ammResult.result.hash);

const ammInfo = await client.request({
  command: "amm_info",
  asset: { currency: "XRP" } as any,
  asset2: {
    currency: "TST",
    issuer: wallet.address,
  },
  ledger_index: "validated",
});

console.log("\n📊 AMM Info:");
console.log("   Account:", ammInfo.result.amm.account);
console.log("   XRP amount:", ammInfo.result.amm.amount);
console.log("   TST amount:", ammInfo.result.amm.amount2);
console.log("   LP Token:", ammInfo.result.amm.lp_token);

// Test 1: Two-asset deposit proportional
console.log("\n\n🧪 TEST 1: Two-Asset Deposit (Proportional)");
console.log("   Depositing: 1 XRP + 0.01 TST (same ratio as pool)");

const xrpAmount = typeof ammInfo.result.amm.amount === 'string' ? ammInfo.result.amm.amount : ammInfo.result.amm.amount.value;
const tstAmount = typeof ammInfo.result.amm.amount2 === 'string' ? ammInfo.result.amm.amount2 : ammInfo.result.amm.amount2.value;
const ratio = parseFloat(tstAmount) / parseFloat(xrpAmount);
console.log("   Current pool ratio:", ratio);

try {
  const deposit1 = {
    TransactionType: "AMMDeposit" as const,
    Account: wallet.address,
    Asset: { currency: "XRP" } as any,
    Asset2: {
      currency: "TST",
      issuer: wallet.address,
    },
    Amount: "1000000", // 1 XRP in drops
    Amount2: {
      currency: "TST",
      issuer: wallet.address,
      value: "1", // 1 TST
    },
    Flags: 1048576, // tfTwoAsset
  };

  const prep1 = await client.autofill(deposit1 as any);
  const sign1 = wallet.sign(prep1);
  const result1 = await client.submitAndWait(sign1.tx_blob);
  
  console.log("✅ Success:", result1.result.hash);
  console.log("   Engine result:", (result1.result as any).engine_result);
} catch (error: any) {
  console.log("❌ Failed:", error.message);
}

// Test 2: Single-asset deposit (XRP only)
console.log("\n\n🧪 TEST 2: Single-Asset Deposit (XRP only)");
console.log("   Depositing: 0.5 XRP");

try {
  const deposit2 = {
    TransactionType: "AMMDeposit" as const,
    Account: wallet.address,
    Asset: { currency: "XRP" } as any,
    Asset2: {
      currency: "TST",
      issuer: wallet.address,
    },
    Amount: "500000", // 0.5 XRP
    Flags: 524288, // tfSingleAsset
  };

  const prep2 = await client.autofill(deposit2 as any);
  const sign2 = wallet.sign(prep2);
  const result2 = await client.submitAndWait(sign2.tx_blob);
  
  console.log("✅ Success:", result2.result.hash);
  console.log("   Engine result:", (result2.result as any).engine_result);
} catch (error: any) {
  console.log("❌ Failed:", error.message);
}

// Test 3: Single-asset deposit (TST only)
console.log("\n\n🧪 TEST 3: Single-Asset Deposit (TST only)");
console.log("   Depositing: 5 TST");

try {
  const deposit3 = {
    TransactionType: "AMMDeposit" as const,
    Account: wallet.address,
    Asset: { currency: "XRP" } as any,
    Asset2: {
      currency: "TST",
      issuer: wallet.address,
    },
    Amount: {
      currency: "TST",
      issuer: wallet.address,
      value: "5",
    },
    Flags: 524288, // tfSingleAsset
  };

  const prep3 = await client.autofill(deposit3 as any);
  const sign3 = wallet.sign(prep3);
  const result3 = await client.submitAndWait(sign3.tx_blob);
  
  console.log("✅ Success:", result3.result.hash);
  console.log("   Engine result:", (result3.result as any).engine_result);
} catch (error: any) {
  console.log("❌ Failed:", error.message);
}

// Check final AMM state
const finalAmmInfo = await client.request({
  command: "amm_info",
  asset: { currency: "XRP" },
  asset2: {
    currency: "TST",
    issuer: wallet.address,
  },
  ledger_index: "validated",
});

console.log("\n\n📊 Final AMM State:");
console.log("   XRP:", finalAmmInfo.result.amm.amount);
console.log("   TST:", finalAmmInfo.result.amm.amount2);
console.log("   LP Token:", finalAmmInfo.result.amm.lp_token);

await xrplService.disconnect();
console.log("\n✅ Tests completed!");
