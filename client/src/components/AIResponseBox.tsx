import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AISearchResponse } from "@/lib/types";
import { cleanupText } from "@/lib/utils";

interface AIResponseBoxProps {
  response: AISearchResponse;
}

const AIResponseBox = ({ response }: AIResponseBoxProps) => {
  // Determine which product to show info for (primary is preferred)
  const getRecommendedProductName = (): string => {
    if (response.products?.primary) {
      return cleanupText(response.products.primary).split(' ')[0]; // Get first word of primary product
    } else if (response.products?.alternative) {
      return cleanupText(response.products.alternative).split(' ')[0]; // Get first word of alternative product
    } else {
      return ""; // No product found
    }
  };

  const productName = getRecommendedProductName();

  return (
    <Card className="mb-6 bg-white rounded-lg shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start mb-3">
          <div className="bg-primary-light bg-opacity-20 p-2 rounded-full mr-3">
            <span className="material-icons text-primary">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold">AI Assistant</h3>
            <p className="text-xs text-neutral-medium">Powered by OpenAI</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="prose text-sm">
          <p>{cleanupText(response.recommendation)}</p>

          {response.products && (response.products.primary || response.products.alternative) && (
            <>
              <h4 className="text-primary font-medium mt-3">Recommended Products:</h4>
              <ol className="list-decimal list-inside">
                {response.products.primary && (
                  <li><strong>Primary Option:</strong> {cleanupText(response.products.primary)}</li>
                )}
                {response.products.alternative && (
                  <li><strong>Alternative:</strong> {cleanupText(response.products.alternative)}</li>
                )}
              </ol>
            </>
          )}

          {response.applicationAdvice && (
            <p className="mt-2">{cleanupText(response.applicationAdvice)}</p>
          )}
        </div>
        
        {/* Removed Get Product Info Button */}
      </CardContent>
    </Card>
  );
};

export default AIResponseBox;