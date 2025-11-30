import { xrplService } from "../services/xrpl.service";
import { RegistryService } from "../services/registry.service";
import { Wallet } from "xrpl";

const VAULT_ADDRESS = "rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9"; // toto vault
const VAULT_SEED = "sEdV4XGLyorp6MwtbfmjejWpdGbfCT1";
const AMM_POOL = "rhWjzUgR1dhTNS5BLc8d1xrdUncEATZXAa";
const REGISTRY_SEED = process.env.REGISTRY_SEED!;
const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS!;

async function harvestYield() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  const vaultWallet = Wallet.fromSeed(VAULT_SEED);

  console.log("🌾 Harvesting vault yield...");
  console.log("   Vault:", VAULT_ADDRESS);
  console.log("   AMM Pool:", AMM_POOL);

  // Get vault metadata from registry
  const registryWallet = Wallet.fromSeed(REGISTRY_SEED);
  const registry = new RegistryService({
    registryAddress: REGISTRY_ADDRESS,
    registryWallet,
  });

  const vaults = await registry.listVaults();
  const vaultMetadata = vaults.find(v => v.vaultAddress === VAULT_ADDRESS);
  
  if (!vaultMetadata) {
    throw new Error("Vault not found in registry");
  }

  console.log("   NGO Address:", vaultMetadata.ngoAddress);

  // Get AMM info
  const ammInfo = await client.request({
    command: "amm_info",
    amm_account: AMM_POOL,
    ledger_index: "validated",
  });

  const lpTokenCurrency = ammInfo.result.amm.lp_token.currency;
  const lpTokenIssuer = ammInfo.result.amm.lp_token.issuer;

  // Get vault's LP token balance
  const accountLines = await client.request({
    command: "account_lines",
    account: VAULT_ADDRESS,
    ledger_index: "validated",
  });

  const lpLine = accountLines.result.lines.find(
    line => line.currency === lpTokenCurrency && line.account === lpTokenIssuer
  );

  if (!lpLine) {
    throw new Error("Vault has no LP tokens");
  }

  const currentLPBalance = parseFloat(lpLine.balance);
  console.log("\n💰 Current LP Token Balance:", currentLPBalance);
  
  console.log("\n📊 Calculating yield...");
  console.log("   Initial deposits: ~20 XRP");
  console.log("   Current LP balance:", currentLPBalance);

  // For accurate calculation, we need to track deposits
  // For now, let's withdraw a small amount and send the yield portion to NGO
  
  // Withdraw 10% of LP tokens to realize some yield
  const yieldWithdrawAmount = (currentLPBalance * 0.05).toFixed(8); // 5% withdrawal for yield distribution

  console.log("\n🔄 Withdrawing yield portion from AMM...");
  console.log("   Withdrawing:", yieldWithdrawAmount, "LP tokens");

  const ammWithdrawTx = await client.autofill({
    TransactionType: "AMMWithdraw" as const,
    Account: VAULT_ADDRESS,
    Asset: { currency: "XRP" },
    Asset2: {
      currency: "USD",
      issuer: (ammInfo.result.amm.amount2 as any).issuer,
    },
    LPTokenIn: {
      currency: lpTokenCurrency,
      issuer: lpTokenIssuer,
      value: yieldWithdrawAmount,
    },
    Flags: 0x00010000, // tfLPToken
  });

  const signed = vaultWallet.sign(ammWithdrawTx);
  const withdrawResult = await client.submitAndWait(signed.tx_blob);
  
  console.log("   ✅ Withdrawal TX:", withdrawResult.result.hash);

  // Check vault balance after withdrawal
  const accountInfo = await client.request({
    command: "account_info",
    account: VAULT_ADDRESS,
    ledger_index: "validated",
  });

  const vaultXRPBalance = parseInt(accountInfo.result.account_data.Balance);
  const withdrawnXRP = (vaultXRPBalance / 1_000_000) - 20; // Minus reserve

  console.log("\n💵 Vault XRP after withdrawal:", vaultXRPBalance / 1_000_000);
  console.log("   Estimated yield:", withdrawnXRP.toFixed(2), "XRP");

  // Send yield to NGO (keep 20 XRP reserve in vault)
  if (withdrawnXRP > 1) {
    const yieldToSend = Math.floor((withdrawnXRP - 0.5) * 1_000_000); // Keep 0.5 XRP buffer

    console.log("\n💝 Sending yield to NGO...");
    console.log("   Amount:", yieldToSend / 1_000_000, "XRP");
    console.log("   To:", vaultMetadata.ngoAddress);

    const paymentTx = await client.autofill({
      TransactionType: "Payment" as const,
      Account: VAULT_ADDRESS,
      Destination: vaultMetadata.ngoAddress,
      Amount: yieldToSend.toString(),
    });

    const signedPayment = vaultWallet.sign(paymentTx);
    const paymentResult = await client.submitAndWait(signedPayment.tx_blob);

    console.log("   ✅ Payment TX:", paymentResult.result.hash);
    console.log("\n🎉 Yield harvested and sent to NGO!");
  } else {
    console.log("\n⚠️  Yield too small to distribute (< 1 XRP)");
  }

  process.exit(0);
}

harvestYield().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
