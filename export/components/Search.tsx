'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import AIResponse from './AIResponse';
import RecentSearches from './RecentSearches';
import PestFact from './PestFact';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const placeholders = [
    'How do I treat ants in a kitchen?',
    'What product works best for spiders outside?',
    'Wasp nest in the attic',
    'Best treatment for rodents in garage',
    'Bed bug treatment protocol for hotels',
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResponse(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      setSearchResponse(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="input-field pr-12 text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
            disabled={isSearching}
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </form>
      
      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {searchResponse && (
        <AIResponse response={searchResponse} />
      )}
      
      {!searchResponse && !isSearching && (
        <>
          <RecentSearches onSelect={setSearchQuery} />
          <div className="mt-12">
            <PestFact />
          </div>
        </>
      )}
    </div>
  );
}