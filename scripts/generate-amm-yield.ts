import { xrplService } from "../services/xrpl.service";
import { Wallet } from "xrpl";

const AMM_POOL = "rhWjzUgR1dhTNS5BLc8d1xrdUncEATZXAa";
const TRADER_SEED = process.env.REGISTRY_SEED!;

async function generateYield() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  const trader = Wallet.fromSeed(TRADER_SEED);

  console.log("💰 Generating AMM yield by executing swaps...");
  console.log("   Trader:", trader.address);
  console.log("   AMM Pool:", AMM_POOL);

  const ammInfo = await client.request({
    command: "amm_info",
    amm_account: AMM_POOL,
    ledger_index: "validated",
  });

  const usdIssuer = (ammInfo.result.amm.amount2 as any).issuer;
  
  console.log("\n📈 Pool before swaps:");
  console.log("   XRP:", ammInfo.result.amm.amount);
  console.log("   USD:", (ammInfo.result.amm.amount2 as any).value);

  // Setup trustline for USD first
  console.log("\n1️⃣ Setting up USD trustline...");
  try {
    const trustTx = await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: trader.address,
      LimitAmount: {
        currency: "USD",
        issuer: usdIssuer,
        value: "100000",
      },
    });
    const signedTrust = trader.sign(trustTx);
    await client.submitAndWait(signedTrust.tx_blob);
    console.log("   ✅ Trustline created");
  } catch (error: any) {
    if (error.message.includes("tefCREATED")) {
      console.log("   ✅ Trustline already exists");
    } else {
      throw error;
    }
  }

  // Execute multiple swaps to generate fees
  const numSwaps = 5;
  console.log(`\n2️⃣ Executing ${numSwaps} swaps to generate fees...`);

  for (let i = 1; i <= numSwaps; i++) {
    console.log(`\n   Swap ${i}/${numSwaps}: XRP → USD`);
    
    // Swap XRP for USD
    const swapTx = await client.autofill({
      TransactionType: "Payment" as const,
      Account: trader.address,
      Destination: trader.address,
      Amount: {
        currency: "USD",
        issuer: usdIssuer,
        value: "5", // Request 5 USD
      },
      SendMax: "10000000", // Max 10 XRP
      Flags: 0x00020000, // tfPartialPayment
    });

    const signed = trader.sign(swapTx);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log(`   ✅ Swap completed: ${result.result.hash}`);

    // Wait a bit between swaps
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Check pool after swaps
  const ammInfoAfter = await client.request({
    command: "amm_info",
    amm_account: AMM_POOL,
    ledger_index: "validated",
  });

  console.log("\n📈 Pool after swaps:");
  console.log("   XRP:", ammInfoAfter.result.amm.amount);
  console.log("   USD:", (ammInfoAfter.result.amm.amount2 as any).value);
  
  console.log("\n✅ Yield generation complete!");
  console.log("💡 The vault's LP tokens now represent a larger share of the pool");
  console.log("💡 Next: Run harvest script to calculate and distribute yield to NGO");

  process.exit(0);
}

generateYield().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
