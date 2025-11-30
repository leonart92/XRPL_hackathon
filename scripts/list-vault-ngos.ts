import { RegistryService } from "../services/registry.service";
import { xrplService } from "../services/xrpl.service";
import { Wallet } from "xrpl";

const REGISTRY_SEED = process.env.REGISTRY_SEED!;
const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS!;

async function listVaultNGOs() {
  await xrplService.connect("testnet");
  
  const registryWallet = Wallet.fromSeed(REGISTRY_SEED);
  const registry = new RegistryService({
    registryAddress: REGISTRY_ADDRESS,
    registryWallet,
  });

  const vaults = await registry.listVaults();
  
  console.log("\n📊 Vault NGO Addresses:");
  console.log("=" .repeat(80));
  
  for (const vault of vaults) {
    const ngoAddress = vault.ngoAddress || "MISSING";
    const ngoValid = ngoAddress.startsWith("r") && ngoAddress.length >= 25 && ngoAddress.length <= 35;
    const status = ngoValid ? "✅" : "❌";
    console.log(`${status} ${vault.name || vault.vaultAddress}`);
    console.log(`   Vault: ${vault.vaultAddress}`);
    console.log(`   NGO: ${ngoAddress}`);
    console.log();
  }
  
  process.exit(0);
}

listVaultNGOs().catch(console.error);
