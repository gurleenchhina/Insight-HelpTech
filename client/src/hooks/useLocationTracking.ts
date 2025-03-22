import { useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types';

type MessageType = 'location-update' | 'initial-data' | 'error';

interface WebSocketMessage {
  type: MessageType;
  data: any;
  userId?: number;
}

interface LocationUpdate {
  userId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface UseLocationTrackingProps {
  userId: number | null;
  enabled?: boolean;
}

interface LocationTrackingResult {
  technicians: User[];
  sendLocation: (latitude: number, longitude: number) => void;
  isConnected: boolean;
  error: string | null;
}

export function useLocationTracking({ 
  userId, 
  enabled = true 
}: UseLocationTrackingProps): LocationTrackingResult {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!enabled || !userId) return;

    // Create WebSocket connection to the same host on the same port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setError(null);

      // When connection opens, send initial data request with user ID
      if (userId) {
        ws.send(JSON.stringify({
          type: 'initial-data',
          userId
        }));
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to location tracking service');
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        // Handle different message types
        if (message.type === 'initial-data') {
          // Initial data contains all technicians with their locations
          setTechnicians(message.data);
        } else if (message.type === 'location-update') {
          // Location update for a specific technician
          const locationUpdate = message.data as LocationUpdate;
          
          setTechnicians(prevTechs => {
            // Update the location of the technician that was updated
            return prevTechs.map(tech => {
              if (tech.id === locationUpdate.userId) {
                return {
                  ...tech,
                  location: {
                    latitude: locationUpdate.latitude,
                    longitude: locationUpdate.longitude
                  },
                  lastActive: locationUpdate.timestamp
                };
              }
              return tech;
            });
          });
        } else if (message.type === 'error') {
          setError(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [userId, enabled]);

  // Function to send user's location update
  const sendLocation = useCallback((latitude: number, longitude: number) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !userId) return;

    const locationUpdate: LocationUpdate = {
      userId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    };

    socket.send(JSON.stringify({
      type: 'location-update',
      userId,
      data: locationUpdate
    }));
  }, [socket, userId]);

  return {
    technicians,
    sendLocation,
    isConnected,
    error
  };
}