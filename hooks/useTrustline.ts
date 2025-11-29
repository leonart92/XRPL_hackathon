import { useState } from "react";
import type { Wallet } from "xrpl";
import { xrplService } from "../services/xrpl.service";

interface UseTrustlineOptions {
  vaultAddress: string;
  vaultTokenCurrency: string;
  network?: "mainnet" | "testnet";
}

interface UseTrustlineReturn {
  setupTrustline: (userWallet: Wallet, limit?: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  txHash: string | null;
}

export function useTrustline({
  vaultAddress,
  vaultTokenCurrency,
  network = "testnet",
}: UseTrustlineOptions): UseTrustlineReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const setupTrustline = async (userWallet: Wallet, limit?: string) => {
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      if (!xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const trustlineTx = await client.autofill({
        TransactionType: "TrustSet" as const,
        Account: userWallet.address,
        LimitAmount: {
          currency: vaultTokenCurrency,
          issuer: vaultAddress,
          value: limit || "1000000000",
        },
      });

      const signed = userWallet.sign(trustlineTx);
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
    setupTrustline,
    loading,
    error,
    txHash,
  };
}

export type { UseTrustlineOptions, UseTrustlineReturn };
