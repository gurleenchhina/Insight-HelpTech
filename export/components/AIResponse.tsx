'use client';

import React from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIResponseProps {
  response: {
    recommendation: string;
    pestType: string;
    products: {
      primary?: string;
      alternative?: string;
    };
    applicationAdvice?: string;
  };
}

export default function AIResponse({ response }: AIResponseProps) {
  const { recommendation, pestType, products, applicationAdvice } = response;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-light">
      <div className="bg-secondary text-white p-4">
        <h2 className="text-xl font-semibold">{pestType} Control Recommendation</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Recommendation</h3>
          <p className="text-gray-700">{recommendation}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Recommended Products</h3>
          <div className="space-y-2">
            {products.primary && (
              <div className="flex items-start">
                <CheckCircle className="text-primary mr-2 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-medium">Primary: {products.primary}</p>
                </div>
              </div>
            )}
            
            {products.alternative && (
              <div className="flex items-start">
                <Info className="text-secondary mr-2 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-medium">Alternative: {products.alternative}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {applicationAdvice && (
          <div className="bg-neutral-light p-4 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-medium mb-1">Application Guidelines</h4>
                <p className="text-gray-700 text-sm">{applicationAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}