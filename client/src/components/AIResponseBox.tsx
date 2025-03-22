import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AISearchResponse } from "@/lib/types";

interface AIResponseBoxProps {
  response: AISearchResponse;
  onGetProducts: () => void;
}

const AIResponseBox = ({ response, onGetProducts }: AIResponseBoxProps) => {
  return (
    <Card className="mb-6 bg-white rounded-lg shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start mb-3">
          <div className="bg-primary-light bg-opacity-20 p-2 rounded-full mr-3">
            <span className="material-icons text-primary">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold">AI Assistant</h3>
            <p className="text-xs text-neutral-medium">Powered by DeepSeek AI</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="prose text-sm">
          <p>{response.recommendation}</p>
          
          {response.products && (response.products.primary || response.products.alternative) && (
            <>
              <h4 className="text-primary font-medium mt-3">Recommended Products:</h4>
              <ol className="list-decimal list-inside">
                {response.products.primary && (
                  <li><strong>Primary Option:</strong> {response.products.primary}</li>
                )}
                {response.products.alternative && (
                  <li><strong>Alternative:</strong> {response.products.alternative}</li>
                )}
              </ol>
            </>
          )}
          
          {response.applicationAdvice && (
            <p className="mt-2">{response.applicationAdvice}</p>
          )}
        </div>
        
        <div className="mt-4 flex">
          <Button 
            variant="outline" 
            className="text-primary border border-primary rounded px-3 py-1 text-sm mr-2"
            onClick={onGetProducts}
          >
            Get Products
          </Button>
          <Button 
            variant="outline"
            className="text-neutral-dark border border-neutral-light rounded px-3 py-1 text-sm"
          >
            Ask Follow-up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIResponseBox;
