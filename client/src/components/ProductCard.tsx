import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  expanded?: boolean;
}

const ProductCard = ({ product, expanded = false }: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-condensed font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-neutral-dark mb-1">Reg. No. {product.regNumber}</p>
            <div className="flex flex-wrap items-center gap-2">
              {product.isPrimaryChoice && (
                <Badge className="bg-primary text-white text-xs">Primary Choice</Badge>
              )}
              <Badge 
                className={product.requiresVacancy 
                  ? "bg-secondary-light text-secondary-dark text-xs" 
                  : "bg-green-100 text-green-800 text-xs"}
              >
                {product.requiresVacancy ? "Customer Must Vacate" : "No Vacancy Needed"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-light" onClick={toggleExpanded}>
            <span className="material-icons">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="px-4 pb-4">
          <Tabs defaultValue="application" className="w-full mt-3">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="firstaid">First Aid</TabsTrigger>
            </TabsList>
            
            <TabsContent value="application" className="pt-3">
              {/* Active Ingredients Section */}
              <div className="mb-3">
                <h4 className="text-sm font-bold mb-1 text-neutral-dark">Active Ingredient:</h4>
                <p className="text-sm">{product.activeIngredient}</p>
              </div>
              
              {/* Application Rate Section */}
              <div className="mb-3">
                <h4 className="text-sm font-bold mb-1 text-neutral-dark">Application Rate:</h4>
                <p className="text-sm">{product.applicationRate}</p>
              </div>
              
              {/* Application Advice */}
              {product.advice && (
                <div className="mb-3 p-2 bg-blue-50 rounded">
                  <h4 className="text-sm font-bold mb-1 text-blue-700">Application Notes:</h4>
                  <p className="text-sm text-blue-700">{product.advice}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="safety" className="pt-3">
              {/* Safety Warnings Section */}
              <div className="p-3 bg-error-light bg-opacity-10 rounded">
                <h4 className="text-sm font-bold mb-2 text-error">Safety Precautions:</h4>
                <ul className="text-sm list-disc list-inside">
                  {product.safetyPrecautions.map((precaution, index) => (
                    <li key={index} className="mb-1">{precaution}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="firstaid" className="pt-3">
              {/* First Aid Instructions */}
              <div className="p-3 bg-emerald-50 rounded">
                <h4 className="text-sm font-bold mb-2 text-emerald-700">First Aid Measures:</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 border-l-2 border-emerald-500">
                    <p className="font-medium">If Swallowed:</p>
                    <p>Call a poison control center or doctor immediately for treatment advice. Do not induce vomiting unless told to do so by poison control or doctor.</p>
                  </div>
                  
                  <div className="p-2 border-l-2 border-emerald-500">
                    <p className="font-medium">If Inhaled:</p>
                    <p>Move person to fresh air. If person is not breathing, call 911 or an ambulance, then give artificial respiration.</p>
                  </div>
                  
                  <div className="p-2 border-l-2 border-emerald-500">
                    <p className="font-medium">If on Skin:</p>
                    <p>Take off contaminated clothing. Rinse skin immediately with plenty of water for 15-20 minutes.</p>
                  </div>
                  
                  <div className="p-2 border-l-2 border-emerald-500">
                    <p className="font-medium">If in Eyes:</p>
                    <p>Hold eye open and rinse slowly and gently with water for 15-20 minutes. Remove contact lenses after the first 5 minutes, then continue rinsing.</p>
                  </div>
                  
                  <p className="mt-2 font-bold text-center">Poison Control Center: 1-800-222-1222</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          

        </CardContent>
      )}
    </Card>
  );
};

export default ProductCard;
