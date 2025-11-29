import type { Amount, Wallet } from "xrpl";
import { xrplService } from "./xrpl.service";

interface VaultConfig {
  address: string;
  wallet: Wallet;
  vaultTokenCurrency: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
}

interface UserDeposit {
  totalDeposited: string;
  vTokensIssued: string;
}

class VaultService {
  private config: VaultConfig;
  private userDeposits: Map<string, UserDeposit> = new Map();
  private isListening: boolean = false;

  constructor(config: VaultConfig) {
    this.config = config;
  }

  getVaultAddress(): string {
    return this.config.address;
  }

  getAddress(): string {
    return this.config.address;
  }

  async listenForDeposits() {
    if (this.isListening) {
      return;
    }

    await xrplService.subscribeToAccount(
      this.config.address,
      this.handleIncomingTransaction.bind(this),
    );

    this.isListening = true;
  }

  private async handleIncomingTransaction(tx: any) {
    const transaction = tx.transaction;

    if (transaction.TransactionType !== "Payment") {
      return;
    }

    if (typeof transaction.Amount !== "object") {
      return;
    }

    const amount = transaction.Amount;

    if (
      amount.currency !== this.config.acceptedCurrency ||
      amount.issuer !== this.config.acceptedCurrencyIssuer
    ) {
      return;
    }

    const depositor = transaction.Account;
    const depositAmount = amount.value;

    await this.issueVaultTokens(depositor, depositAmount);

    const currentDeposit = this.userDeposits.get(depositor) || {
      totalDeposited: "0",
      vTokensIssued: "0",
    };

    this.userDeposits.set(depositor, {
      totalDeposited: (
        parseFloat(currentDeposit.totalDeposited) + parseFloat(depositAmount)
      ).toString(),
      vTokensIssued: (
        parseFloat(currentDeposit.vTokensIssued) + parseFloat(depositAmount)
      ).toString(),
    });
  }

  private async issueVaultTokens(recipient: string, amount: string) {
    const issueTx = await xrplService.prepareIssueToken({
      issuerAccount: this.config.address,
      destination: recipient,
      currency: this.config.vaultTokenCurrency,
      amount,
    });

    const client = xrplService.getClient();
    const signed = this.config.wallet.sign(issueTx);
    await client.submitAndWait(signed.tx_blob);
  }

  getUserDeposit(userAddress: string): UserDeposit | null {
    return this.userDeposits.get(userAddress) || null;
  }

  async prepareTrustline(userAddress: string, limit?: string) {
    const client = xrplService.getClient();

    const transaction = {
      TransactionType: "TrustSet" as const,
      Account: userAddress,
      LimitAmount: {
        currency: this.config.vaultTokenCurrency,
        issuer: this.config.address,
        value: limit || "1000000000",
      },
    };

    const prepared = await client.autofill(transaction);
    return prepared;
  }

  prepareUserDeposit(user: string, amount: Amount) {
    return xrplService.transfer(
      user,
      this.config.address,
      this.config.acceptedCurrency,
      amount,
      this.config.acceptedCurrencyIssuer,
    );
  }

  stopListening() {
    this.isListening = false;
  }
}

export { VaultService, type VaultConfig, type UserDeposit };
