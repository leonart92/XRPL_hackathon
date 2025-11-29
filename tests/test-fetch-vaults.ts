import { Wallet } from "xrpl";
import { RegistryService } from "../services/registry.service";
import { xrplService } from "../services/xrpl.service";

console.log("🧪 Testing vault fetching (simulating hook behavior)\n");

await xrplService.connect("testnet");

const registryAddress = "rM7RXgYdQzHj8SDthaF8ou4QmeUyGWZBWC";
const dummyWallet = Wallet.generate();

const registry = new RegistryService({
  registryAddress,
  registryWallet: dummyWallet,
});

console.log("📋 Fetching vaults...");
const vaults = await registry.listVaults();

console.log(`\n✅ Found ${vaults.length} vault(s):\n`);
vaults.forEach((vault, i) => {
  console.log(`Vault ${i + 1}:`);
  console.log(`  Name: ${vault.name}`);
  console.log(`  Address: ${vault.vaultAddress}`);
  console.log(`  Token: ${vault.vaultTokenCurrency}`);
  console.log(`  Strategy: ${vault.strategyType}`);
  console.log(`  Description: ${vault.description}`);
  console.log();
});

await xrplService.disconnect();
