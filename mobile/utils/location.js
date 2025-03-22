import * as Location from 'expo-location';
import { userAPI } from './api';

// Get current location with given options
export const getCurrentLocation = async (options = {}) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      ...options
    });
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

// Start background location tracking
export const startLocationTracking = async (userId, onLocationUpdate) => {
  try {
    // Check if background location permission is available
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    
    // Get more detailed permission for background tracking on iOS
    if (Platform.OS === 'ios') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted. Tracking will be limited.');
      }
    }
    
    // Start watching position
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10, // Update if moved by 10 meters
        timeInterval: 5000, // Or every 5 seconds
      },
      async (location) => {
        // Send location to server
        try {
          const { latitude, longitude } = location.coords;
          const updatedUser = await userAPI.updateLocation(
            userId, 
            latitude, 
            longitude
          );
          
          // Callback with updated location if provided
          if (onLocationUpdate) {
            onLocationUpdate(location, updatedUser);
          }
        } catch (error) {
          console.error('Error updating location on server:', error);
        }
      }
    );
    
    return locationSubscription;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    throw error;
  }
};

// Calculate distance between two coordinate points in kilometers (using Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

// Helper function: Convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Estimate travel time based on distance (very rough estimation)
export const estimateTravelTime = (distanceKm) => {
  // Assuming average speed of 40 km/h in urban areas
  const hours = distanceKm / 40;
  const minutes = Math.round(hours * 60);
  
  if (minutes < 1) {
    return 'Less than a minute';
  } else if (minutes === 1) {
    return '1 minute';
  } else if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    if (mins === 0) {
      return `${hrs} hour${hrs > 1 ? 's' : ''}`;
    } else {
      return `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    }
  }
};