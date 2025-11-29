import { Wallet } from "xrpl";
import { xrplService } from "./services/xrpl.service";

await xrplService.connect("testnet");
const client = xrplService.getClient();

console.log("🚀 Création d'un AMM pool sur testnet...\n");

const wallet = Wallet.generate();
console.log("📍 Wallet address:", wallet.address);
console.log("🔑 Wallet seed:", wallet.seed);

console.log("\n💰 Funding wallet via faucet...");
await client.fundWallet(wallet);

const balance = await xrplService.getAccountBalance(wallet.address);
console.log("✅ Balance XRP:", balance.xrp, "drops\n");

console.log("🏊 Création AMM pool XRP/TST...");

const ammCreate = {
  TransactionType: "AMMCreate" as const,
  Account: wallet.address,
  Amount: "10000000",
  Amount2: {
    currency: "TST",
    issuer: wallet.address,
    value: "1000",
  },
  TradingFee: 500,
};

try {
  const prepared = await client.autofill(ammCreate);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("✅ AMM créé!");
  console.log("📝 Transaction hash:", result.result.hash);

  const ammInfo = await client.request({
    command: "amm_info",
    asset: { currency: "XRP" },
    asset2: {
      currency: "TST",
      issuer: wallet.address,
    },
    ledger_index: "validated",
  });

  console.log("\n📊 AMM Pool Info:");
  console.log("   AMM Account:", ammInfo.result.amm.account);
  console.log("   Asset 1 (XRP):", ammInfo.result.amm.amount);
  console.log("   Asset 2 (TST):", ammInfo.result.amm.amount2);
  console.log("   LP Token:", ammInfo.result.amm.lp_token);
  console.log("   Trading Fee:", ammInfo.result.amm.trading_fee);

  console.log("\n🎯 Config pour ton vault:");
  console.log(`{
  ammAccount: "${ammInfo.result.amm.account}",
  asset: { currency: "XRP" },
  asset2: { currency: "TST", issuer: "${wallet.address}" },
  baseCurrency: "TST",
  baseCurrencyIssuer: "${wallet.address}",
}`);

  console.log("\n💾 Sauvegarde ces infos pour tes tests!");
} catch (error) {
  console.error("❌ Erreur:", error);
}

await xrplService.disconnect();
console.log("\n✅ Déconnecté");
