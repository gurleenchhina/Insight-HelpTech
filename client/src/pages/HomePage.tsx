import { useState } from 'react';
import { Container } from "@/components/ui/container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PestCategoryGrid from "@/components/PestCategoryGrid";
import ProductCard from "@/components/ProductCard";
import ApplicationAdviceBox from "@/components/ApplicationAdviceBox";
import { usePestControl } from "@/hooks/usePestControl";
import { Product, Location } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HomePage = () => {
  const { state, getRecommendations } = usePestControl();
  const [selectedPest, setSelectedPest] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>('interior');
  const [showProductRecommendations, setShowProductRecommendations] = useState(false);
  // Removed product map and location tracking functionality
  
  const handlePestSelect = (pestName: string) => {
    setSelectedPest(pestName);
    setShowProductRecommendations(false);
  };
  
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };
  
  const handleGetRecommendations = () => {
    if (selectedPest) {
      getRecommendations(selectedPest, selectedLocation);
      setShowProductRecommendations(true);
    }
  };
  
  // Find a common application advice from the products if available
  const commonAdvice = state.products.length > 0 && state.products[0].advice 
    ? state.products[0].advice 
    : undefined;

  return (
    <Container className="mx-auto p-4">
      {/* Step 1: Select a pest */}
      {!selectedPest && (
        <>
          <h2 className="text-2xl font-bold text-center mb-6">Select a Pest</h2>
          <PestCategoryGrid 
            onPestSelect={handlePestSelect} 
          />
        </>
      )}
      
      {/* Step 2: Select location (interior/exterior) */}
      {selectedPest && !showProductRecommendations && (
        <div className="mt-6">
          <Card className="bg-primary/5 rounded-lg shadow p-2">
            <CardContent className="p-4">
              <h2 className="text-2xl font-bold mb-6 text-center">{selectedPest} Treatment</h2>
              
              <p className="mb-4 text-center">Where is the infestation located?</p>
              
              <div className="w-full max-w-sm mx-auto mb-6">
                <Select 
                  defaultValue={selectedLocation} 
                  onValueChange={(value) => handleLocationSelect(value as Location)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPest(null)}
                >
                  Back
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleGetRecommendations}
                >
                  Get Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Loading state */}
      {state.loading && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      )}
      
      {/* Error state */}
      {state.error && (
        <div className="bg-red-50 p-4 rounded-lg mt-8 text-red-600">
          <p className="font-bold">Error</p>
          <p>{state.error}</p>
        </div>
      )}
      
      {/* Step 3: Product recommendations */}
      {!state.loading && showProductRecommendations && state.pestCategory && state.products.length > 0 && (
        <div id="product-recommendations" className="mt-8">
          <div className="bg-primary-light bg-opacity-10 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="material-icons text-primary mr-2">pest_control</span>
              <div>
                <h2 className="font-condensed font-bold text-lg text-primary">
                  {state.location.charAt(0).toUpperCase() + state.location.slice(1)} {state.pestCategory} Treatment
                </h2>
                <p className="text-sm text-neutral-dark">
                  Showing recommended products for {state.location} {state.pestCategory.toLowerCase()} infestations
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPest(null);
                setShowProductRecommendations(false);
              }}
            >
              Back to Pests
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProductRecommendations(false);
              }}
            >
              Change Location
            </Button>
          </div>

          {state.products.map((product: Product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              expanded={product.isPrimaryChoice} 
            />
          ))}
          
          {commonAdvice && <ApplicationAdviceBox advice={commonAdvice} />}
        </div>
      )}
    </Container>
  );
};

export default HomePage;
