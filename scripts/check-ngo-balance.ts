import { xrplService } from "../services/xrpl.service";

const NGO_ADDRESS = "rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak";

async function checkNGOBalance() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();

  console.log("💰 Checking NGO balance...");
  console.log("   Address:", NGO_ADDRESS);

  const accountInfo = await client.request({
    command: "account_info",
    account: NGO_ADDRESS,
    ledger_index: "validated",
  });

  const balance = parseInt(accountInfo.result.account_data.Balance) / 1_000_000;
  console.log("   Balance:", balance, "XRP");
  console.log("   (includes testnet faucet funding + yield received)");
  
  process.exit(0);
}

checkNGOBalance().catch(console.error);
