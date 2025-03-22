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
      const response = await apiRequest({
        method: 'POST',
        url: '/api/recommendations',
        body: JSON.stringify({
          pestCategory,
          location
        }),
        headers: {
          'Content-Type': 'application/json'
        }
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
      const response = await apiRequest({
        method: 'POST',
        url: '/api/search',
        body: JSON.stringify({ query }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check if the response is HTML (which would cause JSON parsing errors)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML instead of JSON. The AI service might be unavailable.");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI search failed:', error);
      
      // Provide a more helpful error message
      let errorMessage = 'Failed to process your search';
      if (error instanceof Error) {
        if (error.message.includes("Unexpected token")) {
          errorMessage = "The AI service returned an invalid response. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Search Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const searchWithImage = useCallback(async (base64Image: string): Promise<AISearchResponse | null> => {
    try {
      const response = await apiRequest({
        method: 'POST',
        url: '/api/image-search',
        body: JSON.stringify({ image: base64Image }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check if the response is HTML (which would cause JSON parsing errors)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML instead of JSON. The AI service might be unavailable.");
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Image search failed:', error);
      
      // Provide a more helpful error message
      let errorMessage = 'Failed to process your image';
      if (error instanceof Error) {
        if (error.message.includes("Unexpected token")) {
          errorMessage = "The AI service returned an invalid response. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Image Search Failed',
        description: errorMessage,
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
