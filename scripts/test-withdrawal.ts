import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

const VAULT_ADDRESS = "rGou2SUFfYtbyyv5Umpk1EYjNDLwkCgqKj";
const USER_ADDRESS = process.env.TEST_USER_ADDRESS!;
const USER_SEED = process.env.TEST_USER_SEED!;

async function testWithdrawal() {
  console.log("🧪 Testing withdrawal flow...");
  
  if (!USER_ADDRESS || !USER_SEED) {
    console.error("❌ Missing TEST_USER_ADDRESS or TEST_USER_SEED in .env file");
    console.log("\nPlease add to .env:");
    console.log("TEST_USER_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    console.log("TEST_USER_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    process.exit(1);
  }

  await xrplService.connect("testnet");
  console.log("✅ Connected to XRPL Testnet");

  const userWallet = Wallet.fromSeed(USER_SEED);
  
  if (userWallet.address !== USER_ADDRESS) {
    console.error(`❌ User seed mismatch!`);
    console.log(`Expected address: ${USER_ADDRESS}`);
    console.log(`Seed generates: ${userWallet.address}`);
    process.exit(1);
  }

  console.log(`✅ User wallet verified: ${USER_ADDRESS}`);

  const client = xrplService.getClient();
  
  console.log("\n📊 Checking user's WWF balance...");
  const accountLines = await client.request({
    command: "account_lines",
    account: USER_ADDRESS,
    ledger_index: "validated",
  });

  const wwfLine = accountLines.result.lines.find(
    (line: any) => line.currency === "WWF" && line.account === VAULT_ADDRESS
  );

  if (!wwfLine) {
    console.log("❌ No WWF balance found. Please deposit first.");
    process.exit(1);
  }

  const wwfBalance = parseFloat(wwfLine.balance);
  console.log(`💰 Current WWF balance: ${wwfBalance}`);

  if (wwfBalance <= 0) {
    console.log("❌ No WWF tokens to withdraw.");
    process.exit(1);
  }

  const withdrawAmount = Math.min(wwfBalance, 5).toString();
  console.log(`\n🔄 Withdrawing ${withdrawAmount} WWF tokens...`);

  const withdrawTx = await client.autofill({
    TransactionType: "Payment" as const,
    Account: USER_ADDRESS,
    Destination: VAULT_ADDRESS,
    Amount: {
      currency: "WWF",
      issuer: VAULT_ADDRESS,
      value: withdrawAmount,
    },
  });

  const signed = userWallet.sign(withdrawTx);
  const result = await client.submitAndWait(signed.tx_blob);

  if ((result.result as any).meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Withdrawal transaction submitted!`);
    console.log(`TX: ${(result.result as any).hash}`);
    console.log(`\n⏳ Now the vault listener should process this and send back XRP...`);
    console.log(`\n💡 Make sure start-vault-listeners.ts is running!`);
  } else {
    console.log(`❌ Failed: ${(result.result as any).meta.TransactionResult}`);
  }

  console.log("\n✨ Done!");
  process.exit(0);
}

testWithdrawal().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
