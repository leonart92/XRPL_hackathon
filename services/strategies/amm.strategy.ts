import type { Currency, IssuedCurrencyAmount, Wallet } from "xrpl";
import { xrplService } from "../xrpl.service";
import type { YieldStrategy } from "./yield-strategy.interface";

interface AMMStrategyConfig {
  vaultAddress: string;
  vaultWallet: Wallet;
  ammAccount: string;
  asset: Currency;
  asset2: Currency;
  baseCurrency: string;
  baseCurrencyIssuer: string;
}

class AMMStrategy implements YieldStrategy {
  private config: AMMStrategyConfig;
  private totalDeployed: number = 0;
  private lpTokensHeld: string = "0";

  constructor(config: AMMStrategyConfig) {
    this.config = config;
  }

  async deploy(amount: string): Promise<void> {
    const client = xrplService.getClient();

    const depositTx = {
      TransactionType: "AMMDeposit" as const,
      Account: this.config.vaultAddress,
      Asset: this.config.asset as any,
      Asset2: this.config.asset2,
      Amount: {
        currency: this.config.baseCurrency,
        issuer: this.config.baseCurrencyIssuer,
        value: amount,
      },
      Flags: 524288,
    };

    const prepared = await client.autofill(depositTx as any);
    const signed = this.config.vaultWallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    this.totalDeployed += parseFloat(amount);

    const ammInfo = await this.getAMMInfo();
    const accountLines = await client.request({
      command: "account_lines",
      account: this.config.vaultAddress,
      ledger_index: "validated",
    });

    const lpLine = accountLines.result.lines.find(
      (line: any) =>
        line.account === ammInfo.account &&
        line.currency === ammInfo.lpToken.currency,
    );

    if (lpLine) {
      this.lpTokensHeld = lpLine.balance;
    } else {
    }
  }

  async withdraw(amount: string): Promise<string> {
    const client = xrplService.getClient();

    const withdrawTx = {
      TransactionType: "AMMWithdraw" as const,
      Account: this.config.vaultAddress,
      Asset: this.config.asset as any,
      Asset2: this.config.asset2,
      Amount: {
        currency: this.config.baseCurrency,
        issuer: this.config.baseCurrencyIssuer,
        value: amount,
      },
      Flags: 524288,
    };

    const prepared = await client.autofill(withdrawTx as any);
    const signed = this.config.vaultWallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    this.totalDeployed -= parseFloat(amount);

    const ammInfo = await this.getAMMInfo();
    const accountLines = await client.request({
      command: "account_lines",
      account: this.config.vaultAddress,
      ledger_index: "validated",
    });

    const lpLine = accountLines.result.lines.find(
      (line: any) =>
        line.account === ammInfo.account &&
        line.currency === ammInfo.lpToken.currency,
    );

    if (lpLine) {
      this.lpTokensHeld = lpLine.balance;
    }

    return amount;
  }

  async getYield(): Promise<string> {
    const totalValue = await this.getTotalValue();
    const currentYield = parseFloat(totalValue) - this.totalDeployed;
    return Math.max(0, currentYield).toString();
  }

  async getTotalValue(): Promise<string> {
    const ammInfo = await this.getAMMInfo();

    const totalLPTokens = parseFloat(ammInfo.lpToken.value);
    const asset1Amount =
      typeof ammInfo.amount === "string"
        ? parseFloat(ammInfo.amount)
        : parseFloat(ammInfo.amount.value);

    const lpTokensHeldNum = parseFloat(this.lpTokensHeld);

    if (totalLPTokens === 0) {
      return "0";
    }

    const shareOfPool = lpTokensHeldNum / totalLPTokens;
    const currentValue = shareOfPool * asset1Amount;

    return currentValue.toString();
  }

  private async getAMMInfo() {
    const client = xrplService.getClient();

    const request = {
      command: "amm_info" as const,
      amm_account: this.config.ammAccount,
      ledger_index: "validated" as const,
    };

    const response = await client.request(request);
    const amm = response.result.amm;

    return {
      account: amm.account,
      amount: amm.amount,
      amount2: amm.amount2,
      lpToken: amm.lp_token,
    };
  }

  getTotalDeployed(): number {
    return this.totalDeployed;
  }

  getLPTokensHeld(): string {
    return this.lpTokensHeld;
  }
}

export { AMMStrategy, type AMMStrategyConfig };
