import { Wallet } from "xrpl";
import { xrplService } from "./services/xrpl.service";

const VAULT_ADDRESS = "rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9";
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
  console.log("   TX:", (result.result as any).hash);
  console.log("\n👀 Check vault listener logs to see AMM deployment...");
  
  process.exit(0);
}

testDeposit().catch(console.error);
