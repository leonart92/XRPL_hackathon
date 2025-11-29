import { useState } from "react";
import type { Amount } from "xrpl";
import { xrplService } from "../services/xrpl.service";
import { sendPayment, isInstalled } from "@gemwallet/api";

interface UseDepositOptions {
  vaultAddress: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
  network?: "mainnet" | "testnet";
}

interface UseDepositReturn {
  deposit: (userAddress: string, amount: string) => Promise<void>;
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

  const deposit = async (userAddress: string, amount: string) => {
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      if (!xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const amountObject: Amount = acceptedCurrency === "XRP"
        ? (parseFloat(amount) * 1_000_000).toString()
        : {
            currency: acceptedCurrency,
            issuer: acceptedCurrencyIssuer,
            value: amount,
          };

      const depositTx = await client.autofill({
        TransactionType: "Payment" as const,
        Account: userAddress,
        Destination: vaultAddress,
        Amount: amountObject,
      });

      const win = window as any;
      let result: any;

      const gemWalletInstalled = await isInstalled();
      
      if (gemWalletInstalled.result.isInstalled) {
        const gemResponse = await sendPayment({
          amount: amountObject,
          destination: vaultAddress
        });
        
        if (gemResponse?.result?.hash) {
          result = { result: { hash: gemResponse.result.hash, meta: { TransactionResult: "tesSUCCESS" } } };
        } else {
          throw new Error("Transaction failed or was rejected");
        }
      } else if (win.xaman) {
        const payload = await win.xaman.payload.createAndSubscribe(depositTx);
        if (payload?.response?.txid) {
          result = { result: { hash: payload.response.txid, meta: { TransactionResult: "tesSUCCESS" } } };
        } else {
          throw new Error("Transaction was rejected or failed");
        }
      } else if (win.crossmark) {
        const response = await win.crossmark.signAndSubmit(depositTx);
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
    deposit,
    loading,
    error,
    txHash,
  };
}

export type { UseDepositOptions, UseDepositReturn };
