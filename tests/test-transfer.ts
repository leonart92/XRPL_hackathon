import { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

console.log("🧪 Testing TST Transfer Between Non-Issuers\n");

await xrplService.connect("testnet");
const client = xrplService.getClient();

const issuerWallet = Wallet.generate();
const aliceWallet = Wallet.generate();
const bobWallet = Wallet.generate();

console.log("📍 Issuer:", issuerWallet.address);
console.log("📍 Alice:", aliceWallet.address);
console.log("📍 Bob:", bobWallet.address, "\n");

console.log("💰 Funding wallets...");
await Promise.all([
  client.fundWallet(issuerWallet),
  client.fundWallet(aliceWallet),
  client.fundWallet(bobWallet),
]);
console.log("✅ Funded\n");

console.log("⚙️  Enabling DefaultRipple on issuer...");
await client.submitAndWait(
  issuerWallet.sign(
    await client.autofill({
      TransactionType: "AccountSet" as const,
      Account: issuerWallet.address,
      SetFlag: 8,
    })
  ).tx_blob
);
console.log("✅ Done\n");

console.log("🔗 Alice creates TST trustline...");
await client.submitAndWait(
  aliceWallet.sign(
    await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: aliceWallet.address,
      LimitAmount: { currency: "TST", issuer: issuerWallet.address, value: "1000" },
    })
  ).tx_blob
);

console.log("🔗 Bob creates TST trustline...");
await client.submitAndWait(
  bobWallet.sign(
    await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: bobWallet.address,
      LimitAmount: { currency: "TST", issuer: issuerWallet.address, value: "1000" },
    })
  ).tx_blob
);
console.log("✅ Done\n");

console.log("💸 Issuer sends 100 TST to Alice...");
await client.submitAndWait(
  issuerWallet.sign(
    await client.autofill({
      TransactionType: "Payment" as const,
      Account: issuerWallet.address,
      Destination: aliceWallet.address,
      Amount: { currency: "TST", issuer: issuerWallet.address, value: "100" },
    })
  ).tx_blob
);
console.log("✅ Done\n");

let aliceBalance = await xrplService.getAccountBalance(aliceWallet.address);
let bobBalance = await xrplService.getAccountBalance(bobWallet.address);

console.log("📊 Before Transfer:");
console.log("   Alice TST:", aliceBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   Bob TST:", bobBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");

console.log("\n💸 Alice sends 25 TST to Bob...");
await client.submitAndWait(
  aliceWallet.sign(
    await client.autofill({
      TransactionType: "Payment" as const,
      Account: aliceWallet.address,
      Destination: bobWallet.address,
      Amount: { currency: "TST", issuer: issuerWallet.address, value: "25" },
    })
  ).tx_blob
);
console.log("✅ Done");

aliceBalance = await xrplService.getAccountBalance(aliceWallet.address);
bobBalance = await xrplService.getAccountBalance(bobWallet.address);

console.log("\n📊 After Transfer:");
console.log("   Alice TST:", aliceBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");
console.log("   Bob TST:", bobBalance.tokens.find((t) => t.currency === "TST")?.balance || "0");

console.log("\n✅ Transfer test complete!");

await xrplService.disconnect();
