import { Wallet } from "xrpl";
import { RegistryService } from "./services/registry.service";
import { xrplService } from "./services/xrpl.service";
import type { VaultMetadata } from "./services/registry.service";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

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

const server = Bun.serve({
  port: 3002,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/deploy-vault" && req.method === "POST") {
      try {
        const body = await req.json();

        const registryAddress = process.env.VITE_REGISTRY_ADDRESS;
        const registrySeed = process.env.VITE_REGISTRY_SEED || process.env.REGISTRY_SEED;

        if (!registryAddress || !registrySeed) {
          return new Response(
            JSON.stringify({ error: "Missing registry configuration" }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }

        const registryWallet = Wallet.fromSeed(registrySeed);
        await xrplService.connect("testnet");
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

        await registry.registerVault(vaultWallet.address, vaultWallet, metadata);
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

        await xrplService.disconnect();

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
          }
        );
      } catch (error: any) {
        console.error("Deployment error:", error);
        await xrplService.disconnect();
        return new Response(
          JSON.stringify({ error: error.message || "Deployment failed" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`🚀 API Server running on http://localhost:${server.port}`);
