
# Backend Architecture Flowchart

```mermaid
graph TD
    A[Client/Frontend] -->|HTTP/WebSocket Requests| B[Express Server Port 5000]
    B --> C{Routes Handler}
    
    C -->|User Auth| D[Storage Layer]
    C -->|Pest Categories| D
    C -->|Product Management| D
    C -->|Search History| D
    
    B -->|Real-time Location| E[WebSocket Server]
    E -->|Location Updates| D
    
    D -->|User Data| F[(In-Memory Storage)]
    D -->|Products| F
    D -->|Pest Categories| F
    D -->|Recommendations| F
    
    C -->|Image Analysis| G[OpenRouter AI API]
    C -->|Speech to Text| H[OpenAI Whisper API]
    
    subgraph "Core Features"
        I[Product Recommendations]
        J[Real-time Tech Location]
        K[AI-Powered Search]
        L[Voice Commands]
    end
    
    C --> I
    E --> J
    G --> K
    H --> L
```

## Key Components

1. **Express Server (Port 5000)**
   - Main entry point for HTTP requests
   - Handles API endpoints and static file serving

2. **WebSocket Server**
   - Real-time location tracking for technicians
   - Live updates for nearby tech availability

3. **Storage Layer**
   - Manages user data, products, and pest categories
   - Handles inventory and recommendations
   - In-memory storage for fast access

4. **AI Integration**
   - Image analysis through OpenRouter AI
   - Voice processing via OpenAI Whisper

5. **Core Features**
   - Product recommendations based on pest type
   - Real-time technician location tracking
   - AI-powered pest identification
   - Voice command processing
