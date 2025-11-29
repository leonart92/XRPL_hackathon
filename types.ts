export interface Token {
  symbol: string;
  name: string;
  logo: string; // URL or emoji for simplicity
  color: string;
}

export interface APYDataPoint {
  date: string;
  apy: number;
}

export interface Vault {
  id: string;
  token: Token;
  netApy: number; // Percentage
  rewardsApy?: number; // Additional rewards
  totalSupply: number; // In USD
  totalBorrow: number; // In USD
  utilization: number; // Percentage
  liquidity: number; // In USD
  history: APYDataPoint[];
  riskFactor: 'Low' | 'Medium' | 'High';
  protocol: 'Morpho Blue' | 'Aave V3' | 'Compound';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
