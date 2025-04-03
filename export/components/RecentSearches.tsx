'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Search } from 'lucide-react';

interface RecentSearch {
  id: number;
  query: string;
  timestamp: string;
}

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const response = await fetch('/api/recent-searches');
        if (!response.ok) {
          throw new Error('Failed to fetch recent searches');
        }
        
        const data = await response.json();
        setRecentSearches(data);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentSearches();
  }, []);
  
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse flex space-x-4 justify-center">
          <div className="h-4 w-4 bg-neutral-medium rounded-full"></div>
          <div className="h-4 w-32 bg-neutral-medium rounded"></div>
        </div>
      </div>
    );
  }
  
  if (recentSearches.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <Clock className="text-neutral-dark mr-2" size={16} />
        <h3 className="text-neutral-dark font-medium">Recent Searches</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((search) => (
          <button
            key={search.id}
            onClick={() => onSelect(search.query)}
            className="flex items-center px-3 py-2 bg-neutral-light hover:bg-neutral-light/80 rounded-md text-sm transition-colors"
          >
            <Search className="mr-2 text-neutral-dark" size={14} />
            <span className="truncate max-w-[200px]">{search.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
}