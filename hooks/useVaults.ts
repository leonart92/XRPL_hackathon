import { useEffect, useState } from "react";
import { Wallet } from "xrpl";
import {
  RegistryService,
  type VaultMetadata,
} from "../services/registry.service";
import { xrplService } from "../services/xrpl.service";

interface UseVaultsOptions {
  registryAddress?: string;
  network?: "mainnet" | "testnet";
  autoConnect?: boolean;
}

interface UseVaultsReturn {
  vaults: VaultMetadata[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVaults({
  registryAddress,
  network = "testnet",
  autoConnect = true,
}: UseVaultsOptions = {}): UseVaultsReturn {
  const [vaults, setVaults] = useState<VaultMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const effectiveRegistryAddress = registryAddress || import.meta.env.VITE_REGISTRY_ADDRESS;

  const fetchVaults = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useVaults] ALL ENV VARS:', {
        VITE_REGISTRY_ADDRESS: import.meta.env.VITE_REGISTRY_ADDRESS,
        VITE_REGISTRY_SEED: import.meta.env.VITE_REGISTRY_SEED ? '***hidden***' : undefined,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
      });
      console.log('[useVaults] effectiveRegistryAddress:', effectiveRegistryAddress);

      if (!effectiveRegistryAddress) {
        throw new Error(
          "Registry address not provided. Pass registryAddress prop or set REGISTRY_ADDRESS in .env"
        );
      }

      if (autoConnect && !xrplService.isConnected()) {
        console.log('[useVaults] Connecting to XRPL...');
        await xrplService.connect(network);
      }

      const dummyWallet = Wallet.generate();
      const registry = new RegistryService({
        registryAddress: effectiveRegistryAddress,
        registryWallet: dummyWallet,
      });

      console.log('[useVaults] Fetching vaults...');
      const fetchedVaults = await registry.listVaults();
      console.log('[useVaults] Fetched vaults:', fetchedVaults);
      
      // Enrich vaults with on-chain data (totalSupply)
      const client = xrplService.getClient();
      const enrichedVaults = await Promise.all(
        fetchedVaults.map(async (vault) => {
          try {
            const response = await client.request({
              command: "account_lines",
              account: vault.vaultAddress,
              ledger_index: "validated",
            });

            let totalSupply = 0;
            for (const line of response.result.lines) {
              if (line.currency === vault.vaultTokenCurrency) {
                const balance = parseFloat(line.balance);
                if (balance < 0) {
                  totalSupply += Math.abs(balance);
                }
              }
            }

            return {
              ...vault,
              totalSupply,
            };
          } catch (err) {
            console.error(`Error fetching totalSupply for vault ${vault.vaultAddress}:`, err);
            return vault;
          }
        })
      );
      
      setVaults(enrichedVaults);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching vaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, [effectiveRegistryAddress, network]);

  return {
    vaults,
    loading,
    error,
    refetch: fetchVaults,
  };
}

export type { VaultMetadata, UseVaultsOptions, UseVaultsReturn };
