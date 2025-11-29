import { useEffect, useState } from "react";
import { xrplService } from "../services/xrpl.service";

interface UseVaultBalanceOptions {
  vaultAddress: string;
  userAddress: string;
  vaultTokenCurrency: string;
  network?: "mainnet" | "testnet";
  autoConnect?: boolean;
}

interface UseVaultBalanceReturn {
  balance: string | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaultBalance({
  vaultAddress,
  userAddress,
  vaultTokenCurrency,
  network = "testnet",
  autoConnect = true,
}: UseVaultBalanceOptions): UseVaultBalanceReturn {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      if (autoConnect && !xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const response = await client.request({
        command: "account_lines",
        account: userAddress,
        peer: vaultAddress,
      });

      const trustline = response.result.lines.find(
        (line: any) => line.currency === vaultTokenCurrency
      );

      setBalance(trustline ? trustline.balance : "0");
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching vault balance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [vaultAddress, userAddress, vaultTokenCurrency, network]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}

export type { UseVaultBalanceOptions, UseVaultBalanceReturn };
