import { Client, Wallet } from "xrpl";

async function createAMMPool() {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL Testnet");

  console.log("💰 Creating and funding wallet...");
  const wallet = await client.fundWallet();
  console.log(`✅ Wallet created: ${wallet.wallet.address}`);
  console.log(`   Seed: ${wallet.wallet.seed}`);

  console.log("\n🏦 Creating AMM Pool (XRP/XRP)...");
  const ammCreate = await client.autofill({
    TransactionType: "AMMCreate",
    Account: wallet.wallet.address,
    Amount: "10000000",
    Amount2: {
      currency: "USD",
      issuer: wallet.wallet.address,
      value: "100"
    },
    TradingFee: 500,
  });

  const signed = wallet.wallet.sign(ammCreate);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("✅ AMM Pool Created!");
  console.log(`   Transaction: ${result.result.hash}`);

  const accountInfo = await client.request({
    command: "account_info",
    account: wallet.wallet.address,
    ledger_index: "validated"
  });

  const ammInfo = await client.request({
    command: "amm_info",
    asset: { currency: "XRP" },
    asset2: {
      currency: "USD",
      issuer: wallet.wallet.address,
    },
    ledger_index: "validated"
  });

  console.log("\n📊 AMM Info:");
  console.log(`   AMM Account: ${ammInfo.result.amm.account}`);
  console.log(`   LP Token: ${ammInfo.result.amm.lp_token.currency}`);
  console.log(`   Asset 1: XRP`);
  console.log(`   Asset 2: USD (${wallet.wallet.address})`);

  console.log("\n📝 Details pour ton admin:");
  console.log(`   Adresse du Pool AMM: ${ammInfo.result.amm.account}`);
  console.log(`   Wallet Owner: ${wallet.wallet.address}`);
  console.log(`   Seed: ${wallet.wallet.seed}`);

  await client.disconnect();
}

createAMMPool().catch(console.error);
