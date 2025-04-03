import { useState, useEffect } from 'react';
import { Container } from "@/components/ui/container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PestCategoryGrid from "@/components/PestCategoryGrid";
import ProductCard from "@/components/ProductCard";
import TechnicianMap from "@/components/TechnicianMap";
import ApplicationAdviceBox from "@/components/ApplicationAdviceBox";
import { usePestControl } from "@/hooks/usePestControl";
import { Product, Location, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  const { state, getRecommendations } = usePestControl();
  const [selectedPest, setSelectedPest] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>('interior');
  const [showProductRecommendations, setShowProductRecommendations] = useState(false);
  const [showProductMap, setShowProductMap] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState({ latitude: 43.6532, longitude: -79.3832 }); // Default to Toronto
  
  // Get all products and nearby technicians
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: showProductMap
  });
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/current'],
    enabled: false,
  });
  
  // If we have a selected product and user location, get nearby technicians
  const { data: nearbyTechnicians, isLoading: isLoadingTechnicians } = useQuery<User[]>({
    queryKey: ['/api/nearby-technicians', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId || !userLocation) return [];
      
      const response = await fetch('/api/nearby-technicians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProductId,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm: 50 // 50km radius by default
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby technicians');
      }
      
      return response.json();
    },
    enabled: !!selectedProductId && showProductMap,
  });
  
  // Get user's location when they click "Get Products"
  useEffect(() => {
    if (showProductMap && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [showProductMap]);
  
  const handlePestSelect = (pestName: string) => {
    setSelectedPest(pestName);
    setShowProductRecommendations(false);
    setShowProductMap(false);
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
  
  const handleGetProductsClick = () => {
    setShowProductMap(true);
    setSelectedPest(null);
    setShowProductRecommendations(false);
  };
  
  const handleProductSelect = (productId: number) => {
    setSelectedProductId(productId);
  };
  
  // Find a common application advice from the products if available
  const commonAdvice = state.products.length > 0 && state.products[0].advice 
    ? state.products[0].advice 
    : undefined;

  return (
    <Container className="mx-auto p-4">
      {/* Step 1: Select a pest */}
      {!selectedPest && !showProductMap && (
        <>
          <h2 className="text-2xl font-bold text-center mb-6">Select a Pest</h2>
          <PestCategoryGrid 
            onPestSelect={handlePestSelect} 
            onGetProductsClick={handleGetProductsClick}
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
      
      {/* Product Map Integration */}
      {showProductMap && (
        <div className="mt-6">
          <div className="bg-primary-light bg-opacity-10 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="material-icons text-primary mr-2">inventory_2</span>
              <div>
                <h2 className="font-condensed font-bold text-lg text-primary">
                  Find Nearby Technicians
                </h2>
                <p className="text-sm text-neutral-dark">
                  Select a product to find technicians with stock in your area
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setShowProductMap(false);
              setSelectedProductId(null);
            }}
            className="mb-4"
          >
            Back to Pests
          </Button>
          
          {/* Product selection */}
          {products && products.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Select a Product</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(product => (
                  <Card 
                    key={product.id}
                    className={`cursor-pointer ${selectedProductId === product.id ? 'border-2 border-primary' : ''}`}
                    onClick={() => handleProductSelect(product.id)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-bold">{product.name}</h4>
                      <p className="text-sm text-neutral-dark">{product.activeIngredient}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Map with nearby technicians */}
          {selectedProductId && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3">Nearby Technicians</h3>
              
              {isLoadingTechnicians ? (
                <div className="flex flex-col items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p>Loading nearby technicians...</p>
                </div>
              ) : nearbyTechnicians && nearbyTechnicians.length > 0 ? (
                <TechnicianMap 
                  technicians={nearbyTechnicians}
                  productId={selectedProductId}
                  userLocation={userLocation}
                />
              ) : (
                <Card className="p-6 text-center">
                  <p>No technicians found with this product in your area.</p>
                  <p className="text-sm text-neutral-dark mt-2">Try selecting a different product or expanding your search radius.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default HomePage;
