import { useState } from "react";
import type { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

interface UseWithdrawOptions {
  vaultAddress: string;
  vaultTokenCurrency: string;
  network?: "mainnet" | "testnet";
}

interface UseWithdrawReturn {
  withdraw: (userWallet: Wallet, vTokenAmount: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

export function useWithdraw({
  vaultAddress,
  vaultTokenCurrency,
  network = "testnet",
}: UseWithdrawOptions): UseWithdrawReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const withdraw = async (userWallet: Wallet, vTokenAmount: string) => {
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      if (!xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const withdrawTx = await client.autofill({
        TransactionType: "Payment" as const,
        Account: userWallet.address,
        Destination: vaultAddress,
        Amount: {
          currency: vaultTokenCurrency,
          issuer: vaultAddress,
          value: vTokenAmount,
        },
      });

      const signed = userWallet.sign(withdrawTx);
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
    withdraw,
    loading,
    error,
    txHash,
  };
}

export type { UseWithdrawOptions, UseWithdrawReturn };
