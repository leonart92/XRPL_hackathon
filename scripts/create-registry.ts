import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

console.log("🏗️  Creating Registry Wallet\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

console.log("💰 Generating and funding registry wallet...");
const registryWallet = Wallet.generate();
await client.fundWallet(registryWallet);

console.log("\n✅ Registry wallet created successfully!\n");
console.log("=".repeat(60));
console.log("📍 Registry Address:", registryWallet.address);
console.log("🔑 Registry Seed:", registryWallet.seed);
console.log("=".repeat(60));

console.log("\n⚠️  IMPORTANT: Add these to your .env file:");
console.log(`REGISTRY_ADDRESS=${registryWallet.address}`);
console.log(`REGISTRY_SEED=${registryWallet.seed}`);

await xrplService.disconnect();
