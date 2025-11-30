import { xrplService } from "../services/xrpl.service";
import { Wallet } from "xrpl";

async function createNGOWallet() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();

  console.log("🏦 Creating NGO wallet for Zero Waste Circular Economy...");
  
  const ngoWallet = Wallet.generate();
  console.log("   Address:", ngoWallet.address);
  console.log("   Seed:", ngoWallet.seed);

  console.log("\n💰 Funding wallet from testnet faucet...");
  await client.fundWallet(ngoWallet);
  
  console.log("✅ NGO wallet created and funded!");
  console.log("\n📝 Add to .env:");
  console.log(`NGO_ZERO_WASTE_ADDRESS=${ngoWallet.address}`);
  console.log(`NGO_ZERO_WASTE_SEED=${ngoWallet.seed}`);
  
  process.exit(0);
}

createNGOWallet().catch(console.error);
