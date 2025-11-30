import { Wallet } from "xrpl";
import type { VaultMetadata } from "../services/registry.service";
import { RegistryService } from "../services/registry.service";
import { xrplService } from "../services/xrpl.service";
import { writeFileSync } from "fs";
import { join } from "path";

interface VaultConfig {
  name: string;
  address: string;
  seed: string;
  tokenCurrency: string;
  strategy: string;
  ngoAddress: string;
  createdAt: string;
  ammPoolAddress?: string;
  yieldTokenCurrency?: string;
  yieldTokenIssuer?: string;
}

const vaultsData: Array<{
  vaultName: string;
  vaultDescription: string;
  vaultTokenCurrency: string;
  ngoAddress: string;
  ngoName: string;
}> = [
  {
    vaultName: "WWF Impact Fund",
    vaultDescription: "Conservation de la biodiversité et protection des espèces menacées",
    vaultTokenCurrency: "WWF",
    ngoAddress: "rpDGpVBWg1FZyPUspqc1NWp5LfueEEwBFe",
    ngoName: "World Wildlife Fund",
  },
  {
    vaultName: "Greenpeace Climate Action",
    vaultDescription: "Lutte contre le changement climatique et protection des océans",
    vaultTokenCurrency: "GPE",
    ngoAddress: "rpHSWC6Sqi1ED94Y6322q6tMVUE5mfhGCY",
    ngoName: "Greenpeace",
  },
  {
    vaultName: "MSF Emergency Medical Fund",
    vaultDescription: "Soins médicaux d'urgence dans les zones de crise",
    vaultTokenCurrency: "MSF",
    ngoAddress: "rpDGpVBWg1FZyPUspqc1NWp5LfueEEwBFe",
    ngoName: "Médecins Sans Frontières",
  },
  {
    vaultName: "UNICEF Education for All",
    vaultDescription: "Éducation et protection des enfants dans le monde",
    vaultTokenCurrency: "UNI",
    ngoAddress: "rpHSWC6Sqi1ED94Y6322q6tMVUE5mfhGCY",
    ngoName: "UNICEF",
  },
  {
    vaultName: "Surfrider Ocean Protection",
    vaultDescription: "Protection des océans et lutte contre la pollution plastique",
    vaultTokenCurrency: "SRF",
    ngoAddress: "rpDGpVBWg1FZyPUspqc1NWp5LfueEEwBFe",
    ngoName: "Surfrider Foundation",
  },
];

async function deployDemoVaults() {
  const registryAddress = process.env.VITE_REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS;
  const registrySeed = process.env.VITE_REGISTRY_SEED || process.env.REGISTRY_SEED;

  const ammPoolAddress = process.env.AMM_POOL_ADDRESS;
  const yieldTokenCurrency = process.env.YIELD_TOKEN_CURRENCY || "USD";
  const yieldTokenIssuer = process.env.YIELD_TOKEN_ISSUER;

  if (!registryAddress || !registrySeed) {
    throw new Error("Missing REGISTRY_ADDRESS or REGISTRY_SEED");
  }

  if (!ammPoolAddress || !yieldTokenIssuer) {
    throw new Error("Missing AMM_POOL_ADDRESS or YIELD_TOKEN_ISSUER");
  }

  console.log("🚀 DEPLOYING DEMO VAULTS");
  console.log("=".repeat(60));
  console.log(`Registry: ${registryAddress}`);
  console.log(`AMM Pool: ${ammPoolAddress}`);
  console.log(`Yield Token: ${yieldTokenCurrency} (${yieldTokenIssuer})`);
  console.log("=".repeat(60));

  const registryWallet = Wallet.fromSeed(registrySeed);
  await xrplService.connect("testnet");
  const client = xrplService.getClient();

  const registry = new RegistryService({
    registryAddress,
    registryWallet,
  });

  const deployedVaults: VaultConfig[] = [];

  for (const vaultData of vaultsData) {
    console.log(`\n📦 Deploying: ${vaultData.vaultName}`);
    console.log(`   NGO: ${vaultData.ngoName}`);

    const vaultWallet = Wallet.generate();
    await client.fundWallet(vaultWallet);
    console.log(`   Vault Address: ${vaultWallet.address}`);

    const metadata: Omit<VaultMetadata, "vaultAddress" | "createdAt"> = {
      vaultTokenCurrency: vaultData.vaultTokenCurrency,
      acceptedCurrency: "XRP",
      acceptedCurrencyIssuer: vaultWallet.address,
      strategyType: "AMM",
      ngoAddress: vaultData.ngoAddress,
      name: vaultData.vaultName,
      description: vaultData.vaultDescription,
      ammPoolAddress,
      yieldTokenCurrency,
      yieldTokenIssuer,
    };

    await registry.registerVault(vaultWallet.address, vaultWallet, metadata);
    console.log(`   ✅ Registered in registry`);

    deployedVaults.push({
      name: vaultData.vaultName,
      address: vaultWallet.address,
      seed: vaultWallet.seed!,
      tokenCurrency: vaultData.vaultTokenCurrency,
      strategy: "AMM",
      ngoAddress: vaultData.ngoAddress,
      createdAt: new Date().toISOString(),
      ammPoolAddress,
      yieldTokenCurrency,
      yieldTokenIssuer,
    });
  }

  const vaultsFile = join(process.cwd(), "vaults.json");
  writeFileSync(
    vaultsFile,
    JSON.stringify({ vaults: deployedVaults }, null, 2)
  );
  console.log(`\n✅ Saved ${deployedVaults.length} vaults to vaults.json`);

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("📝 NEXT STEPS:");
  console.log("1. Update Railway environment variables:");
  console.log(`   VITE_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`   VITE_REGISTRY_SEED=${registrySeed}`);
  console.log(`   REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`   REGISTRY_SEED=${registrySeed}`);
  console.log("\n2. Add vault seeds as environment variables:");
  for (const vault of deployedVaults) {
    console.log(`   VAULT_${vault.address}_SEED=${vault.seed}`);
  }
  console.log("=".repeat(60));

  await xrplService.disconnect();
}

deployDemoVaults().catch(console.error);
