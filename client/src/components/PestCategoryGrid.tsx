import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PestCategory } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface PestCategoryGridProps {
  onPestSelect: (pestName: string) => void;
}

const PestCategoryGrid = ({ onPestSelect }: PestCategoryGridProps) => {
  const { data: categories, isLoading, error } = useQuery<PestCategory[]>({
    queryKey: ['/api/pest-categories'],
  });
  
  // Mapping of pest names to emoji icons
  const pestEmojis: Record<string, string> = {
    'Ants': '🐜',
    'Spiders': '🕷️',
    'Wasps': '🐝',
    'Stink Bugs': '🐞',
    'Rodents': '🐭',
    'Cockroaches': '🪳',
    'Other': '🔍'
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="bg-white rounded-lg shadow-md">
            <CardContent className="flex flex-col items-center p-4">
              <Skeleton className="w-20 h-20 rounded-full mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">
        Failed to load pest categories. Please try again.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {(categories || []).map((category: PestCategory) => (
        <Card 
          key={category.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onPestSelect(category.name)}
        >
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 mb-2 flex items-center justify-center border-2 border-primary/50">
              <span className="text-4xl" aria-hidden="true">
                {pestEmojis[category.name] || pestEmojis['Other']}
              </span>
            </div>
            <span className="font-medium text-center">{category.name}</span>
          </CardContent>
        </Card>
      ))}
      
      {/* Other Pests option */}
      <Card
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onPestSelect('Other')}
      >
        <CardContent className="flex flex-col items-center p-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-2 flex items-center justify-center border-2 border-gray-300">
            <span className="text-4xl" aria-hidden="true">
              {pestEmojis['Other']}
            </span>
          </div>
          <span className="font-medium text-center">Other Pests</span>
        </CardContent>
      </Card>
    </div>
  );
};

export default PestCategoryGrid;
