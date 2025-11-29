import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { RegistryService } from "../services/registry.service";

console.log("🧪 Testing deployed vault retrieval\n");

await xrplService.connect("testnet");

const registryAddress = "rM7RXgYdQzHj8SDthaF8ou4QmeUyGWZBWC";
const vaultAddress = "rpWaA36xsoYXoRULAMkSxqDZNVFUX2Vt5n";

const dummyWallet = Wallet.generate();
const registry = new RegistryService({
  registryAddress,
  registryWallet: dummyWallet,
});

console.log("📋 Listing all vaults...\n");
const vaults = await registry.listVaults();

console.log(`Found ${vaults.length} vault(s):\n`);
vaults.forEach((vault) => {
  console.log(`  Name: ${vault.name}`);
  console.log(`  Address: ${vault.vaultAddress}`);
  console.log(`  Token: ${vault.vaultTokenCurrency}`);
  console.log(`  Strategy: ${vault.strategyType}`);
  console.log();
});

console.log("🔍 Getting specific vault metadata...\n");
const metadata = await registry.getVaultMetadata(vaultAddress);

if (metadata) {
  console.log("✅ Vault found:");
  console.log(`  Name: ${metadata.name}`);
  console.log(`  Description: ${metadata.description}`);
  console.log(`  Token: ${metadata.vaultTokenCurrency}`);
  console.log(`  Accepts: ${metadata.acceptedCurrency}`);
  console.log(`  Strategy: ${metadata.strategyType}`);
} else {
  console.log("❌ Vault not found");
}

await xrplService.disconnect();
