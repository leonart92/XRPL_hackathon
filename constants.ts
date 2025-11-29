import { Vault, Association } from './types';
import associationsData from './associations.json';

const generateHistory = (baseApy: number, volatility: number): { date: string; apy: number }[] => {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const randomChange = (Math.random() - 0.5) * volatility;
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      apy: Math.max(0, baseApy + randomChange),
    });
  }
  return data;
};

export const ASSOCIATIONS: Association[] = associationsData.associations as Association[];

export const VAULTS: Vault[] = associationsData.vaults.map(vault => ({
  ...vault,
  riskFactor: vault.riskFactor as 'Low' | 'Medium' | 'High',
  history: generateHistory(vault.netApy, vault.netApy > 5 ? 2 : 1),
}));

export const getVaultsByAssociation = (associationId: string): Vault[] => {
  return VAULTS.filter(vault => vault.associationId === associationId);
};

export const getAssociationById = (id: string): Association | undefined => {
  return ASSOCIATIONS.find(a => a.id === id);
};

export const getVaultById = (id: string): Vault | undefined => {
  return VAULTS.find(v => v.id === id);
};

export const CATEGORIES = associationsData.categories;

export const formatCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

export const MOCK_VAULTS = VAULTS;
