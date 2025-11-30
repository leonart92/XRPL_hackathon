import { existsSync, readFileSync, writeFileSync, watch } from "fs";
import { join } from "path";
import { Wallet } from "xrpl";
import type { VaultMetadata } from "./services/registry.service";
import { RegistryService } from "./services/registry.service";
import { xrplService } from "./services/xrpl.service";
import { VaultService } from "./services/vault.service";
import { AMMStrategy } from "./services/strategies/amm.strategy";
import type { YieldStrategy } from "./services/strategies/yield-strategy.interface";

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

function loadVaults(): VaultConfig[] {
  if (!existsSync(VAULTS_FILE)) {
    return [];
  }
  try {
    const data = JSON.parse(readFileSync(VAULTS_FILE, "utf-8"));
    return data.vaults || [];
  } catch {
    return [];
  }
}

function saveVault(vault: VaultConfig) {
  const vaults = loadVaults();
  vaults.push(vault);
  writeFileSync(VAULTS_FILE, JSON.stringify({ vaults }, null, 2));
  console.log(`✅ Saved vault to ${VAULTS_FILE}`);
}

const PORT = process.env.PORT || 3000;
const DIST_DIR = join(process.cwd(), "dist");

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/deploy-vault" && req.method === "POST") {
      try {
        const body = await req.json();

        const registryAddress = process.env.VITE_REGISTRY_ADDRESS;
        const registrySeed =
          process.env.VITE_REGISTRY_SEED || process.env.REGISTRY_SEED;

        if (!registryAddress || !registrySeed) {
          return new Response(
            JSON.stringify({ error: "Missing registry configuration" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        const registryWallet = Wallet.fromSeed(registrySeed);
        
        if (!xrplService.isConnected()) {
          await xrplService.connect("testnet");
        }
        
        const client = xrplService.getClient();

        console.log("💰 Creating vault wallet...");
        const vaultWallet = Wallet.generate();
        await client.fundWallet(vaultWallet);
        console.log(`✅ Vault address: ${vaultWallet.address}`);

        console.log("📋 Registering vault in registry...");
        const registry = new RegistryService({
          registryAddress,
          registryWallet,
        });

        const metadata: Omit<VaultMetadata, "vaultAddress" | "createdAt"> = {
          vaultTokenCurrency: body.vaultTokenCurrency,
          acceptedCurrency: "XRP",
          acceptedCurrencyIssuer: vaultWallet.address,
          strategyType: body.strategyType,
          ngoAddress: body.ngoAddress,
          name: body.vaultName,
          description: body.vaultDescription,
          ammPoolAddress: body.ammPoolAddress,
          yieldTokenCurrency: body.yieldTokenCurrency,
          yieldTokenIssuer: body.yieldTokenIssuer,
        };

        await registry.registerVault(
          vaultWallet.address,
          vaultWallet,
          metadata,
        );
        console.log("✅ Vault registered");

        const vaultConfig: VaultConfig = {
          name: body.vaultName,
          address: vaultWallet.address,
          seed: vaultWallet.seed!,
          tokenCurrency: body.vaultTokenCurrency,
          strategy: body.strategyType,
          ngoAddress: body.ngoAddress,
          createdAt: new Date().toISOString(),
          ammPoolAddress: body.ammPoolAddress,
          yieldTokenCurrency: body.yieldTokenCurrency,
          yieldTokenIssuer: body.yieldTokenIssuer,
        };

        saveVault(vaultConfig);

        const fullMetadata: VaultMetadata = {
          vaultAddress: vaultWallet.address,
          vaultTokenCurrency: body.vaultTokenCurrency,
          acceptedCurrency: "XRP",
          acceptedCurrencyIssuer: vaultWallet.address,
          strategyType: body.strategyType,
          ngoAddress: body.ngoAddress,
          name: body.vaultName,
          description: body.vaultDescription,
          createdAt: Date.now(),
          ammPoolAddress: body.ammPoolAddress,
          yieldTokenCurrency: body.yieldTokenCurrency,
          yieldTokenIssuer: body.yieldTokenIssuer,
        };

        console.log("🎧 Setting up listener for new vault...");
        try {
          await setupVaultListener(fullMetadata, vaultConfig);
          console.log("✅ Listener active for new vault");
        } catch (listenerError: any) {
          console.error("⚠️  Failed to setup listener:", listenerError.message);
        }

        return new Response(
          JSON.stringify({
            address: vaultWallet.address,
            seed: vaultWallet.seed,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      } catch (error: any) {
        console.error("Deployment error:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Deployment failed" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }
    }

    if (url.pathname === "/api/harvest-yield" && req.method === "POST") {
      try {
        const body = await req.json();
        const { vaultAddress, vaultSeed } = body;

        if (!vaultAddress || !vaultSeed) {
          return new Response(
            JSON.stringify({ error: "Missing vaultAddress or vaultSeed" }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        const registryAddress =
          process.env.VITE_REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS;
        const registrySeed =
          process.env.VITE_REGISTRY_SEED || process.env.REGISTRY_SEED;

        if (!registryAddress || !registrySeed) {
          return new Response(
            JSON.stringify({ error: "Missing registry configuration" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        if (!xrplService.isConnected()) {
          await xrplService.connect("testnet");
        }
        const client = xrplService.getClient();
        const vaultWallet = Wallet.fromSeed(vaultSeed);

        console.log("🌾 Harvesting vault yield...");
        console.log("   Vault:", vaultAddress);

        const registryWallet = Wallet.fromSeed(registrySeed);
        const registry = new RegistryService({
          registryAddress,
          registryWallet,
        });

        const vaults = await registry.listVaults();
        const vaultMetadata = vaults.find(
          (v) => v.vaultAddress === vaultAddress,
        );

        if (!vaultMetadata) {
          throw new Error("Vault not found in registry");
        }

        if (!vaultMetadata.ammPoolAddress) {
          throw new Error("Vault has no AMM pool configured");
        }

        console.log("   NGO Address:", vaultMetadata.ngoAddress);

        const ammInfo = await client.request({
          command: "amm_info",
          amm_account: vaultMetadata.ammPoolAddress,
          ledger_index: "validated",
        });

        const lpTokenCurrency = ammInfo.result.amm.lp_token.currency;
        const lpTokenIssuer = ammInfo.result.amm.lp_token.issuer;

        const accountLines = await client.request({
          command: "account_lines",
          account: vaultAddress,
          ledger_index: "validated",
        });

        const lpLine = accountLines.result.lines.find(
          (line) =>
            line.currency === lpTokenCurrency && line.account === lpTokenIssuer,
        );

        if (!lpLine) {
          throw new Error("Vault has no LP tokens");
        }

        const currentLPBalance = parseFloat(lpLine.balance);
        console.log("💰 Current LP Token Balance:", currentLPBalance);

        const yieldWithdrawAmount = (currentLPBalance * 0.05).toFixed(8);

        console.log("🔄 Withdrawing yield portion from AMM...");
        console.log("   Withdrawing:", yieldWithdrawAmount, "LP tokens");

        const ammWithdrawTx = await client.autofill(
          {
            TransactionType: "AMMWithdraw" as const,
            Account: vaultAddress,
            Asset: { currency: "XRP" },
            Asset2: {
              currency: (ammInfo.result.amm.amount2 as any).currency,
              issuer: (ammInfo.result.amm.amount2 as any).issuer,
            },
            LPTokenIn: {
              currency: lpTokenCurrency,
              issuer: lpTokenIssuer,
              value: yieldWithdrawAmount,
            },
            Flags: 0x00010000,
          },
          20,
        );

        const signed = vaultWallet.sign(ammWithdrawTx);
        const withdrawResult = await client.submitAndWait(signed.tx_blob);
        const withdrawTxHash = withdrawResult.result.hash;

        console.log("   ✅ Withdrawal TX:", withdrawTxHash);

        const accountInfo = await client.request({
          command: "account_info",
          account: vaultAddress,
          ledger_index: "validated",
        });

        const vaultXRPBalance = parseInt(
          accountInfo.result.account_data.Balance,
        );
        const withdrawnXRP = vaultXRPBalance / 1_000_000 - 20;

        console.log(
          "💵 Vault XRP after withdrawal:",
          vaultXRPBalance / 1_000_000,
        );
        console.log("   Estimated yield:", withdrawnXRP.toFixed(2), "XRP");

        let paymentTxHash = null;
        let amountSent = 0;

        if (withdrawnXRP > 1) {
          const yieldToSend = Math.floor((withdrawnXRP - 0.5) * 1_000_000);
          amountSent = yieldToSend / 1_000_000;

          console.log("💝 Sending yield to NGO...");
          console.log("   Amount:", amountSent, "XRP");
          console.log("   To:", vaultMetadata.ngoAddress);

          const paymentTx = await client.autofill(
            {
              TransactionType: "Payment" as const,
              Account: vaultAddress,
              Destination: vaultMetadata.ngoAddress,
              Amount: yieldToSend.toString(),
            },
            20,
          );

          const signedPayment = vaultWallet.sign(paymentTx);
          const paymentResult = await client.submitAndWait(
            signedPayment.tx_blob,
          );
          paymentTxHash = paymentResult.result.hash;

          console.log("   ✅ Payment TX:", paymentTxHash);
          console.log("🎉 Yield harvested and sent to NGO!");
        }

        return new Response(
          JSON.stringify({
            success: true,
            lpTokensWithdrawn: yieldWithdrawAmount,
            xrpAmount: amountSent,
            ngoAddress: vaultMetadata.ngoAddress,
            withdrawTxHash,
            paymentTxHash,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      } catch (error: any) {
        console.error("Harvest error:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Harvest failed" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }
    }

    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(join(DIST_DIR, filePath));

    if (await file.exists()) {
      return new Response(file);
    }

    const indexFile = Bun.file(join(DIST_DIR, "index.html"));
    return new Response(indexFile);
  },
});

console.log(`🚀 Server running on http://localhost:${server.port}`);
console.log(`   - Frontend: Serving from ${DIST_DIR}`);
console.log(`   - API: /api/deploy-vault, /api/harvest-yield`);

const vaultServices: Map<string, VaultService> = new Map();

async function setupVaultListener(vaultMetadata: any, vaultConfig: VaultConfig) {
  if (vaultServices.has(vaultMetadata.vaultAddress)) {
    return;
  }

  console.log(`🔧 Setting up listener: ${vaultMetadata.name} (${vaultMetadata.vaultAddress})`);

  const vaultWallet = Wallet.fromSeed(vaultConfig.seed);

  if (vaultWallet.address !== vaultMetadata.vaultAddress) {
    console.log(`   ⚠️  Seed mismatch for ${vaultMetadata.name}`);
    return;
  }

  let strategy: YieldStrategy;

  if (vaultMetadata.strategyType === "AMM" && vaultMetadata.ammPoolAddress) {
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
      console.log(`   ⚠️  AMM setup failed, using holding strategy`);
      strategy = {
        deploy: async (amount: string) => {
          console.log(`   📊 Holding ${amount} ${vaultMetadata.acceptedCurrency}`);
        },
        withdraw: async (amount: string) => amount,
        getYield: async () => "0",
        getTotalValue: async () => "0",
      };
    }
  } else {
    strategy = {
      deploy: async (amount: string) => {
        console.log(`   📊 Holding ${amount} ${vaultMetadata.acceptedCurrency}`);
      },
      withdraw: async (amount: string) => amount,
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

async function startVaultListeners() {
  const registryAddress = process.env.VITE_REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS;
  const registrySeed = process.env.VITE_REGISTRY_SEED || process.env.REGISTRY_SEED;

  if (!registryAddress || !registrySeed) {
    console.log("⚠️  No registry config - vault listeners disabled");
    return;
  }

  try {
    console.log("\n🎧 Starting vault listeners...");
    await xrplService.connect("testnet");
    
    const registryWallet = Wallet.fromSeed(registrySeed);
    const registry = new RegistryService({
      registryAddress,
      registryWallet,
    });

    const vaultsFromRegistry = await registry.listVaults();
    const vaultsFromFile = loadVaults();

    console.log(`📦 Found ${vaultsFromRegistry.length} vaults in registry`);
    console.log(`📄 Found ${vaultsFromFile.length} vaults in vaults.json`);

    for (const vaultMetadata of vaultsFromRegistry) {
      let vaultConfig = vaultsFromFile.find(v => v.address === vaultMetadata.vaultAddress);
      
      if (!vaultConfig) {
        const envVarName = `VAULT_${vaultMetadata.vaultAddress}_SEED`;
        const seedFromEnv = process.env[envVarName];
        
        if (seedFromEnv) {
          console.log(`✅ Using seed from env var: ${envVarName}`);
          vaultConfig = {
            name: vaultMetadata.name || "Unknown",
            address: vaultMetadata.vaultAddress,
            seed: seedFromEnv,
            tokenCurrency: vaultMetadata.vaultTokenCurrency,
            strategy: vaultMetadata.strategyType,
            ngoAddress: vaultMetadata.ngoAddress,
            createdAt: new Date(vaultMetadata.createdAt).toISOString(),
            ammPoolAddress: vaultMetadata.ammPoolAddress,
            yieldTokenCurrency: vaultMetadata.yieldTokenCurrency,
            yieldTokenIssuer: vaultMetadata.yieldTokenIssuer,
          };
        }
      }
      
      if (vaultConfig) {
        await setupVaultListener(vaultMetadata, vaultConfig);
      } else {
        console.log(`⚠️  No seed found for vault ${vaultMetadata.name} (${vaultMetadata.vaultAddress})`);
        console.log(`   💡 Add VAULT_${vaultMetadata.vaultAddress}_SEED to env vars`);
      }
    }

    if (existsSync(VAULTS_FILE)) {
      watch(VAULTS_FILE, async (eventType) => {
        if (eventType === 'change') {
          console.log("\n📝 vaults.json changed, reloading...");
          const newVaults = await registry.listVaults();
          const newVaultsConfig = loadVaults();
          
          for (const vaultMetadata of newVaults) {
            const vaultConfig = newVaultsConfig.find(v => v.address === vaultMetadata.vaultAddress);
            if (vaultConfig) {
              await setupVaultListener(vaultMetadata, vaultConfig);
            }
          }
        }
      });
    }

    console.log(`✨ ${vaultServices.size} vault(s) listening for deposits\n`);
  } catch (error: any) {
    console.error("❌ Failed to start vault listeners:", error.message);
  }
}

startVaultListeners();
