import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { RecommendationState, Location, Product, AISearchResponse } from '@/lib/types';

export function usePestControl() {
  const { toast } = useToast();
  const [state, setState] = useState<RecommendationState>({
    location: 'interior',
    products: [],
    loading: false,
    error: null
  });

  const toggleLocation = useCallback(() => {
    setState(prev => ({
      ...prev,
      location: prev.location === 'interior' ? 'exterior' : 'interior'
    }));
    
    // If we already have a pest category selected, fetch recommendations for the new location
    if (state.pestCategory) {
      getRecommendations(state.pestCategory, state.location === 'interior' ? 'exterior' : 'interior');
    }
  }, [state.location, state.pestCategory]);

  const getRecommendations = useCallback(async (pestCategory: string, location: Location = state.location) => {
    setState(prev => ({
      ...prev,
      pestCategory,
      loading: true,
      error: null
    }));
    
    try {
      const response = await apiRequest('POST', '/api/recommendations', {
        pestCategory,
        location
      });
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        pestCategory,
        location,
        products: data,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        loading: false
      }));
      
      toast({
        title: 'Error',
        description: 'Failed to fetch product recommendations',
        variant: 'destructive'
      });
    }
  }, [state.location, toast]);

  const searchWithAI = useCallback(async (query: string): Promise<AISearchResponse | null> => {
    try {
      const response = await apiRequest('POST', '/api/search', { query });
      return await response.json();
    } catch (error) {
      console.error('AI search failed:', error);
      toast({
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Failed to process your search',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const searchWithImage = useCallback(async (base64Image: string): Promise<AISearchResponse | null> => {
    try {
      const response = await apiRequest('POST', '/api/image-search', { image: base64Image });
      return await response.json();
    } catch (error) {
      console.error('Image search failed:', error);
      toast({
        title: 'Image Search Failed',
        description: error instanceof Error ? error.message : 'Failed to process your image',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const getRecentSearches = useCallback(async (limit: number = 5) => {
    try {
      const response = await fetch(`/api/recent-searches?limit=${limit}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch recent searches');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch recent searches:', error);
      return [];
    }
  }, []);

  return {
    state,
    toggleLocation,
    getRecommendations,
    searchWithAI,
    searchWithImage,
    getRecentSearches
  };
}
