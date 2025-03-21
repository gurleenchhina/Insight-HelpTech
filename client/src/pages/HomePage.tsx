import { useState } from 'react';
import { Container } from "@/components/ui/container";
import LocationToggle from "@/components/LocationToggle";
import PestCategoryGrid from "@/components/PestCategoryGrid";
import ProductCard from "@/components/ProductCard";
import ApplicationAdviceBox from "@/components/ApplicationAdviceBox";
import { usePestControl } from "@/hooks/usePestControl";
import { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = () => {
  const { state, toggleLocation, getRecommendations } = usePestControl();
  
  const handlePestSelect = (pestName: string) => {
    getRecommendations(pestName);
  };
  
  // Find a common application advice from the products if available
  const commonAdvice = state.products.length > 0 && state.products[0].advice 
    ? state.products[0].advice 
    : undefined;

  return (
    <Container className="mx-auto p-4">
      <LocationToggle location={state.location} onToggle={toggleLocation} />
      
      <PestCategoryGrid onPestSelect={handlePestSelect} />
      
      {state.loading && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      )}
      
      {state.error && (
        <div className="bg-red-50 p-4 rounded-lg mt-8 text-red-600">
          <p className="font-bold">Error</p>
          <p>{state.error}</p>
        </div>
      )}
      
      {!state.loading && state.pestCategory && state.products.length > 0 && (
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
