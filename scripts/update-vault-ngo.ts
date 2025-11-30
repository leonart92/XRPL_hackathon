import { xrplService } from "../services/xrpl.service";
import { Wallet } from "xrpl";

const VAULT_ADDRESS = "rsyu6pQUbm1ZbZVxMP7RgnXtgycetiU4L9";
const VAULT_SEED = "sEdV4XGLyorp6MwtbfmjejWpdGbfCT1";
const NEW_NGO_ADDRESS = "rBcW9Gt29RG61QpAEgY3DSwZ68XhZVyCak";

async function updateVaultNGO() {
  await xrplService.connect("testnet");
  const client = xrplService.getClient();
  const vaultWallet = Wallet.fromSeed(VAULT_SEED);

  console.log("📝 Updating vault NGO address...");
  console.log("   Vault:", VAULT_ADDRESS);
  console.log("   New NGO:", NEW_NGO_ADDRESS);

  const accountInfo = await client.request({
    command: "account_info",
    account: VAULT_ADDRESS,
    ledger_index: "validated",
  });

  const domain = accountInfo.result.account_data.Domain;
  if (!domain) {
    throw new Error("Vault has no Domain field");
  }

  const hexBytes = domain.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
  const metadataJson = new TextDecoder().decode(new Uint8Array(hexBytes));
  const metadata = JSON.parse(metadataJson);

  console.log("\n📋 Current metadata:", JSON.stringify(metadata, null, 2));

  metadata.g = NEW_NGO_ADDRESS;

  console.log("\n✏️  Updated metadata:", JSON.stringify(metadata, null, 2));

  const updatedJson = JSON.stringify(metadata);
  const hexDomain = Array.from(new TextEncoder().encode(updatedJson))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  const setDomainTx = await client.autofill({
    TransactionType: "AccountSet" as const,
    Account: VAULT_ADDRESS,
    Domain: hexDomain,
  });

  const signed = vaultWallet.sign(setDomainTx);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("\n✅ Domain updated! TX:", result.result.hash);
  process.exit(0);
}

updateVaultNGO().catch(console.error);
