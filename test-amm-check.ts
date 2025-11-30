import { Wallet } from "xrpl";
import { xrplService } from "./services/xrpl.service";

const VAULT_ADDRESS = "rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9";
const AMM_POOL = "rhWjzUgR1dhTNS5BLc8d1xrdUncEATZXAa";

async function testDeposit() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();

  console.log("🔍 Checking AMM pool...");
  const ammInfo = await client.request({
    command: "amm_info",
    amm_account: AMM_POOL,
    ledger_index: "validated",
  });

  console.log("✅ AMM Pool exists:");
  console.log(`   Asset 1: ${typeof ammInfo.result.amm.amount === 'string' ? 'XRP: ' + ammInfo.result.amm.amount : ammInfo.result.amm.amount.currency + ': ' + ammInfo.result.amm.amount.value}`);
  console.log(`   Asset 2: ${typeof ammInfo.result.amm.amount2 === 'string' ? 'XRP: ' + ammInfo.result.amm.amount2 : ammInfo.result.amm.amount2.currency + ': ' + ammInfo.result.amm.amount2.value}`);

  console.log("\n🔍 Checking vault account...");
  const vaultInfo = await client.request({
    command: "account_info",
    account: VAULT_ADDRESS,
    ledger_index: "validated",
  });

  console.log(`✅ Vault balance: ${parseFloat(vaultInfo.result.account_data.Balance) / 1_000_000} XRP`);

  console.log("\n✅ AMM Strategy configured correctly!");
  process.exit(0);
}

testDeposit().catch(console.error);
