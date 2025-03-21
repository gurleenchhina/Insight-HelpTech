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
    return (
      <Card>
        <CardHeader>
          <h3 className="font-condensed font-bold text-lg">Recent Searches</h3>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-medium text-center py-4">No recent searches</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="font-condensed font-bold text-lg mb-3">Recent Searches</h3>
      <Card className="bg-white rounded-lg shadow-md">
        <CardContent className="p-0">
          <ul className="divide-y divide-neutral-light">
            {searches.map((search) => (
              <li 
                key={search.id} 
                className="px-4 py-3 flex items-center hover:bg-neutral-lightest cursor-pointer"
                onClick={() => onSearchSelect(search.query)}
              >
                <span className="material-icons text-neutral-medium mr-3">history</span>
                <span>{search.query}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentSearches;
