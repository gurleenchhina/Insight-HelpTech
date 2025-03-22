import React, { useEffect, useState, useRef } from 'react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { User } from '@/lib/types';

interface AutoLocationTrackerProps {
  user: User;
  onTechniciansUpdate?: (technicians: User[]) => void;
}

/**
 * AutoLocationTracker - Component that automatically tracks the user's location 
 * in the background without any UI elements.
 */
const AutoLocationTracker: React.FC<AutoLocationTrackerProps> = ({ 
  user,
  onTechniciansUpdate
}) => {
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const trackingInitiated = useRef<boolean>(false);
  
  // Initialize location tracking hook
  const { 
    technicians, 
    sendLocation, 
    isConnected
  } = useLocationTracking({
    userId: user.id,
    enabled: locationPermission
  });
  
  // Update parent component with technicians data
  useEffect(() => {
    if (onTechniciansUpdate && technicians.length > 0) {
      onTechniciansUpdate(technicians);
    }
  }, [technicians, onTechniciansUpdate]);

  // Check and request location permission once on component mount
  useEffect(() => {
    if (trackingInitiated.current) return;
    
    trackingInitiated.current = true;
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    // Request permission
    navigator.permissions?.query({ name: 'geolocation' })
      .then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          setLocationPermission(true);
        } else if (permissionStatus.state === 'prompt') {
          // This will trigger the permission prompt
          navigator.geolocation.getCurrentPosition(
            () => setLocationPermission(true),
            () => setLocationPermission(false)
          );
        } else {
          setLocationPermission(false);
        }
        
        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state === 'granted');
        };
      })
      .catch(err => {
        console.error('Error checking location permission:', err);
      });
  }, []);
  
  // Set up periodic location tracking
  useEffect(() => {
    if (!locationPermission) return;
    
    // Function to get current position
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Send location update via WebSocket
          sendLocation(latitude, longitude);
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
  }, [locationPermission, sendLocation]);
  
  // This is a background component - it doesn't render anything
  return null;
};

export default AutoLocationTracker;