import { Vault } from './types';

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

export const MOCK_VAULTS: Vault[] = [
  {
    id: 'usdc-core',
    token: { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026', color: '#2775CA' },
    netApy: 8.45,
    rewardsApy: 1.2,
    totalSupply: 450000000,
    totalBorrow: 380000000,
    utilization: 84.4,
    liquidity: 70000000,
    riskFactor: 'Low',
    protocol: 'Morpho Blue',
    history: generateHistory(8.45, 1.5),
  },
  {
    id: 'weth-core',
    token: { symbol: 'WETH', name: 'Wrapped Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026', color: '#627EEA' },
    netApy: 3.2,
    totalSupply: 890000000,
    totalBorrow: 500000000,
    utilization: 56.1,
    liquidity: 390000000,
    riskFactor: 'Medium',
    protocol: 'Morpho Blue',
    history: generateHistory(3.2, 0.8),
  },
  {
    id: 'wbtc-core',
    token: { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png?v=026', color: '#F7931A' },
    netApy: 1.8,
    totalSupply: 250000000,
    totalBorrow: 100000000,
    utilization: 40.0,
    liquidity: 150000000,
    riskFactor: 'Low',
    protocol: 'Morpho Blue',
    history: generateHistory(1.8, 0.5),
  },
  {
    id: 'dai-aave',
    token: { symbol: 'DAI', name: 'Dai Stablecoin', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=026', color: '#F5AC37' },
    netApy: 7.1,
    totalSupply: 120000000,
    totalBorrow: 100000000,
    utilization: 83.3,
    liquidity: 20000000,
    riskFactor: 'Medium',
    protocol: 'Aave V3',
    history: generateHistory(7.1, 2.0),
  },
  {
    id: 'usdt-comp',
    token: { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=026', color: '#26A17B' },
    netApy: 9.8,
    rewardsApy: 2.5,
    totalSupply: 60000000,
    totalBorrow: 55000000,
    utilization: 91.6,
    liquidity: 5000000,
    riskFactor: 'High',
    protocol: 'Compound',
    history: generateHistory(9.8, 3.5),
  },
];

export const formatCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};
