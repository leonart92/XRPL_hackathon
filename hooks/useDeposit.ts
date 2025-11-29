import { useState } from "react";
import type { Amount, Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

interface UseDepositOptions {
  vaultAddress: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
  network?: "mainnet" | "testnet";
}

interface UseDepositReturn {
  deposit: (userWallet: Wallet, amount: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

export function useDeposit({
  vaultAddress,
  acceptedCurrency,
  acceptedCurrencyIssuer,
  network = "testnet",
}: UseDepositOptions): UseDepositReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const deposit = async (userWallet: Wallet, amount: string) => {
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      if (!xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const amountObject: Amount = {
        currency: acceptedCurrency,
        issuer: acceptedCurrencyIssuer,
        value: amount,
      };

      const depositTx = await client.autofill({
        TransactionType: "Payment" as const,
        Account: userWallet.address,
        Destination: vaultAddress,
        Amount: amountObject,
      });

      const signed = userWallet.sign(depositTx);
      const result = await client.submitAndWait(signed.tx_blob);

      if (result.result.meta && typeof result.result.meta === "object") {
        const meta = result.result.meta as any;
        if (meta.TransactionResult === "tesSUCCESS") {
          setTxHash(result.result.hash);
        } else {
          throw new Error(`Transaction failed: ${meta.TransactionResult}`);
        }
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deposit,
    loading,
    error,
    txHash,
  };
}

export type { UseDepositOptions, UseDepositReturn };
