export interface Association {
  id: string;
  name: string;
  shortName: string;
  symbol: string;
  category: 'Conservation' | 'Climate Action' | 'Ocean Protection' | 'Biodiversity' | 'Waste Reduction';
  description: string;
  focus: string[];
  location: {
    headquarters: string;
    scope: string;
  };
  branding: {
    logo: string;
    color: string;
    secondaryColor: string;
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

export interface Category {
  description: string;
  color: string;
}

export interface AssociationsData {
  associations: Association[];
  categories: {
    [key: string]: Category;
  };
  metadata: {
    version: string;
    lastUpdated: string;
    totalAssociations: number;
    source: string;
  };
}

declare const associationsData: AssociationsData;
export default associationsData;