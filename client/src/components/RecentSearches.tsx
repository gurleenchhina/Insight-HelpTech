import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SearchHistoryItem } from '@/lib/types';

interface RecentSearchesProps {
  onSearchSelect: (query: string) => void;
  getRecentSearches: (limit: number) => Promise<SearchHistoryItem[]>;
}

const RecentSearches = ({ onSearchSelect, getRecentSearches }: RecentSearchesProps) => {
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const data = await getRecentSearches(5);
        setSearches(data);
      } catch (error) {
        console.error('Failed to fetch recent searches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, [getRecentSearches]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="h-8 bg-gray-100 rounded flex items-center px-4">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 max-w-xl mx-auto">
      <h3 className="text-sm text-neutral-500 uppercase tracking-wide font-medium mb-3 text-center">Recent Searches</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {searches.map((search) => (
          <button 
            key={search.id} 
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
            onClick={() => onSearchSelect(search.query)}
          >
            {search.query}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;
