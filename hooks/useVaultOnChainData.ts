import { useEffect, useState } from "react";
import { xrplService } from "../services/xrpl.service";

interface VaultOnChainData {
  totalSupply: number;
  holders: number;
}

interface UseVaultOnChainDataOptions {
  vaultAddress: string;
  vaultTokenCurrency: string;
  network?: "mainnet" | "testnet";
  autoConnect?: boolean;
}

interface UseVaultOnChainDataReturn {
  data: VaultOnChainData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaultOnChainData({
  vaultAddress,
  vaultTokenCurrency,
  network = "testnet",
  autoConnect = true,
}: UseVaultOnChainDataOptions): UseVaultOnChainDataReturn {
  const [data, setData] = useState<VaultOnChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!vaultAddress || !vaultTokenCurrency) {
        setData(null);
        setLoading(false);
        return;
      }

      if (autoConnect && !xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const client = xrplService.getClient();

      const response = await client.request({
        command: "account_lines",
        account: vaultAddress,
        ledger_index: "validated",
      });

      let totalSupply = 0;
      let holders = 0;

      for (const line of response.result.lines) {
        if (line.currency === vaultTokenCurrency) {
          const balance = parseFloat(line.balance);
          if (balance < 0) {
            totalSupply += Math.abs(balance);
            holders++;
          }
        }
      }

      setData({
        totalSupply,
        holders,
      });
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching vault on-chain data:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vaultAddress, vaultTokenCurrency, network]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export type { VaultOnChainData, UseVaultOnChainDataOptions, UseVaultOnChainDataReturn };
