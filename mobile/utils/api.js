import { Platform } from 'react-native';

// API base URL - change this to your actual backend URL when deploying
// For development, we'll use localhost on iOS simulator or the special IP for Android emulator
const BASE_URL = Platform.OS === 'ios' 
  ? 'http://localhost:5000/api'
  : 'http://10.0.2.2:5000/api';

// Helper function to handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from the response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } catch (e) {
      throw new Error(`API Error: ${response.status}`);
    }
  }
  
  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (username, pin) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, pin }),
    });
    
    return handleResponse(response);
  },
  
  signup: async (userData) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
};

// Pest Categories API
export const pestCategoriesAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/pest-categories`);
    return handleResponse(response);
  },
};

// Products & Recommendations API
export const productsAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/products`);
    return handleResponse(response);
  },
  
  getRecommendations: async (pestName, location) => {
    const response = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pestName, location }),
    });
    
    return handleResponse(response);
  },
};

// Search API
export const searchAPI = {
  textSearch: async (query) => {
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    return handleResponse(response);
  },
  
  imageSearch: async (base64Image) => {
    const response = await fetch(`${BASE_URL}/image-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });
    
    return handleResponse(response);
  },
  
  getRecentSearches: async (limit = 5) => {
    const response = await fetch(`${BASE_URL}/recent-searches?limit=${limit}`);
    return handleResponse(response);
  },
};

// User API
export const userAPI = {
  updateLocation: async (userId, latitude, longitude) => {
    const response = await fetch(`${BASE_URL}/user/${userId}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude }),
    });
    
    return handleResponse(response);
  },
  
  updateInventory: async (userId, productId, quantity) => {
    const response = await fetch(`${BASE_URL}/user/${userId}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });
    
    return handleResponse(response);
  },
  
  updateSettings: async (userId, settings) => {
    const response = await fetch(`${BASE_URL}/user/${userId}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    return handleResponse(response);
  },
  
  findNearbyTechnicians: async (latitude, longitude, productId, radiusKm = 50) => {
    const response = await fetch(`${BASE_URL}/nearby-technicians`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude, productId, radiusKm }),
    });
    
    return handleResponse(response);
  },
};

// Speech to Text API
export const speechToTextAPI = {
  convertAudio: async (base64Audio) => {
    const response = await fetch(`${BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioData: base64Audio }),
    });
    
    return handleResponse(response);
  },
};

// Product Labels API
export const labelsAPI = {
  getProductLabel: async (productName) => {
    const response = await fetch(`${BASE_URL}/labels/${encodeURIComponent(productName)}`);
    return response; // Return raw response for PDF handling
  },
};