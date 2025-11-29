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

    const ammInfo = await this.getAMMInfo();
    
    const depositTx = {
      TransactionType: "AMMDeposit" as const,
      Account: this.config.vaultAddress,
      Asset: this.config.asset,
      Asset2: this.config.asset2,
      LPTokenOut: {
        currency: ammInfo.lpToken.currency,
        issuer: ammInfo.lpToken.issuer,
        value: "1",
      },
      Flags: 0x00100000,
    };

    const prepared = await client.autofill(depositTx);
    const signed = this.config.vaultWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    this.totalDeployed += parseFloat(amount);

    const meta = result.result.meta;
    if (typeof meta === "object" && "AffectedNodes" in meta) {
      for (const node of meta.AffectedNodes) {
        if ("ModifiedNode" in node) {
          const nodeData = node.ModifiedNode;
          if (nodeData.LedgerEntryType === "RippleState") {
            const finalFields = nodeData.FinalFields;
            if (finalFields && "Balance" in finalFields) {
              const balance = finalFields.Balance;
              if (
                balance &&
                typeof balance === "object" &&
                "value" in balance &&
                typeof balance.value === "string"
              ) {
                this.lpTokensHeld = (
                  parseFloat(this.lpTokensHeld) + parseFloat(balance.value)
                ).toString();
              }
            }
          }
        } else if ("CreatedNode" in node) {
          const nodeData = node.CreatedNode as any;
          if (nodeData.LedgerEntryType === "RippleState") {
            const newFields = nodeData.NewFields;
            if (newFields && "Balance" in newFields) {
              const balance = newFields.Balance;
              if (
                balance &&
                typeof balance === "object" &&
                "value" in balance &&
                typeof balance.value === "string"
              ) {
                this.lpTokensHeld = (
                  parseFloat(this.lpTokensHeld) + parseFloat(balance.value)
                ).toString();
              }
            }
          }
        }
      }
    }
  }

  async withdraw(amount: string): Promise<string> {
    const client = xrplService.getClient();

    const ammInfo = await this.getAMMInfo();
    const totalLPTokens = parseFloat(ammInfo.lpToken.value);
    const asset1Amount =
      typeof ammInfo.amount === "string"
        ? parseFloat(ammInfo.amount)
        : parseFloat(ammInfo.amount.value);

    const lpTokensNeeded = (parseFloat(amount) / asset1Amount) * totalLPTokens;

    const withdrawTx = {
      TransactionType: "AMMWithdraw" as const,
      Account: this.config.vaultAddress,
      Asset: this.config.asset,
      Asset2: this.config.asset2,
      LPTokenIn: {
        currency: ammInfo.lpToken.currency,
        issuer: ammInfo.lpToken.issuer,
        value: lpTokensNeeded.toString(),
      } as IssuedCurrencyAmount,
    };

    const prepared = await client.autofill(withdrawTx);
    const signed = this.config.vaultWallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);

    this.lpTokensHeld = (
      parseFloat(this.lpTokensHeld) - lpTokensNeeded
    ).toString();
    this.totalDeployed -= parseFloat(amount);

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
