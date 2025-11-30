import { Wallet } from "xrpl";
import { xrplService } from "./services/xrpl.service";
import { RegistryService } from "./services/registry.service";

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS!;
const REGISTRY_SEED = process.env.REGISTRY_SEED!;
const VAULT_ADDRESS = "rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9";

async function checkVault() {
  await xrplService.connect("testnet");
  
  const registryWallet = Wallet.fromSeed(REGISTRY_SEED);
  const registry = new RegistryService({
    registryAddress: REGISTRY_ADDRESS,
    registryWallet,
  });

  const vaults = await registry.listVaults();
  const vault = vaults.find(v => v.vaultAddress === VAULT_ADDRESS);
  
  if (vault) {
    console.log("✅ Vault metadata from registry:");
    console.log(JSON.stringify(vault, null, 2));
  } else {
    console.log("❌ Vault not found in registry");
  }
  
  process.exit(0);
}

checkVault().catch(console.error);
