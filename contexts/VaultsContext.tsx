import React, { createContext, useContext, useEffect, useState } from "react";
import type { Association, Vault } from "../types";
import { useVaults } from "../hooks/useVaults";
import associationsData from "../associations.json";

interface VaultsContextValue {
  vaults: Vault[];
  associations: Association[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const VaultsContext = createContext<VaultsContextValue | undefined>(undefined);

export function VaultsProvider({ children }: { children: React.ReactNode }) {
  const { vaults: onChainVaults, loading, error, refetch } = useVaults();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [associations] = useState<Association[]>(
    associationsData.associations as Association[]
  );

  useEffect(() => {
    console.log('[VaultsContext] onChainVaults:', onChainVaults);
    console.log('[VaultsContext] loading:', loading);
    console.log('[VaultsContext] error:', error);
    
    if (!onChainVaults) return;

    const enrichedVaults: Vault[] = onChainVaults.map((onChainVault) => {
      const association = associations.find(
        (a) => a.walletAddress === onChainVault.ngoAddress
      );
      
      console.log('[VaultsContext] Processing vault:', {
        name: onChainVault.name,
        ngoAddress: onChainVault.ngoAddress,
        matchedAssociation: association?.name
      });

      const netApy = onChainVault.strategyType === 'AMM' ? 2 : 10;

      return {
        id: onChainVault.vaultAddress,
        vaultAddress: onChainVault.vaultAddress,
        associationId: association?.id || "",
        name: onChainVault.name || "Unknown Vault",
        description: onChainVault.description || "",
        acceptedTokens: [onChainVault.acceptedCurrency],
        vaultTokenCurrency: onChainVault.vaultTokenCurrency,
        acceptedCurrency: onChainVault.acceptedCurrency,
        acceptedCurrencyIssuer: onChainVault.acceptedCurrencyIssuer,
        strategyType: onChainVault.strategyType,
        ngoAddress: onChainVault.ngoAddress,
        netApy,
        totalSupply: onChainVault.totalSupply,
        history: [],
        createdAt: onChainVault.createdAt,
      };
    });

    console.log('[VaultsContext] Enriched vaults:', enrichedVaults);
    setVaults(enrichedVaults);
  }, [onChainVaults, associations]);

  return (
    <VaultsContext.Provider
      value={{ vaults, associations, loading, error, refetch }}
    >
      {children}
    </VaultsContext.Provider>
  );
}

export function useVaultsContext() {
  const context = useContext(VaultsContext);
  if (!context) {
    throw new Error("useVaultsContext must be used within VaultsProvider");
  }
  return context;
}
