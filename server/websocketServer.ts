import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { log } from './vite';

// User location update interface
interface LocationUpdate {
  userId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Types of messages
type MessageType = 'location-update' | 'initial-data' | 'error';

// Interface for WebSocket messages
interface WebSocketMessage {
  type: MessageType;
  data: any;
  userId?: number;
}

// Create WebSocket server
export function setupWebSocketServer(httpServer: Server) {
  // Use a specific path for our WebSocket server to avoid conflicts with Vite WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws/location'
  });
  
  log(`WebSocket server initialized`, 'websocket');
  
  // Store client connections mapped to user IDs
  const clients = new Map<number, any>();

  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    log(`New WebSocket connection established`, 'websocket');
    
    // Handle incoming messages
    ws.on('message', async (messageData) => {
      try {
        const messageStr = messageData.toString();
        const parsedMessage = JSON.parse(messageStr);
        
        // Handle different message types
        if (parsedMessage.type === 'location-update' && parsedMessage.userId) {
          userId = parsedMessage.userId as number;
          clients.set(userId, ws);
          
          // Extract location data
          const locationData = parsedMessage.data as LocationUpdate;
          
          // Update user location in storage
          await storage.updateUserLocation(
            userId,
            locationData.latitude,
            locationData.longitude
          );
          
          // Broadcast the updated location to all connected clients
          broadcastLocationUpdate(locationData);
          
          log(`Location updated for user ${userId}`, 'websocket');
        }
        else if (parsedMessage.type === 'initial-data' && parsedMessage.userId) {
          // Register the client with the user ID
          userId = parsedMessage.userId as number;
          clients.set(userId, ws);
          
          // Send the current locations of all users to the newly connected client
          const users = await getAllUserLocations();
          ws.send(JSON.stringify({
            type: 'initial-data',
            data: users
          }));
          
          log(`Sent initial data to user ${userId}`, 'websocket');
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: 'Invalid message format'
        }));
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        log(`User ${userId} disconnected`, 'websocket');
      }
    });
  });
  
  // Broadcast location update to all connected clients
  function broadcastLocationUpdate(locationUpdate: LocationUpdate) {
    const message: WebSocketMessage = {
      type: 'location-update',
      data: locationUpdate
    };
    
    const messageStr = JSON.stringify(message);
    
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN = 1
        client.send(messageStr);
      }
    });
  }
  
  // Get all user locations
  async function getAllUserLocations() {
    const users = await storage.getAllUsers();
    return users.map(user => ({
      userId: user.id,
      techId: user.techId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      lastActive: user.lastActive
    }));
  }
  
  return wss;
}