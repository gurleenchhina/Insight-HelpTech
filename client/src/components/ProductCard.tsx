import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
          
          {/* Safety Warnings Section */}
          <div className="mb-3 p-2 bg-error-light bg-opacity-10 rounded">
            <h4 className="text-sm font-bold mb-1 text-error">Safety Precautions:</h4>
            <ul className="text-sm list-disc list-inside">
              {product.safetyPrecautions.map((precaution, index) => (
                <li key={index}>{precaution}</li>
              ))}
            </ul>
          </div>
          
          {/* View Full Label Button */}
          {product.fullLabelLink && (
            <Button 
              variant="outline" 
              className="w-full text-center py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
              onClick={() => window.open(product.fullLabelLink, '_blank')}
            >
              View Full Label
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProductCard;
