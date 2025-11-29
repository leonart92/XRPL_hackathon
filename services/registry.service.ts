import type { Wallet } from "xrpl";
import { xrplService } from "./xrpl.service";

interface VaultMetadata {
  vaultAddress: string;
  vaultTokenCurrency: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
  strategyType: "AMM" | "SWAP" | "TOKEN_YIELD";
  ngoAddress: string;
  name?: string;
  description?: string;
  createdAt: number;
}

interface CompactVaultMetadata {
  c: string;
  a: string;
  i: string;
  s: "A" | "S" | "T";
  g: string;
  n?: string;
  d?: string;
  t: number;
}

interface RegistryConfig {
  registryAddress: string;
  registryWallet: Wallet;
}

class RegistryService {
  private config: RegistryConfig;

  constructor(config: RegistryConfig) {
    this.config = config;
  }

  async registerVault(
    vaultAddress: string,
    vaultWallet: Wallet,
    metadata: Omit<VaultMetadata, "vaultAddress" | "createdAt">
  ): Promise<void> {
    const client = xrplService.getClient();

    const fullMetadata: VaultMetadata = {
      ...metadata,
      vaultAddress,
      createdAt: Date.now(),
    };

    const compactMetadata: CompactVaultMetadata = {
      c: metadata.vaultTokenCurrency,
      a: metadata.acceptedCurrency,
      i: metadata.acceptedCurrencyIssuer,
      s: metadata.strategyType === "AMM" ? "A" : metadata.strategyType === "SWAP" ? "S" : "T",
      g: metadata.ngoAddress,
      n: metadata.name,
      d: metadata.description,
      t: fullMetadata.createdAt,
    };

    const metadataJson = JSON.stringify(compactMetadata);
    const hexDomain = Array.from(new TextEncoder().encode(metadataJson))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    console.log(`📝 Setting vault metadata in Domain field...`);
    const setDomainTx = await client.autofill({
      TransactionType: "AccountSet" as const,
      Account: vaultAddress,
      Domain: hexDomain,
    });
    const signedDomain = vaultWallet.sign(setDomainTx);
    await client.submitAndWait(signedDomain.tx_blob);
    console.log(`✅ Domain set`);

    console.log(`🔗 Registry creating trustline to vault token...`);
    const trustlineTx = await client.autofill({
      TransactionType: "TrustSet" as const,
      Account: this.config.registryAddress,
      LimitAmount: {
        currency: metadata.vaultTokenCurrency,
        issuer: vaultAddress,
        value: "1000000",
      },
    });
    const signedTrustline = this.config.registryWallet.sign(trustlineTx);
    await client.submitAndWait(signedTrustline.tx_blob);
    console.log(`✅ Trustline created`);

    console.log(`💸 Vault sending 1 token to registry to activate trustline...`);
    const activateTx = await client.autofill({
      TransactionType: "Payment" as const,
      Account: vaultAddress,
      Destination: this.config.registryAddress,
      Amount: {
        currency: metadata.vaultTokenCurrency,
        issuer: vaultAddress,
        value: "1",
      },
    });
    const signedActivate = vaultWallet.sign(activateTx);
    await client.submitAndWait(signedActivate.tx_blob);
    console.log(`✅ Vault registered in registry`);
  }

  async listVaults(): Promise<VaultMetadata[]> {
    const client = xrplService.getClient();

    console.log(`📋 Fetching all vaults from registry...`);
    const accountLines = await client.request({
      command: "account_lines",
      account: this.config.registryAddress,
      ledger_index: "validated",
    });

    const vaults: VaultMetadata[] = [];

    for (const line of accountLines.result.lines) {
      try {
        const vaultAddress = line.account;

        const accountInfo = await client.request({
          command: "account_info",
          account: vaultAddress,
          ledger_index: "validated",
        });

        const domain = accountInfo.result.account_data.Domain;
        if (!domain) {
          console.warn(`⚠️  Vault ${vaultAddress} has no Domain field`);
          continue;
        }

        const hexBytes = domain.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
        const metadataJson = new TextDecoder().decode(new Uint8Array(hexBytes));
        const compact: CompactVaultMetadata = JSON.parse(metadataJson);

        const metadata: VaultMetadata = {
          vaultAddress,
          vaultTokenCurrency: compact.c,
          acceptedCurrency: compact.a,
          acceptedCurrencyIssuer: compact.i,
          strategyType: compact.s === "A" ? "AMM" : compact.s === "S" ? "SWAP" : "TOKEN_YIELD",
          ngoAddress: compact.g,
          name: compact.n,
          description: compact.d,
          createdAt: compact.t,
        };

        vaults.push(metadata);
      } catch (e) {
        console.error(
          `❌ Error fetching vault ${line.account}:`,
          (e as Error).message
        );
      }
    }

    console.log(`✅ Found ${vaults.length} vaults`);
    return vaults;
  }

  async getVaultMetadata(vaultAddress: string): Promise<VaultMetadata | null> {
    const client = xrplService.getClient();

    try {
      const accountInfo = await client.request({
        command: "account_info",
        account: vaultAddress,
        ledger_index: "validated",
      });

      const domain = accountInfo.result.account_data.Domain;
      if (!domain) {
        return null;
      }

      const hexBytes = domain.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      const metadataJson = new TextDecoder().decode(new Uint8Array(hexBytes));
      const compact: CompactVaultMetadata = JSON.parse(metadataJson);

      const metadata: VaultMetadata = {
        vaultAddress,
        vaultTokenCurrency: compact.c,
        acceptedCurrency: compact.a,
        acceptedCurrencyIssuer: compact.i,
        strategyType: compact.s === "A" ? "AMM" : compact.s === "S" ? "SWAP" : "TOKEN_YIELD",
        ngoAddress: compact.g,
        name: compact.n,
        description: compact.d,
        createdAt: compact.t,
      };

      return metadata;
    } catch (e) {
      console.error(
        `❌ Error fetching vault metadata:`,
        (e as Error).message
      );
      return null;
    }
  }

  getRegistryAddress(): string {
    return this.config.registryAddress;
  }
}

export { RegistryService, type VaultMetadata, type RegistryConfig };
