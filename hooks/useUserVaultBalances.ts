import { useEffect, useState } from "react";
import { xrplService } from "../services/xrpl.service";
import type { Vault } from "../types";

interface VaultBalance {
  vaultAddress: string;
  balance: string;
  vaultTokenCurrency: string;
}

interface UseUserVaultBalancesOptions {
  userAddress: string | null;
  vaults: Vault[];
  network?: "mainnet" | "testnet";
  autoConnect?: boolean;
}

interface UseUserVaultBalancesReturn {
  balances: VaultBalance[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserVaultBalances({
  userAddress,
  vaults,
  network = "testnet",
  autoConnect = true,
}: UseUserVaultBalancesOptions): UseUserVaultBalancesReturn {
  const [balances, setBalances] = useState<VaultBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = async () => {
    if (!userAddress || vaults.length === 0) {
      setBalances([]);
      setLoading(false);
      return;
    }

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
      });

      const userBalances: VaultBalance[] = [];

      for (const vault of vaults) {
        const trustline = response.result.lines.find(
          (line: any) =>
            line.account === vault.vaultAddress &&
            line.currency === vault.vaultTokenCurrency
        );

        if (trustline && parseFloat(trustline.balance) > 0) {
          userBalances.push({
            vaultAddress: vault.vaultAddress,
            balance: trustline.balance,
            vaultTokenCurrency: vault.vaultTokenCurrency,
          });
        }
      }

      setBalances(userBalances);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching user vault balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [userAddress, vaults.length, network]);

  return {
    balances,
    loading,
    error,
    refetch: fetchBalances,
  };
}

export type { VaultBalance, UseUserVaultBalancesOptions, UseUserVaultBalancesReturn };
