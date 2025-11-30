import { xrplService } from "./services/xrpl.service";
import { Wallet } from "xrpl";

const VAULT_ADDRESS = "rEGwCPXUk9YArsJdD2g6fC4Va1T5aXUemA";
const DEPOSITOR_SEED = process.env.REGISTRY_SEED!;

async function testDeposit() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  const depositor = Wallet.fromSeed(DEPOSITOR_SEED);

  console.log("💰 Sending deposit from:", depositor.address);
  console.log("   To vault:", VAULT_ADDRESS);
  console.log("   Amount: 5 XRP");
  
  const paymentTx = await client.autofill({
    TransactionType: "Payment" as const,
    Account: depositor.address,
    Destination: VAULT_ADDRESS,
    Amount: "5000000",
  });
  
  const signed = depositor.sign(paymentTx);
  const result = await client.submitAndWait(signed.tx_blob);
  
  console.log("✅ Deposit sent!");
  console.log("   TX:", result.result.hash);
  console.log("\n👀 Check vault listener logs to see TOKEN_YIELD deployment...");
  
  process.exit(0);
}

testDeposit().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
