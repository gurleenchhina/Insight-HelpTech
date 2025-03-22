import React, { useEffect, useState } from 'react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/lib/types';

interface LocationTrackerProps {
  user: User;
  onTechniciansUpdate?: (technicians: User[]) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ 
  user,
  onTechniciansUpdate
}) => {
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  
  // Initialize location tracking hook
  const { 
    technicians, 
    sendLocation, 
    isConnected, 
    error: wsError 
  } = useLocationTracking({
    userId: user.id,
    enabled: trackingEnabled
  });
  
  // Update parent component with technicians data
  useEffect(() => {
    if (onTechniciansUpdate && technicians.length > 0) {
      onTechniciansUpdate(technicians);
    }
  }, [technicians, onTechniciansUpdate]);
  
  // Function to toggle location tracking
  const toggleTracking = () => {
    if (!trackingEnabled) {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        return;
      }
      
      // Start tracking
      setTrackingEnabled(true);
      setLocationError(null);
    } else {
      // Stop tracking
      setTrackingEnabled(false);
    }
  };
  
  // Set up periodic location tracking
  useEffect(() => {
    if (!trackingEnabled) return;
    
    // Function to get current position
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Send location update via WebSocket
          sendLocation(latitude, longitude);
          
          // Update last update time
          setLastUpdateTime(new Date().toLocaleTimeString());
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(`Error getting location: ${error.message}`);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };
    
    // Update location immediately
    updateLocation();
    
    // Set interval to update location periodically (every 30 seconds)
    const intervalId = setInterval(updateLocation, 30000);
    
    // Clean up interval on unmount or when tracking is disabled
    return () => clearInterval(intervalId);
  }, [trackingEnabled, sendLocation]);
  
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Location Tracking</h3>
        <Button 
          variant={trackingEnabled ? "destructive" : "default"}
          size="sm"
          onClick={toggleTracking}
        >
          {trackingEnabled ? 'Stop Tracking' : 'Start Tracking'}
        </Button>
      </div>
      
      {trackingEnabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "outline" : "destructive"}>
              {isConnected ? 
                <><Wifi className="w-3 h-3 mr-1" /> Connected</> : 
                <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>
              }
            </Badge>
            
            {lastUpdateTime && (
              <Badge variant="secondary">
                <MapPin className="w-3 h-3 mr-1" /> Updated {lastUpdateTime}
              </Badge>
            )}
          </div>
          
          {(locationError || wsError) && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {locationError || wsError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            {isConnected ? 
              `Sharing location with ${technicians.length - 1} other technicians` : 
              'Connecting to location service...'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;