import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { RegistryService } from "../services/registry.service";

console.log("🧪 Testing Vaults Retrieval from .env Registry\n");

const registryAddress = process.env.REGISTRY_ADDRESS;

if (!registryAddress) {
  console.error("❌ Error: REGISTRY_ADDRESS not found in .env");
  process.exit(1);
}

await xrplService.connect("testnet");

const dummyWallet = Wallet.generate();
const registry = new RegistryService({
  registryAddress,
  registryWallet: dummyWallet,
});

console.log(`📍 Registry: ${registryAddress}`);
console.log("📋 Fetching all vaults...\n");

const vaults = await registry.listVaults();

console.log(`✅ Found ${vaults.length} vault(s):\n`);

if (vaults.length === 0) {
  console.log("  No vaults registered yet.");
  console.log("  Run 'bun deploy-vault.ts' to deploy a vault.\n");
} else {
  vaults.forEach((vault, i) => {
    console.log(`Vault ${i + 1}:`);
    console.log(`  📛 Name: ${vault.name}`);
    console.log(`  📍 Address: ${vault.vaultAddress}`);
    console.log(`  🪙 Token: ${vault.vaultTokenCurrency}`);
    console.log(`  💰 Accepts: ${vault.acceptedCurrency}`);
    console.log(`  ⚡ Strategy: ${vault.strategyType}`);
    console.log(`  📝 Description: ${vault.description}`);
    console.log(`  🕐 Created: ${new Date(vault.createdAt).toLocaleString()}`);
    console.log();
  });
}

await xrplService.disconnect();

console.log("✨ This is exactly what the useVaults() hook does!");
