import { useState } from "react";
import type { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

interface UseHarvestYieldsOptions {
  vaultAddress: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
  network?: "mainnet" | "testnet";
}

interface UseHarvestYieldsReturn {
  harvestYields: (
    vaultWallet: Wallet,
    ngoAddress: string,
    yieldAmount: string
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

export function useHarvestYields({
  vaultAddress,
  acceptedCurrency,
  acceptedCurrencyIssuer,
  network = "testnet",
}: UseHarvestYieldsOptions): UseHarvestYieldsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const harvestYields = async (
    vaultWallet: Wallet,
    ngoAddress: string,
    yieldAmount: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      if (!xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const transferTx = await client.autofill({
        TransactionType: "Payment" as const,
        Account: vaultAddress,
        Destination: ngoAddress,
        Amount: {
          currency: acceptedCurrency,
          issuer: acceptedCurrencyIssuer,
          value: yieldAmount,
        },
      });

      const signed = vaultWallet.sign(transferTx);
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
    harvestYields,
    loading,
    error,
    txHash,
  };
}

export type { UseHarvestYieldsOptions, UseHarvestYieldsReturn };
