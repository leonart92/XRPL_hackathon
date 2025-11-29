import { Vault } from './types';
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

// Générer les vaults à partir du fichier associations.json
export const MOCK_VAULTS: Vault[] = associationsData.associations
  .filter(assoc => assoc.metrics) // Garder seulement celles qui ont des métriques
  .map(assoc => ({
    id: assoc.id,
    token: {
      symbol: assoc.symbol,
      name: assoc.name,
      logo: assoc.branding.logo,
      color: assoc.branding.color,
    },
    netApy: assoc.metrics!.netApy,
    rewardsApy: assoc.metrics!.rewardsApy,
    totalSupply: assoc.metrics!.totalSupply,
    totalBorrow: assoc.metrics!.totalBorrow,
    utilization: assoc.metrics!.utilization,
    liquidity: assoc.metrics!.liquidity,
    riskFactor: assoc.metrics!.riskFactor as 'Low' | 'Medium' | 'High',
    protocol: assoc.category as 'Conservation' | 'Climate Action' | 'Ocean Protection' | 'Biodiversity' | 'Waste Reduction',
    history: generateHistory(assoc.metrics!.netApy, assoc.metrics!.netApy > 5 ? 2 : 1),
  }));

// Exporter aussi les données complètes des associations
export const ASSOCIATIONS = associationsData.associations;
export const CATEGORIES = associationsData.categories;

export const formatCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};
