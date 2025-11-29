import { Wallet } from "xrpl";
import type { VaultMetadata } from "../services/registry.service";
import { RegistryService } from "../services/registry.service";
import { xrplService } from "../services/xrpl.service";

interface DeployConfig {
  vaultName: string;
  vaultDescription: string;
  vaultTokenCurrency: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
  strategyType: "AMM" | "SWAP" | "TOKEN_YIELD";
  ngoAddress: string;
  createAmmPool?: boolean;
  ammPoolAmount?: {
    xrp: string;
    token: string;
  };
}

async function deployVault(config: DeployConfig) {
  console.log(`🚀 Deploying Vault: ${config.vaultName}\n`);

  const network = (process.env.XRPL_NETWORK || "testnet") as
    | "mainnet"
    | "testnet";
  const registryAddress = process.env.REGISTRY_ADDRESS;
  const registrySeed = process.env.REGISTRY_SEED;

  if (!registryAddress || !registrySeed) {
    throw new Error(
      "Missing environment variables: REGISTRY_ADDRESS and REGISTRY_SEED are required",
    );
  }

  console.log(`🌐 Network: ${network}`);
  console.log(`📍 Registry: ${registryAddress}\n`);

  const registryWallet = Wallet.fromSeed(registrySeed);

  await xrplService.connect(network);
  const client = xrplService.getClient();

  console.log("💰 Creating vault wallet...");
  const vaultWallet = Wallet.generate();
  await client.fundWallet(vaultWallet);
  console.log(`✅ Vault address: ${vaultWallet.address}\n`);

  console.log("🔗 Setting up vault trustlines...");
  const trustlineTx = await client.autofill({
    TransactionType: "TrustSet" as const,
    Account: vaultWallet.address,
    LimitAmount: {
      currency: config.acceptedCurrency,
      issuer: config.acceptedCurrencyIssuer,
      value: "1000000000",
    },
  });
  await client.submitAndWait(vaultWallet.sign(trustlineTx).tx_blob);
  console.log("✅ Trustlines created\n");

  if (config.createAmmPool && config.ammPoolAmount) {
    console.log("🏊 Creating AMM pool...");
    const ammCreateTx = await client.autofill({
      TransactionType: "AMMCreate" as const,
      Account: vaultWallet.address,
      Amount: config.ammPoolAmount.xrp,
      Amount2: {
        currency: config.acceptedCurrency,
        issuer: config.acceptedCurrencyIssuer,
        value: config.ammPoolAmount.token,
      },
      TradingFee: 500,
    });
    await client.submitAndWait(vaultWallet.sign(ammCreateTx).tx_blob);
    console.log("✅ AMM pool created\n");
  }

  console.log("📋 Registering vault in registry...");
  const registry = new RegistryService({
    registryAddress,
    registryWallet,
  });

  const metadata: Omit<VaultMetadata, "vaultAddress" | "createdAt"> = {
    vaultTokenCurrency: config.vaultTokenCurrency,
    acceptedCurrency: config.acceptedCurrency,
    acceptedCurrencyIssuer: config.acceptedCurrencyIssuer,
    strategyType: config.strategyType,
    ngoAddress: config.ngoAddress,
    name: config.vaultName,
    description: config.vaultDescription,
  };

  await registry.registerVault(vaultWallet.address, vaultWallet, metadata);
  console.log("✅ Vault registered\n");

  console.log("✅ Vault deployment complete!");
  console.log(`\nVault Address: ${vaultWallet.address}`);
  console.log(`Vault Seed: ${vaultWallet.seed}`);
  console.log(`\n⚠️  SAVE THE SEED SECURELY!`);

  await xrplService.disconnect();

  return {
    address: vaultWallet.address,
    seed: vaultWallet.seed,
    metadata,
  };
}

const exampleConfig: DeployConfig = {
  vaultName: "Green peace impact fund foo",
  vaultDescription: "Provide water to communities in need.",
  vaultTokenCurrency: "WWF",
  acceptedCurrency: "XRP",
  acceptedCurrencyIssuer: process.env.DEFAULT_CURRENCY_ISSUER || "",
  strategyType: "AMM",
  ngoAddress: "rL2U4tNXQGwivPaGFLnwZcEWndR7B4K6E7",
  createAmmPool: false,
};

if (import.meta.main) {
  if (!process.env.REGISTRY_ADDRESS || !process.env.REGISTRY_SEED) {
    console.error("❌ Error: Missing environment variables");
    console.error("Please create a .env file with:");
    console.error("  REGISTRY_ADDRESS=<registry_address>");
    console.error("  REGISTRY_SEED=<registry_seed>");
    console.error("\nSee .env.example for reference");
    process.exit(1);
  }
  await deployVault(exampleConfig);
}

export { deployVault, type DeployConfig };
