import { xrplService } from "../services/xrpl.service";

const VAULT_ADDRESS = "rGou2SUFfYtbyyv5Umpk1EYjNDLwkCgqKj";

async function checkTransactions() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  
  console.log(`📊 Checking transactions for vault: ${VAULT_ADDRESS}\n`);
  
  const accountTx = await client.request({
    command: "account_tx",
    account: VAULT_ADDRESS,
    limit: 20,
  });

  console.log(`Found ${accountTx.result.transactions.length} transactions:\n`);

  for (const txRecord of accountTx.result.transactions) {
    console.log(JSON.stringify(txRecord, null, 2));
    console.log('\n---\n');
  }
  
  process.exit(0);
}

checkTransactions().catch(console.error);
