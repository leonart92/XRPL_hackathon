import { useState } from "react";
import { xrplService } from "../services/xrpl.service";
import { setTrustline, isInstalled } from "@gemwallet/api";

interface UseTrustlineOptions {
  vaultAddress: string;
  vaultTokenCurrency: string;
  network?: "mainnet" | "testnet";
}

interface UseTrustlineReturn {
  setupTrustline: (userAddress: string, limit?: string) => Promise<void>;
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

  const setupTrustline = async (userAddress: string, limit?: string) => {
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
        Account: userAddress,
        LimitAmount: {
          currency: vaultTokenCurrency,
          issuer: vaultAddress,
          value: limit || "1000000000",
        },
      });

      const win = window as any;
      let result: any;

      const gemWalletInstalled = await isInstalled();
      
      if (gemWalletInstalled.result.isInstalled) {
        const gemResponse = await setTrustline({
          limitAmount: {
            currency: vaultTokenCurrency,
            issuer: vaultAddress,
            value: limit || "1000000000"
          }
        });
        
        if (gemResponse?.result?.hash) {
          result = { result: { hash: gemResponse.result.hash, meta: { TransactionResult: "tesSUCCESS" } } };
        } else {
          throw new Error("Transaction failed or was rejected");
        }
      } else if (win.xaman) {
        const payload = await win.xaman.payload.createAndSubscribe(trustlineTx);
        if (payload?.response?.txid) {
          result = { result: { hash: payload.response.txid, meta: { TransactionResult: "tesSUCCESS" } } };
        } else {
          throw new Error("Transaction was rejected or failed");
        }
      } else if (win.crossmark) {
        const response = await win.crossmark.signAndSubmit(trustlineTx);
        if (response?.response?.data?.resp?.result?.hash) {
          result = { result: { hash: response.response.data.resp.result.hash, meta: response.response.data.resp.result.meta } };
        } else {
          throw new Error("Transaction was rejected or failed");
        }
      } else {
        throw new Error("No supported wallet found. Please install GemWallet, Xaman, or Crossmark.");
      }

      if (result?.result?.meta && typeof result.result.meta === "object") {
        const meta = result.result.meta as any;
        if (meta.TransactionResult === "tesSUCCESS") {
          setTxHash(result.result.hash);
        } else {
          throw new Error(`Transaction failed: ${meta.TransactionResult}`);
        }
      } else if (result?.result?.hash) {
        setTxHash(result.result.hash);
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
