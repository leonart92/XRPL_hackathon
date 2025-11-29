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
  protocol: 'Conservation' | 'Climate Action' | 'Ocean Protection' | 'Biodiversity' | 'Waste Reduction';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Association {
  id: string;
  name: string;
  shortName: string;
  symbol: string;
  category: string;
  description: string;
  focus: string[];
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
  metrics?: {
    netApy: number;
    rewardsApy?: number;
    totalSupply: number;
    totalBorrow: number;
    utilization: number;
    liquidity: number;
    riskFactor: 'Low' | 'Medium' | 'High';
  };
}
