import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

const VAULT_ADDRESS = "rGou2SUFfYtbyyv5Umpk1EYjNDLwkCgqKj";

async function processDeposit() {
  console.log("🚀 Processing manual deposit for WWF vault...");
  
  const vaultSeed = process.env.VAULT_WWF_SEED;
  
  if (!vaultSeed) {
    console.error("❌ Missing VAULT_WWF_SEED in .env file");
    console.log("\nPlease add the vault seed to .env:");
    console.log("VAULT_WWF_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    process.exit(1);
  }

  await xrplService.connect("testnet");
  console.log("✅ Connected to XRPL Testnet");

  const vaultWallet = Wallet.fromSeed(vaultSeed);
  
  if (vaultWallet.address !== VAULT_ADDRESS) {
    console.error(`❌ Vault seed mismatch!`);
    console.log(`Expected address: ${VAULT_ADDRESS}`);
    console.log(`Seed generates: ${vaultWallet.address}`);
    process.exit(1);
  }

  console.log(`✅ Vault wallet verified: ${VAULT_ADDRESS}`);

  const client = xrplService.getClient();
  
  console.log("\n📊 Fetching recent transactions...");
  const accountTx = await client.request({
    command: "account_tx",
    account: VAULT_ADDRESS,
    limit: 20,
  });

  console.log(`Found ${accountTx.result.transactions.length} transactions\n`);

  for (const txRecord of accountTx.result.transactions) {
    const tx = (txRecord as any).tx_json;
    
    if (!tx || tx.TransactionType !== "Payment") continue;
    if (tx.Destination !== VAULT_ADDRESS) continue;
    
    const amount = tx.DeliverMax || tx.Amount;
    
    // Handle XRP deposits (amount is a string in drops)
    if (typeof amount === "string") {
      const xrpAmount = (parseInt(amount) / 1_000_000).toString();
      
      console.log("💰 Found XRP deposit:");
      console.log(`   From: ${tx.Account}`);
      console.log(`   Amount: ${xrpAmount} XRP`);
      console.log(`   Hash: ${tx.hash}`);
      
      console.log("\n   🔄 Issuing vault tokens...");
      
      const issueTx = await client.autofill({
        TransactionType: "Payment",
        Account: VAULT_ADDRESS,
        Destination: tx.Account,
        Amount: {
          currency: "WWF",
          issuer: VAULT_ADDRESS,
          value: xrpAmount,
        },
      });

      const signed = vaultWallet.sign(issueTx);
      const result = await client.submitAndWait(signed.tx_blob);
      
      if ((result.result as any).meta.TransactionResult === "tesSUCCESS") {
        console.log(`   ✅ Vault tokens issued!`);
        console.log(`   TX: ${(result.result as any).hash}\n`);
      } else {
        console.log(`   ❌ Failed: ${(result.result as any).meta.TransactionResult}\n`);
      }
      continue;
    }
    
    // Handle issued currency deposits
    console.log("💰 Found deposit:");
    console.log(`   From: ${tx.Account}`);
    console.log(`   Amount: ${amount.value} ${amount.currency}`);
    console.log(`   Hash: ${tx.hash}`);
    
    console.log("\n   🔄 Issuing vault tokens...");
    
    const issueTx = await client.autofill({
      TransactionType: "Payment",
      Account: VAULT_ADDRESS,
      Destination: tx.Account,
      Amount: {
        currency: "WWF",
        issuer: VAULT_ADDRESS,
        value: amount.value,
      },
    });

    const signed = vaultWallet.sign(issueTx);
    const result = await client.submitAndWait(signed.tx_blob);
    
    if ((result.result as any).meta.TransactionResult === "tesSUCCESS") {
      console.log(`   ✅ Vault tokens issued!`);
      console.log(`   TX: ${(result.result as any).hash}\n`);
    } else {
      console.log(`   ❌ Failed: ${(result.result as any).meta.TransactionResult}\n`);
    }
  }

  console.log("✨ Done!");
  process.exit(0);
}

processDeposit().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
