import type { Wallet } from "xrpl";
import { xrplService } from "../xrpl.service";
import type { YieldStrategy } from "./yield-strategy.interface";

interface tokenYieldStrategyConfig {
  vaultAddress: string;
  vaultWallet: Wallet;
  baseCurrency: string;
  baseCurrencyIssuer: string;
  yieldCurrency: string;
  yieldCurrencyIssuer: string;
}

class tokenYieldStrategy implements YieldStrategy {
  private config: tokenYieldStrategyConfig;
  private totalDeployed: number = 0;
  private yieldTokenHeld: string = "0";

  constructor(config: tokenYieldStrategyConfig) {
    this.config = config;
  }

  async deploy(amount: string): Promise<void> {
    const client = xrplService.getClient();

    const swapTx = {
      TransactionType: "Payment" as const,
      Account: this.config.vaultAddress,
      Destination: this.config.vaultAddress,
      Amount: {
        currency: this.config.yieldCurrency,
        issuer: this.config.yieldCurrencyIssuer,
        value: "999999999",
      },
      SendMax: {
        currency: this.config.baseCurrency,
        issuer: this.config.baseCurrencyIssuer,
        value: amount,
      },
      Flags: 0x00020000,
    };

    const prepared = await client.autofill(swapTx as any);
    const signed = this.config.vaultWallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    this.totalDeployed += parseFloat(amount);

    const accountLines = await client.request({
      command: "account_lines",
      account: this.config.vaultAddress,
      ledger_index: "validated",
    });

    const yieldLine = accountLines.result.lines.find(
      (line: any) =>
        line.currency === this.config.yieldCurrency &&
        line.account === this.config.yieldCurrencyIssuer,
    );

    if (yieldLine) {
      this.yieldTokenHeld = yieldLine.balance;
    }
  }

  async withdraw(amount: string): Promise<string> {
    const client = xrplService.getClient();

    const swapTx = {
      TransactionType: "Payment" as const,
      Account: this.config.vaultAddress,
      Destination: this.config.vaultAddress,
      Amount: {
        currency: this.config.baseCurrency,
        issuer: this.config.baseCurrencyIssuer,
        value: amount,
      },
      SendMax: {
        currency: this.config.yieldCurrency,
        issuer: this.config.yieldCurrencyIssuer,
        value: "999999999",
      },
      Flags: 0x00020000,
    };

    const prepared = await client.autofill(swapTx as any);
    const signed = this.config.vaultWallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    this.totalDeployed -= parseFloat(amount);

    const accountLines = await client.request({
      command: "account_lines",
      account: this.config.vaultAddress,
      ledger_index: "validated",
    });

    const yieldLine = accountLines.result.lines.find(
      (line: any) =>
        line.currency === this.config.yieldCurrency &&
        line.account === this.config.yieldCurrencyIssuer,
    );

    if (yieldLine) {
      this.yieldTokenHeld = yieldLine.balance;
    }

    return amount;
  }

  async getYield(): Promise<string> {
    const totalValue = await this.getTotalValue();
    const currentYield = parseFloat(totalValue) - this.totalDeployed;
    return Math.max(0, currentYield).toString();
  }

  async getTotalValue(): Promise<string> {
    if (parseFloat(this.yieldTokenHeld) === 0) {
      return "0";
    }

    const client = xrplService.getClient();

    try {
      const swapTx = {
        TransactionType: "Payment" as const,
        Account: this.config.vaultAddress,
        Destination: this.config.vaultAddress,
        Amount: {
          currency: this.config.baseCurrency,
          issuer: this.config.baseCurrencyIssuer,
          value: "999999999",
        },
        SendMax: {
          currency: this.config.yieldCurrency,
          issuer: this.config.yieldCurrencyIssuer,
          value: this.yieldTokenHeld,
        },
      };

      const prepared = await client.autofill(swapTx as any);

      const meta = prepared as any;
      if (meta.DeliverMax) {
        return typeof meta.DeliverMax === "string"
          ? meta.DeliverMax
          : meta.DeliverMax.value;
      }

      return this.totalDeployed.toString();
    } catch (e) {
      return this.totalDeployed.toString();
    }
  }

  getTotalDeployed(): number {
    return this.totalDeployed;
  }

  getYieldTokenHeld(): string {
    return this.yieldTokenHeld;
  }
}

export { SwapStrategy, type SwapStrategyConfig };
