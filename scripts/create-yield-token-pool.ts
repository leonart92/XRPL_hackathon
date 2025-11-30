import { xrplService } from "../services/xrpl.service";
import { Wallet } from "xrpl";

const ISSUER_SEED = process.env.REGISTRY_SEED!;
const VAULT_ADDRESS = "rEGwCPXUk9YArsJdD2g6fC4Va1T5aXUemA";

async function createYieldTokenPool() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  const issuer = Wallet.fromSeed(ISSUER_SEED);

  console.log("🏦 Creating yield token (mXRP) and AMM pool...");
  console.log("   Issuer:", issuer.address);
  console.log("   Vault:", VAULT_ADDRESS);

  // Step 1: Setup trustline from vault to mXRP issuer
  console.log("\n1️⃣ Setting up trustline for vault...");
  const vaultWallet = Wallet.fromSeed("sEdTN8GvkPVQtcwX2TpWcZcQRuQzFjZ");
  
  const trustlineTx = await client.autofill({
    TransactionType: "TrustSet" as const,
    Account: VAULT_ADDRESS,
    LimitAmount: {
      currency: "6D58525000000000000000000000000000000000", // mXRP in hex
      issuer: issuer.address,
      value: "1000000000",
    },
    Flags: 0x00020000, // tfClearNoRipple
  });

  const signedTrust = vaultWallet.sign(trustlineTx);
  await client.submitAndWait(signedTrust.tx_blob);
  console.log("   ✅ Trustline created");

  // Step 2: Issue some mXRP to vault for AMM pool creation
  console.log("\n2️⃣ Issuing mXRP tokens to vault...");
  const issueTx = await client.autofill({
    TransactionType: "Payment" as const,
    Account: issuer.address,
    Destination: VAULT_ADDRESS,
    Amount: {
      currency: "6D58525000000000000000000000000000000000",
      issuer: issuer.address,
      value: "10000",
    },
  });

  const signedIssue = issuer.sign(issueTx);
  await client.submitAndWait(signedIssue.tx_blob);
  console.log("   ✅ mXRP tokens issued to vault");

  // Step 3: Create AMM pool XRP/mXRP from vault
  console.log("\n3️⃣ Creating AMM pool XRP/mXRP from vault...");
  const ammCreateTx = await client.autofill({
    TransactionType: "AMMCreate" as const,
    Account: VAULT_ADDRESS,
    Amount: "50000000", // 50 XRP
    Amount2: {
      currency: "6D58525000000000000000000000000000000000",
      issuer: issuer.address,
      value: "5000",
    },
    TradingFee: 500, // 0.5%
  });

  const signedAmm = vaultWallet.sign(ammCreateTx);
  const ammResult = await client.submitAndWait(signedAmm.tx_blob);
  
  // Get AMM account address
  const meta = ammResult.result.meta as any;
  let ammAccount = "";
  
  if (meta?.AffectedNodes) {
    for (const node of meta.AffectedNodes) {
      if (node.CreatedNode?.LedgerEntryType === "AMM") {
        const ammNode = node.CreatedNode.NewFields || node.CreatedNode;
        ammAccount = ammNode.Account || "";
        break;
      }
    }
  }

  console.log("   ✅ AMM pool created");
  console.log("   AMM Account:", ammAccount);

  console.log("\n✅ Setup complete!");
  console.log("\n📋 Configuration for registry:");
  console.log("   yieldTokenCurrency: 6D58525000000000000000000000000000000000");
  console.log("   yieldTokenIssuer:", issuer.address);
  console.log("   AMM Pool:", ammAccount);

  process.exit(0);
}

createYieldTokenPool().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
