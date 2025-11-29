import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { RegistryService } from "../services/registry.service";

console.log("🧪 Testing Registry Service\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

console.log("💰 Creating and funding wallets...");
const registryWallet = Wallet.generate();
const vault1Wallet = Wallet.generate();
const vault2Wallet = Wallet.generate();
const usdIssuer = Wallet.generate();

await Promise.all([
  client.fundWallet(registryWallet),
  client.fundWallet(vault1Wallet),
  client.fundWallet(vault2Wallet),
  client.fundWallet(usdIssuer),
]);

console.log("📍 Registry:", registryWallet.address);
console.log("📍 Vault 1:", vault1Wallet.address);
console.log("📍 Vault 2:", vault2Wallet.address);
console.log("📍 USD Issuer:", usdIssuer.address, "\n");

console.log("⚙️  Enabling DefaultRipple on USD issuer...");
await client.submitAndWait(
  usdIssuer.sign(
    await client.autofill({
      TransactionType: "AccountSet" as const,
      Account: usdIssuer.address,
      SetFlag: 8,
    })
  ).tx_blob
);
console.log("✅ Done\n");

const registry = new RegistryService({
  registryAddress: registryWallet.address,
  registryWallet,
});

console.log("🏦 Registering Vault 1 (AMM Strategy - XRP/USD)...");
await registry.registerVault(vault1Wallet.address, vault1Wallet, {
  vaultTokenCurrency: "VT1",
  acceptedCurrency: "USD",
  acceptedCurrencyIssuer: usdIssuer.address,
  strategyType: "AMM",
  name: "XRP/USD AMM Vault",
  description: "Earn yield by providing liquidity to XRP/USD pool",
});
console.log("✅ Vault 1 registered\n");

console.log("🏦 Registering Vault 2 (AMM Strategy - XRP/USD)...");
await registry.registerVault(vault2Wallet.address, vault2Wallet, {
  vaultTokenCurrency: "VT2",
  acceptedCurrency: "USD",
  acceptedCurrencyIssuer: usdIssuer.address,
  strategyType: "AMM",
  name: "Another XRP/USD Vault",
  description: "Second vault for diversification",
});
console.log("✅ Vault 2 registered\n");

console.log("📋 Listing all vaults from registry...\n");
const vaults = await registry.listVaults();

console.log(`\n✨ Found ${vaults.length} vaults:\n`);
vaults.forEach((vault, i) => {
  console.log(`Vault ${i + 1}:`);
  console.log(`  Address: ${vault.vaultAddress}`);
  console.log(`  Name: ${vault.name}`);
  console.log(`  Token: ${vault.vaultTokenCurrency}`);
  console.log(`  Accepts: ${vault.acceptedCurrency}`);
  console.log(`  Strategy: ${vault.strategyType}`);
  console.log(`  Created: ${new Date(vault.createdAt).toISOString()}`);
  console.log();
});

console.log("🔍 Testing getVaultMetadata for Vault 1...");
const vault1Metadata = await registry.getVaultMetadata(vault1Wallet.address);
if (vault1Metadata) {
  console.log("✅ Retrieved metadata:", vault1Metadata.name);
} else {
  console.log("❌ Failed to retrieve metadata");
}

console.log("\n✅ Registry test complete!");

await xrplService.disconnect();
