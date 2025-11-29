export interface APYDataPoint {
  date: string;
  apy: number;
}

export interface Association {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  focus: string[];
  focusDetails?: Record<string, string>;
  location: {
    headquarters: string;
    scope: string;
  };
  branding: {
    logo: string;
    color: string;
    secondaryColor?: string;
  };
  contact: {
    website: string;
    websiteFR?: string;
  };
  walletAddress: string;
}

export interface Vault {
  id: string;
  vaultAddress: string;
  associationId: string;
  name: string;
  description: string;
  acceptedTokens: string[];
  vaultTokenCurrency: string;
  acceptedCurrency: string;
  acceptedCurrencyIssuer: string;
  strategyType: string;
  ngoAddress: string;
  netApy?: number;
  rewardsApy?: number;
  totalSupply?: number;
  totalBorrow?: number;
  utilization?: number;
  liquidity?: number;
  history: APYDataPoint[];
  riskFactor?: 'Low' | 'Medium' | 'High';
  lockPeriod?: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
