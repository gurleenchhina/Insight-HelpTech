import { useState } from 'react';
import { Container } from "@/components/ui/container";
import SearchInterface from "@/components/SearchInterface";
import AIResponseBox from "@/components/AIResponseBox";
import RecentSearches from "@/components/RecentSearches";
import { usePestControl } from "@/hooks/usePestControl";
import { AISearchResponse, Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const SearchPage = () => {
  const { searchWithAI, getRecentSearches, getRecommendations } = usePestControl();
  const [searchResponse, setSearchResponse] = useState<AISearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await searchWithAI(query);
      if (response) {
        setSearchResponse(response);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetProductInfo = async (productName: string) => {
    try {
      // Get product details by name
      const response = await apiRequest({
        url: `/api/products/by-name/${encodeURIComponent(productName)}`,
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const product: Product = await response.json();
      
      // Now we have the product details, get all recommendations for this pest
      if (searchResponse?.pestType && searchResponse.pestType !== 'Unknown') {
        getRecommendations(searchResponse.pestType);
      }
      
      // Provide feedback to the user
      toast({
        title: `Loading details for ${product.name}`,
        description: "Showing product information and recommendations"
      });
      
    } catch (error) {
      console.error('Error fetching product info:', error);
      toast({
        title: 'Product Not Found',
        description: 'Unable to load detailed product information',
        variant: 'destructive'
      });
      
      // Fall back to regular pest recommendations
      if (searchResponse?.pestType && searchResponse.pestType !== 'Unknown') {
        getRecommendations(searchResponse.pestType);
      }
    }
  };

  return (
    <Container className="mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-xl">
          <SearchInterface onSearch={handleSearch} />
        </div>
      </div>
      
      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-2 text-neutral-dark">Processing your request...</p>
          </div>
        </div>
      )}
      
      {!isSearching && searchResponse && (
        <AIResponseBox 
          response={searchResponse} 
          onGetProductInfo={handleGetProductInfo} 
        />
      )}
      
      <RecentSearches 
        onSearchSelect={handleSearch} 
        getRecentSearches={getRecentSearches} 
      />
    </Container>
  );
};

export default SearchPage;
