import { Association } from './types';
import associationsData from './associations.json';

export const ASSOCIATIONS: Association[] = associationsData.associations as Association[];

export const CATEGORIES = associationsData.categories;

export const formatCurrency = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};
