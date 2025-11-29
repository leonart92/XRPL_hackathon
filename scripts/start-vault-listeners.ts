import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { RegistryService } from "../services/registry.service";
import { VaultService } from "../services/vault.service";
import { AMMStrategy } from "../services/strategies/amm.strategy";
import { tokenYieldStrategy } from "../services/strategies/tokenYield.strategy";

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS!;
const REGISTRY_SEED = process.env.REGISTRY_SEED!;

async function startVaultListeners() {
  console.log("🚀 Starting vault listeners...");

  await xrplService.connect("testnet");
  console.log("✅ Connected to XRPL Testnet");

  const registryWallet = Wallet.fromSeed(REGISTRY_SEED);
  const registry = new RegistryService({
    registryAddress: REGISTRY_ADDRESS,
    registryWallet,
  });

  const vaults = await registry.listVaults();
  console.log(`📦 Found ${vaults.length} vaults in registry`);

  const vaultServices: VaultService[] = [];

  for (const vaultMetadata of vaults) {
    console.log(`\n🔧 Setting up vault: ${vaultMetadata.name}`);
    console.log(`   Address: ${vaultMetadata.vaultAddress}`);
    console.log(`   Strategy: ${vaultMetadata.strategyType}`);

    const vaultSeedKey = `VAULT_${vaultMetadata.vaultTokenCurrency}_SEED`;
    const vaultSeed = process.env[vaultSeedKey];

    if (!vaultSeed) {
      console.log(`   ⚠️  Missing seed for vault: ${vaultSeedKey}`);
      console.log(`   Please add ${vaultSeedKey} to your .env file`);
      continue;
    }

    const vaultWallet = Wallet.fromSeed(vaultSeed);

    if (vaultWallet.address !== vaultMetadata.vaultAddress) {
      console.log(`   ⚠️  Seed mismatch! Expected ${vaultMetadata.vaultAddress}, got ${vaultWallet.address}`);
      continue;
    }

    let strategy;
    if (vaultMetadata.strategyType === "AMM") {
      strategy = new AMMStrategy({
        vaultAddress: vaultMetadata.vaultAddress,
        vaultWallet,
        currency1: vaultMetadata.acceptedCurrency,
        currency2: "XRP",
        issuer1: vaultMetadata.acceptedCurrencyIssuer,
      });
    } else {
      strategy = new TokenYieldStrategy({
        vaultAddress: vaultMetadata.vaultAddress,
        vaultWallet,
        stakingToken: vaultMetadata.acceptedCurrency,
        stakingIssuer: vaultMetadata.acceptedCurrencyIssuer,
        rewardRate: "0.05",
      });
    }

    const vaultService = new VaultService({
      address: vaultMetadata.vaultAddress,
      wallet: vaultWallet,
      vaultTokenCurrency: vaultMetadata.vaultTokenCurrency,
      acceptedCurrency: vaultMetadata.acceptedCurrency,
      acceptedCurrencyIssuer: vaultMetadata.acceptedCurrencyIssuer,
      strategy,
    });

    await vaultService.listenForDeposits();
    vaultServices.push(vaultService);

    console.log(`   ✅ Listening for deposits on ${vaultMetadata.name}`);
  }

  console.log("\n✨ All vault listeners are now active!");
  console.log("💡 Vaults will automatically issue tokens when deposits are received");
  console.log("Press Ctrl+C to stop\n");

  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down vault listeners...");
    vaultServices.forEach((vs) => vs.stopListening());
    process.exit(0);
  });
}

startVaultListeners().catch((error) => {
  console.error("❌ Error starting vault listeners:", error);
  process.exit(1);
});
