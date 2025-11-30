import { Client, Wallet } from "xrpl";

async function createDemoAMM() {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL Testnet");

  console.log("💰 Funding wallet...");
  const fundResult = await client.fundWallet();
  const wallet = fundResult.wallet;
  
  console.log(`✅ Wallet: ${wallet.address}`);
  console.log(`   Seed: ${wallet.seed}`);

  console.log("\n🔧 Setting DefaultRipple flag...");
  const accountSet = await client.autofill({
    TransactionType: "AccountSet",
    Account: wallet.address,
    SetFlag: 8,
  });
  const signedSet = wallet.sign(accountSet);
  await client.submitAndWait(signedSet.tx_blob);
  console.log("✅ DefaultRipple enabled");

  console.log("\n🏦 Creating AMM pool (XRP/USD)...");
  const ammCreate = await client.autofill({
    TransactionType: "AMMCreate",
    Account: wallet.address,
    Amount: "10000000",
    Amount2: {
      currency: "USD",
      issuer: wallet.address,
      value: "100"
    },
    TradingFee: 500,
  });

  const signedAmm = wallet.sign(ammCreate);
  const result = await client.submitAndWait(signedAmm.tx_blob);

  if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
    console.log(`✅ AMM Created! Result: ${result.result.meta.TransactionResult}`);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  const ammInfo = await client.request({
    command: "amm_info",
    asset: { currency: "XRP" },
    asset2: {
      currency: "USD",
      issuer: wallet.address,
    },
  });

  console.log("\n🎉 AMM POOL CRÉÉ AVEC SUCCÈS!");
  console.log("\n📝 INFORMATIONS POUR TON ADMIN:");
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`AMM Pool Address: ${ammInfo.result.amm.account}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\nWallet Owner: ${wallet.address}`);
  console.log(`Seed: ${wallet.seed}`);
  console.log(`\nAsset 1: XRP`);
  console.log(`Asset 2: USD (${wallet.address})`);
  console.log(`LP Token: ${ammInfo.result.amm.lp_token.currency}`);

  await client.disconnect();
}

createDemoAMM().catch(console.error);
