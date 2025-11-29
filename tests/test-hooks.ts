import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

async function testHooks() {
  console.log("\n🧪 Testing React Hooks (Simulated)\n");

  try {
    await xrplService.connect("testnet");
    console.log("✅ Connected to testnet");

    const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS;
    const VAULT_ADDRESS = "rahJsTq3bxW9i3V6DZkGL3LRmeabAfAPfh";
    const VAULT_TOKEN = "VLT";
    const ACCEPTED_CURRENCY = "USD";

    console.log("\n1️⃣ Testing useVaults hook");
    const { RegistryService } = await import("../services/registry.service");
    const dummyWallet = Wallet.generate();
    const registry = new RegistryService({
      registryAddress: REGISTRY_ADDRESS!,
      registryWallet: dummyWallet,
    });
    const vaults = await registry.listVaults();
    console.log(`   ✅ Found ${vaults.length} vaults`);
    vaults.forEach((v) => {
      console.log(`      - ${v.name} (${v.vaultAddress})`);
    });

    console.log("\n2️⃣ Testing useTrustline hook");
    const testUser = Wallet.generate();
    const client = xrplService.getClient();
    const fundResult = await client.fundWallet(testUser);
    console.log(`   ℹ️  Generated test user: ${fundResult.wallet.address}`);

    const trustlineTx = await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: fundResult.wallet.address,
      LimitAmount: {
        currency: VAULT_TOKEN,
        issuer: VAULT_ADDRESS,
        value: "1000000000",
      },
    });
    const signed = fundResult.wallet.sign(trustlineTx);
    const trustlineResult = await client.submitAndWait(signed.tx_blob);
    console.log(`   ✅ Trustline set: ${trustlineResult.result.hash}`);

    console.log("\n3️⃣ Testing useVaultBalance hook");
    const balanceResponse = await client.request({
      command: "account_lines",
      account: fundResult.wallet.address,
      peer: VAULT_ADDRESS,
    });
    const trustline = balanceResponse.result.lines.find(
      (line: any) => line.currency === VAULT_TOKEN
    );
    const balance = trustline ? trustline.balance : "0";
    console.log(`   ✅ Vault token balance: ${balance} ${VAULT_TOKEN}`);

    console.log("\n4️⃣ Testing useDeposit hook (simulation)");
    console.log(
      `   ℹ️  Would deposit to vault: ${VAULT_ADDRESS} with ${ACCEPTED_CURRENCY}`
    );
    console.log(`   ⏭️  Skipped (requires funded test user with ${ACCEPTED_CURRENCY})`);

    console.log("\n5️⃣ Testing useWithdraw hook (simulation)");
    console.log(
      `   ℹ️  Would withdraw from vault: ${VAULT_ADDRESS} using ${VAULT_TOKEN}`
    );
    console.log(`   ⏭️  Skipped (requires user to have vault tokens)`);

    console.log("\n6️⃣ Testing useHarvestYields hook (simulation)");
    console.log(`   ℹ️  Would harvest yields to NGO address`);
    console.log(`   ⏭️  Skipped (requires vault wallet)`);

    console.log("\n✅ All hook tests completed!\n");
    console.log("📋 Summary:");
    console.log("   ✅ useVaults - Fetches vaults from registry");
    console.log("   ✅ useTrustline - Sets up trustline for vault tokens");
    console.log("   ✅ useVaultBalance - Queries user vault token balance");
    console.log("   ⏭️  useDeposit - Deposits currency to vault (requires funded user)");
    console.log("   ⏭️  useWithdraw - Withdraws from vault (requires vault tokens)");
    console.log("   ⏭️  useHarvestYields - Harvests yields (requires vault wallet)");

    await xrplService.disconnect();
  } catch (error) {
    console.error("❌ Test failed:", error);
    await xrplService.disconnect();
    process.exit(1);
  }
}

testHooks();
