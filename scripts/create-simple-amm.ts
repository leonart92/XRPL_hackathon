import { Client, Wallet } from "xrpl";

async function createSimpleAMM() {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL Testnet");

  console.log("💰 Funding wallet...");
  const fundResult = await client.fundWallet();
  const wallet = fundResult.wallet;
  
  console.log(`✅ Wallet: ${wallet.address}`);
  console.log(`   Seed: ${wallet.seed}`);
  console.log(`   Balance: ${fundResult.balance} XRP`);

  console.log("\n🏦 Creating simple XRP/USD AMM pool...");
  
  try {
    const ammTx = {
      TransactionType: "AMMCreate",
      Account: wallet.address,
      Amount: "5000000",
      Amount2: {
        currency: "USD",
        issuer: wallet.address,
        value: "50"
      },
      TradingFee: 1000,
    };

    console.log("   Preparing transaction...");
    const prepared = await client.autofill(ammTx);
    const signed = wallet.sign(prepared);
    
    console.log("   Submitting...");
    const result = await client.submit(signed.tx_blob);
    
    console.log(`   Result: ${result.result.engine_result}`);
    
    if (result.result.engine_result === "tesSUCCESS") {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const ammInfo = await client.request({
        command: "amm_info",
        asset: { currency: "XRP" },
        asset2: {
          currency: "USD",
          issuer: wallet.address,
        },
      });

      console.log("\n✅ AMM Pool créé avec succès!");
      console.log(`\n📝 COPIE CETTE ADRESSE POUR TON ADMIN:`);
      console.log(`   ${ammInfo.result.amm.account}`);
    }
  } catch (e: any) {
    console.error("❌ Error:", e.message);
  }

  await client.disconnect();
}

createSimpleAMM().catch(console.error);
