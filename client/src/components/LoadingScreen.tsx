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
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Logo and pulse effect */}
        <div className="relative">
          <div className="w-32 h-32 flex items-center justify-center">
            {/* Logo placeholder - would be replaced with actual logo */}
            <div className="text-4xl font-bold text-primary bg-white p-4 rounded-lg shadow-lg z-10">
              HelpTech
            </div>
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
        </div>
        
        {/* Loading animation */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Tagline */}
        <div className="text-sm font-light text-neutral-600 mt-6">
          By the technician for the technicians
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;