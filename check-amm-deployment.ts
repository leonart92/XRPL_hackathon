import { xrplService } from "./services/xrpl.service";

const VAULT_ADDRESS = "rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9";
const AMM_POOL = "rhWjzUgR1dhTNS5BLc8d1xrdUncEATZXAa";

async function checkDeployment() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  
  console.log("🔍 Checking vault's AMM position...\n");
  
  const ammInfo = await client.request({
    command: "amm_info",
    amm_account: AMM_POOL,
    ledger_index: "validated",
  });
  
  console.log("📊 AMM Pool Info:");
  console.log("   LPToken Currency:", ammInfo.result.amm.lp_token.currency);
  console.log("   LPToken Issuer:", ammInfo.result.amm.account);
  
  const accountLines = await client.request({
    command: "account_lines",
    account: VAULT_ADDRESS,
    ledger_index: "validated",
  });
  
  console.log("\n💼 Vault's Trust Lines:");
  accountLines.result.lines.forEach((line: any) => {
    console.log(`   ${line.currency}: ${line.balance} (from ${line.account.substring(0, 8)}...)`);
  });
  
  const lpLine = accountLines.result.lines.find(
    (line: any) =>
      line.account === ammInfo.result.amm.account &&
      line.currency === ammInfo.result.amm.lp_token.currency
  );
  
  if (lpLine) {
    console.log("\n✅ VAULT HAS LP TOKENS!");
    console.log(`   Amount: ${lpLine.balance}`);
    console.log("   🎉 AMM Strategy deployed successfully!");
  } else {
    console.log("\n❌ No LP tokens found");
    console.log("   Strategy might not have deployed");
  }
  
  process.exit(0);
}

checkDeployment().catch(console.error);
