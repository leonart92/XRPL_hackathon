import { Client } from "xrpl";

async function findAMMPools() {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL Testnet");

  console.log("\n🔍 Searching for AMM pools...");
  
  const knownAMMAddresses = [
    "rE54zDvgnghAoPopCgvtiqWNq3dU5y836S",
    "rH438WV9GDAXYeKFqzbsvZYMnmZ4K1n9j6",
  ];

  for (const ammAddr of knownAMMAddresses) {
    try {
      const accountInfo = await client.request({
        command: "account_info",
        account: ammAddr,
        ledger_index: "validated"
      });
      
      if (accountInfo.result.account_data) {
        console.log(`\n✅ Found AMM Account: ${ammAddr}`);
        console.log(`   Balance: ${accountInfo.result.account_data.Balance} drops`);
      }
    } catch (e: any) {
      console.log(`   ❌ ${ammAddr} not found or not an AMM`);
    }
  }

  await client.disconnect();
}

findAMMPools().catch(console.error);
