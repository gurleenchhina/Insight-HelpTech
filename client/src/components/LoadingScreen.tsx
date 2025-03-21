import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  className?: string;
}

const LoadingScreen = ({ onLoadingComplete, className }: LoadingScreenProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 2500); // Show loading screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!loading) return null;

  return (
    <div className={cn("fixed inset-0 flex flex-col items-center justify-center bg-primary/5 z-50", className)}>
      <div className="flex flex-col items-center justify-center space-y-10">
        {/* Logo section at top */}
        <div className="relative mb-4">
          <div className="w-64 h-32 flex items-center justify-center">
            {/* Insight Pest Solutions Logo */}
            <div className="z-10 rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/images/insight_pest_solutions_logo.jpeg" 
                alt="Insight Pest Solutions" 
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="absolute top-0 left-0 mt-2 text-lg font-bold text-white bg-primary px-3 py-1 rounded-tr-lg rounded-br-lg z-20 opacity-90">
              HelpTech
            </div>
          </div>
        </div>
        
        {/* Loading animation in center */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Tagline at bottom */}
        <div className="text-sm font-light text-neutral-600">
          By the technician for the technicians
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;