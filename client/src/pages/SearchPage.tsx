import { useState, useEffect } from 'react';
import { Container } from "@/components/ui/container";
import SearchInterface from "@/components/SearchInterface";
import AIResponseBox from "@/components/AIResponseBox";
import RecentSearches from "@/components/RecentSearches";
import { usePestControl } from "@/hooks/usePestControl";
import { AISearchResponse } from "@/lib/types";
import { Card } from "@/components/ui/card";

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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">HelpTech Pest Control AI</h1>
        <p className="text-neutral-dark">Ask me about any pest situation or product recommendation</p>
      </div>
      
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
      
      {!isSearching && !searchResponse && (
        <Card className="p-6 my-8 shadow-md bg-gradient-to-br from-blue-50 to-green-50 border-none">
          <h2 className="text-xl font-semibold text-center mb-4">Welcome to HelpTech</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center text-center p-3">
              <span className="material-icons text-primary text-4xl mb-2">search</span>
              <h3 className="font-medium mb-2">Describe The Situation</h3>
              <p className="text-neutral-dark text-sm">Type a description of the pest problem or ask about specific products.</p>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <span className="material-icons text-primary text-4xl mb-2">photo_camera</span>
              <h3 className="font-medium mb-2">Upload An Image</h3>
              <p className="text-neutral-dark text-sm">Upload a photo of the pest for identification and treatment recommendations.</p>
            </div>
          </div>
          <p className="text-center text-sm text-neutral-medium mt-6">Powered by DeepSeek AI with Ontario-compliant product data</p>
        </Card>
      )}
      
      <RecentSearches 
        onSearchSelect={handleSearch} 
        getRecentSearches={getRecentSearches} 
      />
    </Container>
  );
};

export default SearchPage;
