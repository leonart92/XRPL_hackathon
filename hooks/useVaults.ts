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

  const effectiveRegistryAddress = registryAddress || process.env.REGISTRY_ADDRESS;

  const fetchVaults = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!effectiveRegistryAddress) {
        throw new Error(
          "Registry address not provided. Pass registryAddress prop or set REGISTRY_ADDRESS in .env"
        );
      }

      if (autoConnect && !xrplService.getClient().isConnected()) {
        await xrplService.connect(network);
      }

      const dummyWallet = Wallet.generate();
      const registry = new RegistryService({
        registryAddress: effectiveRegistryAddress,
        registryWallet: dummyWallet,
      });

      const fetchedVaults = await registry.listVaults();
      setVaults(fetchedVaults);
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
