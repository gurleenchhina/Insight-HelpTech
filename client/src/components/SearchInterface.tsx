
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onImageSearch: (base64Image: string) => void;
}

const SearchInterface = ({ onSearch, onImageSearch }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSearch(query);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onImageSearch(base64String);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mb-6 shadow-none border-0">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Describe the pest situation..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white py-3 px-4 pr-10 rounded-lg shadow-sm border-0 focus:ring-2 focus:ring-primary"
          />
          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-neutral-medium hover:text-primary"
              onClick={() => {
                if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
                  const recognition = new SpeechRecognition();
                  recognition.lang = 'en-US';
                  recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setQuery(transcript);
                  };
                  recognition.start();
                } else {
                  alert('Speech recognition is not supported in your browser.');
                }
              }}
            >
              <span className="material-icons">mic</span>
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-3">
          <Button 
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded-lg shadow hover:bg-primary-dark mr-2"
            disabled={!query.trim() || isProcessing}
          >
            <span className="flex items-center">
              <span className="material-icons mr-1">search</span>
              Search
            </span>
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="bg-white text-neutral-dark px-5 py-2 rounded-lg shadow hover:bg-neutral-lightest border border-neutral-light"
            onClick={triggerFileInput}
            disabled={isProcessing}
          >
            <span className="flex items-center">
              <span className="material-icons mr-1">photo_camera</span>
              Image
            </span>
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </div>
      </form>
    </Card>
  );
};

export default SearchInterface;
