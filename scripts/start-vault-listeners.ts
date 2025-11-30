import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { RegistryService } from "../services/registry.service";
import { VaultService } from "../services/vault.service";
import { AMMStrategy } from "../services/strategies/amm.strategy";
import type { YieldStrategy } from "../services/strategies/yield-strategy.interface";
import { readFileSync, existsSync, watch } from "fs";
import { join } from "path";

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS!;
const REGISTRY_SEED = process.env.REGISTRY_SEED!;
const VAULTS_FILE = join(process.cwd(), "vaults.json");

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

let vaultServices: Map<string, VaultService> = new Map();
let registry: RegistryService;

function loadVaultsFromJSON(): VaultConfig[] {
  if (!existsSync(VAULTS_FILE)) {
    console.log("⚠️  vaults.json not found. No local vaults to load.");
    return [];
  }

  try {
    const fileContent = readFileSync(VAULTS_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    return data.vaults || [];
  } catch (error) {
    console.error("❌ Error reading vaults.json:", error);
    return [];
  }
}

async function setupVault(vaultMetadata: any, vaultsFromJSON: VaultConfig[]) {
  if (vaultServices.has(vaultMetadata.vaultAddress)) {
    console.log(`   ⏭️  Vault already listening: ${vaultMetadata.name}`);
    return;
  }

  console.log(`\n🔧 Setting up vault: ${vaultMetadata.name}`);
  console.log(`   Address: ${vaultMetadata.vaultAddress}`);
  console.log(`   Strategy: ${vaultMetadata.strategyType}`);

  let vaultSeed: string | undefined;

  const vaultFromJSON = vaultsFromJSON.find(v => v.address === vaultMetadata.vaultAddress);
  if (vaultFromJSON) {
    console.log(`   ✅ Found seed in vaults.json`);
    vaultSeed = vaultFromJSON.seed;
  } else {
    const vaultSeedKey = `VAULT_${vaultMetadata.vaultTokenCurrency}_SEED`;
    vaultSeed = process.env[vaultSeedKey];
    
    if (vaultSeed) {
      console.log(`   ✅ Found seed in .env (${vaultSeedKey})`);
    }
  }

  if (!vaultSeed) {
    console.log(`   ⚠️  Missing seed for vault`);
    console.log(`   Add it to vaults.json or set VAULT_${vaultMetadata.vaultTokenCurrency}_SEED in .env`);
    return;
  }

  const vaultWallet = Wallet.fromSeed(vaultSeed);

  if (vaultWallet.address !== vaultMetadata.vaultAddress) {
    console.log(`   ⚠️  Seed mismatch! Expected ${vaultMetadata.vaultAddress}, got ${vaultWallet.address}`);
    return;
  }

  let strategy: YieldStrategy;
  if (vaultMetadata.strategyType === "AMM" && vaultMetadata.ammPoolAddress) {
    console.log(`   🏊 AMM Strategy with pool: ${vaultMetadata.ammPoolAddress}`);
    
    try {
      const client = xrplService.getClient();
      const ammInfo = await client.request({
        command: "amm_info",
        amm_account: vaultMetadata.ammPoolAddress,
        ledger_index: "validated",
      });

      const asset = ammInfo.result.amm.amount;
      const asset2 = ammInfo.result.amm.amount2;

      let formattedAsset: any;
      let formattedAsset2: any;

      if (typeof asset === "string") {
        formattedAsset = "XRP";
      } else {
        formattedAsset = {
          currency: asset.currency,
          issuer: asset.issuer,
        };
      }

      if (typeof asset2 === "string") {
        formattedAsset2 = "XRP";
      } else {
        formattedAsset2 = {
          currency: asset2.currency,
          issuer: asset2.issuer,
        };
      }

      console.log(`   💱 Pool assets: ${typeof asset === 'string' ? 'XRP' : asset.currency} / ${typeof asset2 === 'string' ? 'XRP' : asset2.currency}`);

      strategy = new AMMStrategy({
        vaultAddress: vaultMetadata.vaultAddress,
        vaultWallet,
        ammAccount: vaultMetadata.ammPoolAddress,
        asset: formattedAsset,
        asset2: formattedAsset2,
        baseCurrency: vaultMetadata.acceptedCurrency,
        baseCurrencyIssuer: vaultMetadata.acceptedCurrencyIssuer,
      });
    } catch (error: any) {
      console.log(`   ❌ Failed to get AMM info: ${error.message}`);
      console.log(`   ⚠️  Falling back to holding strategy`);
      strategy = {
        deploy: async (amount: string) => {
          console.log(`   📊 Strategy: Holding ${amount} ${vaultMetadata.acceptedCurrency} in vault (AMM setup failed)`);
        },
        withdraw: async (amount: string) => {
          console.log(`   📊 Strategy: Preparing ${amount} ${vaultMetadata.acceptedCurrency} for withdrawal`);
          return amount;
        },
        getYield: async () => "0",
        getTotalValue: async () => "0",
      };
    }
  } else {
    strategy = {
      deploy: async (amount: string) => {
        console.log(`   📊 Strategy: Holding ${amount} ${vaultMetadata.acceptedCurrency} in vault (no deployment)`);
      },
      withdraw: async (amount: string) => {
        console.log(`   📊 Strategy: Preparing ${amount} ${vaultMetadata.acceptedCurrency} for withdrawal`);
        return amount;
      },
      getYield: async () => "0",
      getTotalValue: async () => "0",
    };
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
  vaultServices.set(vaultMetadata.vaultAddress, vaultService);

  console.log(`   ✅ Listening for deposits on ${vaultMetadata.name}`);
}

async function loadAndSetupVaults() {
  console.log("\n🔄 Checking for new vaults...");
  
  const vaultsFromRegistry = await registry.listVaults();
  console.log(`📦 Found ${vaultsFromRegistry.length} vaults in registry`);

  const vaultsFromJSON = loadVaultsFromJSON();
  console.log(`📄 Found ${vaultsFromJSON.length} vaults in vaults.json`);

  for (const vaultMetadata of vaultsFromRegistry) {
    await setupVault(vaultMetadata, vaultsFromJSON);
  }

  console.log(`\n✨ ${vaultServices.size} vault(s) actively listening`);
}

async function startVaultListeners() {
  console.log("🚀 Starting vault listeners with auto-reload...");

  await xrplService.connect("testnet");
  console.log("✅ Connected to XRPL Testnet");

  const registryWallet = Wallet.fromSeed(REGISTRY_SEED);
  registry = new RegistryService({
    registryAddress: REGISTRY_ADDRESS,
    registryWallet,
  });

  await loadAndSetupVaults();

  console.log("\n👀 Watching vaults.json for changes...");
  
  const watcher = watch(VAULTS_FILE, async (eventType) => {
    if (eventType === 'change') {
      console.log("\n📝 vaults.json changed! Reloading...");
      await loadAndSetupVaults();
    }
  });

  console.log("\n💡 Vaults will automatically issue tokens when deposits are received");
  console.log("💡 New vaults in vaults.json will be auto-detected");
  console.log("Press Ctrl+C to stop\n");

  process.on("SIGINT", () => {
    console.log("\n\n🛑 Shutting down vault listeners...");
    watcher.close();
    vaultServices.forEach((vs) => vs.stopListening());
    process.exit(0);
  });
}

startVaultListeners().catch((error) => {
  console.error("❌ Error starting vault listeners:", error);
  process.exit(1);
});
