export interface PestCategory {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  regNumber: string;
  activeIngredient: string;
  applicationRate: string;
  safetyPrecautions: string[];
  isPrimaryChoice: boolean;
  requiresVacancy: boolean;
  fullLabelLink?: string;
  advice?: string;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  timestamp: string;
}

export interface AISearchResponse {
  recommendation: string;
  pestType: string;
  products: {
    primary?: string;
    alternative?: string;
  };
  applicationAdvice?: string;
}

export type Location = 'interior' | 'exterior';

export interface SettingsState {
  darkMode: boolean;
  textSize: number;
  brightness: number;
  safetyAlerts: boolean;
  ppeReminders: boolean;
}

export interface RecommendationState {
  pestCategory?: string;
  location: Location;
  products: Product[];
  loading: boolean;
  error: string | null;
}
