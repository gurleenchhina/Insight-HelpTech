import { useState } from 'react';
import { Container } from "@/components/ui/container";
import SearchInterface from "@/components/SearchInterface";
import AIResponseBox from "@/components/AIResponseBox";
import RecentSearches from "@/components/RecentSearches";
import PestFact from "@/components/PestFact";
import { usePestControl } from "@/hooks/usePestControl";
import { AISearchResponse } from "@/lib/types";

const SearchPage = () => {
  const { searchWithAI, getRecentSearches } = usePestControl();
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
        />
      )}
      
      <RecentSearches 
        onSearchSelect={handleSearch} 
        getRecentSearches={getRecentSearches} 
      />
      
      {/* Fun Pest Fact at the bottom of the page */}
      <PestFact />
    </Container>
  );
};

export default SearchPage;
