import { useState } from 'react';
import { Container } from "@/components/ui/container";
import SearchInterface from "@/components/SearchInterface";
import AIResponseBox from "@/components/AIResponseBox";
import RecentSearches from "@/components/RecentSearches";
import { usePestControl } from "@/hooks/usePestControl";
import { AISearchResponse } from "@/lib/types";

const SearchPage = () => {
  const { searchWithAI, searchWithImage, getRecentSearches, getRecommendations } = usePestControl();
  const [searchResponse, setSearchResponse] = useState<AISearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleImageSearch = async (base64Image: string) => {
    setIsSearching(true);
    try {
      const response = await searchWithImage(base64Image);
      if (response) {
        setSearchResponse(response);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetProducts = () => {
    if (searchResponse?.pestType && searchResponse.pestType !== 'Unknown') {
      getRecommendations(searchResponse.pestType);
    }
  };

  return (
    <Container className="mx-auto p-4">
      <SearchInterface onSearch={handleSearch} onImageSearch={handleImageSearch} />
      
      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-2 text-neutral-dark">Processing your request...</p>
          </div>
        </div>
      )}
      
      {!isSearching && searchResponse && (
        <AIResponseBox response={searchResponse} onGetProducts={handleGetProducts} />
      )}
      
      <RecentSearches 
        onSearchSelect={handleSearch} 
        getRecentSearches={getRecentSearches} 
      />
    </Container>
  );
};

export default SearchPage;
