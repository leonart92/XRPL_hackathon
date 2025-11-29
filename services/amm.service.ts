import type {
  AMMDeposit,
  AMMInfoRequest,
  AMMInfoResponse,
  AMMWithdraw,
  Amount,
  Currency,
  IssuedCurrencyAmount,
} from "xrpl";
import { xrplService } from "./xrpl.service";

class AMMService {
  async getAccountInfo(ammAccount: string) {
    const client = xrplService.getClient();

    const request: AMMInfoRequest = {
      command: "amm_info",
      amm_account: ammAccount,
      ledger_index: "validated",
    };

    const response: AMMInfoResponse = await client.request(request);

    const amm = response.result.amm;

    return {
      account: amm.account,
      amount: amm.amount,
      amount2: amm.amount2,
      tradingFee: amm.trading_fee,
      lpToken: amm.lp_token,
      auctionSlot: amm.auction_slot,
      assetFrozen: amm.asset_frozen,
      asset2Frozen: amm.asset2_frozen,
      voteSlots: amm.vote_slots,
    };
  }

  async deposit(params: {
    account: string;
    asset: Currency;
    asset2: Currency;
    amount?: Amount;
    amount2?: Amount;
    lpTokenOut?: IssuedCurrencyAmount;
  }) {
    const client = xrplService.getClient();

    const transaction: AMMDeposit = {
      TransactionType: "AMMDeposit",
      Account: params.account,
      Asset: params.asset,
      Asset2: params.asset2,
      ...(params.amount && { Amount: params.amount }),
      ...(params.amount2 && { Amount2: params.amount2 }),
      ...(params.lpTokenOut && { LPTokenOut: params.lpTokenOut }),
    };

    const prepared = await client.autofill(transaction);
    return prepared;
  }

  async withdraw(params: {
    account: string;
    asset: Currency;
    asset2: Currency;
    amount?: Amount;
    amount2?: Amount;
    lpTokenIn?: IssuedCurrencyAmount;
  }) {
    const client = xrplService.getClient();

    const transaction: AMMWithdraw = {
      TransactionType: "AMMWithdraw",
      Account: params.account,
      Asset: params.asset,
      Asset2: params.asset2,
      ...(params.amount && { Amount: params.amount }),
      ...(params.amount2 && { Amount2: params.amount2 }),
      ...(params.lpTokenIn && { LPTokenIn: params.lpTokenIn }),
    };

    const prepared = await client.autofill(transaction);
    return prepared;
  }
}

export const ammService = new AMMService();
export { AMMService };
