import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
}

const SearchInterface = ({ onSearch }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const placeholders = [
    "What's bugging you?",
    "How to treat ants in kitchen?",
    "Spiders on exterior wall",
    "Mice in basement",
    "Best product for wasps?",
    "Stinkbugs on windows",
    "Centipede infestation",
    "Rodent control for attic"
  ];

  // Rotate placeholders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSearch(query);
  };

  // All voice and image-related functions removed to simplify the app

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="w-full">
        <Input 
          type="text" 
          placeholder={placeholders[placeholderIndex]} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-6 px-6 rounded-xl shadow-md border border-gray-200 focus:ring-2 focus:ring-primary text-lg"
        />
      </div>
      <div className="flex justify-center mt-6">
        <Button 
          type="submit"
          className="bg-primary text-white px-6 py-5 rounded-lg shadow-md hover:bg-primary-dark transition-colors text-base"
          disabled={!query.trim() || isProcessing}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchInterface;
