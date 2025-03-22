import { 
  users, 
  products, 
  pestCategories, 
  pestProductRecommendations,
  searchHistory,
  type User, 
  type InsertUser,
  type Product,
  type PestCategory,
  type PestProductRecommendation,
  type SearchHistoryItem
} from "@shared/schema";

// Type definition for user settings
export interface UserSettings {
  darkMode: boolean;
  brightness: number;
  safetyAlerts: boolean;
  ppeReminders: boolean;
  textSize: number;
}

// Storage interface definition
export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTechId(techId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(techId: string, pin: string): Promise<User | null>;
  updateUserLocation(userId: number, latitude: number, longitude: number): Promise<User>;
  updateUserInventory(userId: number, productId: number, quantity: number): Promise<User>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<User>;
  getUsersWithProductInInventory(productId: number): Promise<User[]>;
  getNearbyTechnicians(productId: number, latitude: number, longitude: number, radiusKm: number): Promise<User[]>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  
  // Pest Categories
  getAllPestCategories(): Promise<PestCategory[]>;
  getPestCategoryById(id: number): Promise<PestCategory | undefined>;
  getPestCategoryByName(name: string): Promise<PestCategory | undefined>;
  
  // Product Recommendations
  getRecommendationsByPestAndLocation(pestName: string, location: string): Promise<(Product & { advice?: string })[]>;
  
  // Search History
  addSearchQuery(query: string): Promise<SearchHistoryItem>;
  getRecentSearches(limit: number): Promise<SearchHistoryItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private pestCategories: Map<number, PestCategory>;
  private pestProductRecommendations: Map<number, PestProductRecommendation>;
  private searchHistoryItems: Map<number, SearchHistoryItem>;
  
  private currentUserId: number;
  private currentProductId: number;
  private currentPestCategoryId: number;
  private currentRecommendationId: number;
  private currentSearchHistoryId: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.pestCategories = new Map();
    this.pestProductRecommendations = new Map();
    this.searchHistoryItems = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentPestCategoryId = 1;
    this.currentRecommendationId = 1;
    this.currentSearchHistoryId = 1;
    
    this.initializeData();
  }
  
  private initializeData() {
    // Add pest categories
    const categories = [
      { id: this.currentPestCategoryId++, name: "Ants", imageUrl: "https://images.unsplash.com/photo-1611576433610-61345f4d110b?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" },
      { id: this.currentPestCategoryId++, name: "Spiders", imageUrl: "https://images.unsplash.com/photo-1556280309-2ec9fbcced52?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" },
      { id: this.currentPestCategoryId++, name: "Wasps", imageUrl: "https://images.unsplash.com/photo-1589825274766-c488dae7a0cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" },
      { id: this.currentPestCategoryId++, name: "Stinkbugs", imageUrl: "https://images.unsplash.com/photo-1596839347042-6ee447982327?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" },
      { id: this.currentPestCategoryId++, name: "Rodents", imageUrl: "https://images.unsplash.com/photo-1548247414-3ab903371542?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" },
    ];
    
    categories.forEach(category => {
      this.pestCategories.set(category.id, category);
    });
    
    // Add products
    const productsData = [
      { 
        id: this.currentProductId++, 
        name: "SECLIRA WSG", 
        regNumber: "34816", 
        activeIngredient: "Dinotefuran 40.0%", 
        applicationRate: "10-30 grams per 90 square meters (0.1%-0.3% dilution)", 
        safetyPrecautions: [
          "DO NOT apply when people or pets are present",
          "Wear long-sleeved shirt, long pants, chemical resistant gloves",
          "Ventilate treated areas after application"
        ],
        isPrimaryChoice: true,
        requiresVacancy: true,
        fullLabelLink: "/api/labels/seclira"
      },
      { 
        id: this.currentProductId++, 
        name: "Greenway Ant & Roach Bait Gel", 
        regNumber: "30375", 
        activeIngredient: "Abamectin 0.05%", 
        applicationRate: "Small drops (0.25-0.5g) every 1-3 meters in areas of ant activity", 
        safetyPrecautions: [
          "DO NOT apply to areas accessible to children or pets",
          "Wash hands after handling",
          "Keep away from food preparation areas"
        ],
        isPrimaryChoice: false,
        requiresVacancy: false,
        fullLabelLink: "/api/labels/greenway"
      },
      { 
        id: this.currentProductId++, 
        name: "Maxforce Quantum Ant Bait", 
        regNumber: "30513", 
        activeIngredient: "Imidacloprid 0.03%", 
        applicationRate: "Apply as 5mm droplets with up to 1g per m²", 
        safetyPrecautions: [
          "Apply only in areas inaccessible to children and pets",
          "Avoid contact with skin, eyes and clothing",
          "Wash thoroughly after handling"
        ],
        isPrimaryChoice: false,
        requiresVacancy: false,
        fullLabelLink: "/api/labels/maxforce-quantum"
      },
      { 
        id: this.currentProductId++, 
        name: "Suspend Polyzone", 
        regNumber: "34599", 
        activeIngredient: "Deltamethrin 50g/L", 
        applicationRate: "6mL per L of water (0.03% concentration)", 
        safetyPrecautions: [
          "DO NOT apply when people, pets or livestock are present",
          "Wear long-sleeved shirt, long pants, chemical resistant gloves, shoes and socks",
          "Apply only when potential for drift is minimal"
        ],
        isPrimaryChoice: true,
        requiresVacancy: true,
        fullLabelLink: "/api/labels/suspend-polyzone"
      },
      { 
        id: this.currentProductId++, 
        name: "Temprid SC", 
        regNumber: "32524", 
        activeIngredient: "Imidacloprid 21.0%, Beta-cyfluthrin 10.5%", 
        applicationRate: "8-16mL per L of water", 
        safetyPrecautions: [
          "DO NOT allow re-entry into indoor treated areas during the REI of 6 hours",
          "Wear long-sleeved shirt, long pants, chemical resistant gloves",
          "Ventilate treated areas after application"
        ],
        isPrimaryChoice: false,
        requiresVacancy: true,
        fullLabelLink: "/api/labels/temprid-sc"
      },
      { 
        id: this.currentProductId++, 
        name: "Drione Insecticide Dust", 
        regNumber: "15255", 
        activeIngredient: "Pyrethrins 1.0%, Piperonyl Butoxide 10.0%, Silica Gel 40.0%", 
        applicationRate: "Apply as a dust at a rate of 1-2g per m²", 
        safetyPrecautions: [
          "DO NOT apply as a space spray while unprotected humans or pets are present",
          "Wear a suitable dust mask when applying this product",
          "Avoid contact with skin, eyes or clothing"
        ],
        isPrimaryChoice: false,
        requiresVacancy: false,
        fullLabelLink: "/api/labels/drione"
      },
      { 
        id: this.currentProductId++, 
        name: "KONK 407", 
        regNumber: "24875", 
        activeIngredient: "d-Phenothrin 0.5%", 
        applicationRate: "Spray for 5-10 seconds directly at wasp nests from a safe distance", 
        safetyPrecautions: [
          "DO NOT apply when people or pets are present",
          "Wear protective clothing, gloves, and eye protection",
          "Stand well back from the nest being treated"
        ],
        isPrimaryChoice: true,
        requiresVacancy: true,
        fullLabelLink: "/api/labels/konk-407"
      },
      { 
        id: this.currentProductId++, 
        name: "Contrac Blox", 
        regNumber: "22239", 
        activeIngredient: "Bromadiolone 0.005%", 
        applicationRate: "For rats: 3-10 blocks per placement at 5-10m intervals; For mice: 1-2 blocks at 2-4m intervals", 
        safetyPrecautions: [
          "KEEP OUT OF REACH OF CHILDREN, PETS AND NON-TARGET WILDLIFE",
          "Place in tamper-resistant bait stations",
          "Wash hands thoroughly after handling"
        ],
        isPrimaryChoice: true,
        requiresVacancy: false,
        fullLabelLink: "/api/labels/contrac-blox"
      },
      { 
        id: this.currentProductId++, 
        name: "Resolv Soft Bait", 
        regNumber: "31322", 
        activeIngredient: "Bromadiolone 0.005%", 
        applicationRate: "For mice: 1-2 sachets at 2-4m intervals; For rats: 4-12 sachets at 5-10m intervals", 
        safetyPrecautions: [
          "KEEP OUT OF REACH OF CHILDREN, PETS AND NON-TARGET WILDLIFE",
          "Place bait in locations inaccessible to children, pets, and non-target wildlife",
          "Wear gloves when handling"
        ],
        isPrimaryChoice: false,
        requiresVacancy: false,
        fullLabelLink: "/api/labels/resolv-soft-bait"
      }
    ];
    
    productsData.forEach(product => {
      this.products.set(product.id, product);
    });
    
    // Add product recommendations
    const recommendations = [
      // Ants Interior
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 1, // Ants
        productId: 1, // SECLIRA WSG
        location: "interior",
        advice: "For ant infestations, target areas where ants are seen trailing. Apply SECLIRA WSG as a crack and crevice or spot treatment to areas inaccessible to children and pets."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 1, // Ants
        productId: 2, // Greenway Ant & Roach Bait Gel
        location: "interior",
        advice: "Apply small drops of gel in areas where ants are seen. Focus on cracks, crevices, and along ant trails. Effective when customers cannot vacate."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 1, // Ants
        productId: 3, // Maxforce Quantum Ant Bait
        location: "interior",
        advice: "Apply small droplets near ant trails, entry points, and in cracks and crevices. Product is slow-acting, allowing ants to return to the colony and share the bait."
      },
      
      // Ants Exterior
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 1, // Ants
        productId: 4, // Suspend Polyzone
        location: "exterior",
        advice: "Apply as a barrier treatment around the perimeter of structures. Spray to a height of 2-3 feet on the foundation and extend outward 2-3 feet."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 1, // Ants
        productId: 5, // Temprid SC
        location: "exterior",
        advice: "Use as an alternative to Suspend Polyzone for exterior perimeter treatments. Apply to foundation up to 3 feet and extend outward 2-10 feet."
      },
      
      // Spiders Interior
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 2, // Spiders
        productId: 1, // SECLIRA WSG
        location: "interior",
        advice: "Apply to areas where spiders are active or nesting including corners, closets, behind furniture, and undisturbed areas."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 2, // Spiders
        productId: 6, // Drione Insecticide Dust
        location: "interior",
        advice: "Apply in voids, cracks and crevices where spiders may hide. Effective for controlling spiders when customers cannot vacate."
      },
      
      // Spiders Exterior
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 2, // Spiders
        productId: 4, // Suspend Polyzone
        location: "exterior",
        advice: "Apply to eaves, around windows and doors, and other areas where spiders build webs. Remove webs before application for best results."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 2, // Spiders
        productId: 5, // Temprid SC
        location: "exterior",
        advice: "Apply to exterior surfaces where spiders are present. Focus on protected areas like eaves, window frames, and doorways."
      },
      
      // Wasps
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 3, // Wasps
        productId: 7, // KONK 407
        location: "exterior",
        advice: "For active nests, spray directly at the nest entrance from a safe distance. Apply in the evening when wasps are less active."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 3, // Wasps
        productId: 6, // Drione Insecticide Dust
        location: "exterior",
        advice: "For preventative treatment, apply dust in voids, cracks and crevices where wasps may nest, particularly under eaves and in wall voids."
      },
      
      // Stinkbugs
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 4, // Stinkbugs
        productId: 1, // SECLIRA WSG
        location: "interior",
        advice: "Apply as a spot treatment around doors, windows, and other entry points. Focus on cracks and crevices where stink bugs may enter."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 4, // Stinkbugs
        productId: 1, // SECLIRA WSG
        location: "exterior",
        advice: "Apply spot treatments around windows, doors, and other entry points. Also treat external cracks and crevices."
      },
      
      // Rodents
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 5, // Rodents
        productId: 8, // Contrac Blox
        location: "exterior",
        advice: "Place in tamper-resistant bait stations around the perimeter of the structure. Place stations 5-10m apart for rats and 2-4m for mice."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 5, // Rodents
        productId: 9, // Resolv Soft Bait
        location: "interior",
        advice: "Place in tamper-resistant bait stations in areas with rodent activity, focusing on travel paths, nesting sites, and entry points."
      },
      {
        id: this.currentRecommendationId++,
        pestCategoryId: 5, // Rodents
        productId: 8, // Contrac Blox
        location: "interior",
        advice: "Place in tamper-resistant bait stations indoors where rodent activity is observed. Secure stations to prevent movement."
      }
    ];
    
    recommendations.forEach(recommendation => {
      this.pestProductRecommendations.set(recommendation.id, recommendation);
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByTechId(techId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.techId === techId,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const timestamp = new Date().toISOString();
    
    const user: User = { 
      ...insertUser, 
      id,
      location: {},
      inventory: {},
      settings: {
        darkMode: false,
        brightness: 100,
        safetyAlerts: true,
        ppeReminders: true,
        textSize: 16
      },
      lastActive: timestamp
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async authenticateUser(techId: string, pin: string): Promise<User | null> {
    const user = await this.getUserByTechId(techId);
    if (!user || user.pin !== pin) {
      return null;
    }
    
    // Update last active timestamp
    const updatedUser = { 
      ...user, 
      lastActive: new Date().toISOString() 
    };
    this.users.set(user.id, updatedUser);
    
    return updatedUser;
  }
  
  async updateUserLocation(userId: number, latitude: number, longitude: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      location: { latitude, longitude },
      lastActive: new Date().toISOString()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserInventory(userId: number, productId: number, quantity: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    const inventory = { ...user.inventory as Record<string, number> };
    inventory[productId.toString()] = quantity;
    
    const updatedUser = {
      ...user,
      inventory,
      lastActive: new Date().toISOString()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedSettings = {
      ...user.settings as UserSettings,
      ...settings
    };
    
    const updatedUser = {
      ...user,
      settings: updatedSettings,
      lastActive: new Date().toISOString()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUsersWithProductInInventory(productId: number): Promise<User[]> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    return Array.from(this.users.values()).filter(user => {
      const inventory = user.inventory as Record<string, number>;
      return inventory[productId.toString()] && inventory[productId.toString()] > 0;
    });
  }
  
  // Calculate distance between two points in kilometers using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  async getNearbyTechnicians(productId: number, latitude: number, longitude: number, radiusKm: number): Promise<User[]> {
    const techsWithProduct = await this.getUsersWithProductInInventory(productId);
    
    return techsWithProduct.filter(user => {
      const userLocation = user.location as { latitude?: number; longitude?: number };
      if (!userLocation.latitude || !userLocation.longitude) {
        return false;
      }
      
      const distance = this.calculateDistance(
        latitude,
        longitude,
        userLocation.latitude,
        userLocation.longitude
      );
      
      return distance <= radiusKm;
    });
  }
  
  // Products methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  // Pest Categories methods
  async getAllPestCategories(): Promise<PestCategory[]> {
    return Array.from(this.pestCategories.values());
  }
  
  async getPestCategoryById(id: number): Promise<PestCategory | undefined> {
    return this.pestCategories.get(id);
  }
  
  async getPestCategoryByName(name: string): Promise<PestCategory | undefined> {
    return Array.from(this.pestCategories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  // Product Recommendations methods
  async getRecommendationsByPestAndLocation(pestName: string, location: string): Promise<(Product & { advice?: string })[]> {
    const pestCategory = await this.getPestCategoryByName(pestName);
    if (!pestCategory) return [];
    
    const recommendations = Array.from(this.pestProductRecommendations.values())
      .filter(rec => rec.pestCategoryId === pestCategory.id && rec.location === location);
    
    const result = await Promise.all(recommendations.map(async rec => {
      const product = await this.getProductById(rec.productId);
      if (!product) return null;
      return {
        ...product,
        advice: rec.advice
      };
    }));
    
    return result.filter((item): item is (Product & { advice?: string }) => item !== null);
  }
  
  // Search History methods
  async addSearchQuery(query: string): Promise<SearchHistoryItem> {
    const id = this.currentSearchHistoryId++;
    const timestamp = new Date().toISOString();
    const searchItem: SearchHistoryItem = { id, query, timestamp };
    this.searchHistoryItems.set(id, searchItem);
    return searchItem;
  }
  
  async getRecentSearches(limit: number): Promise<SearchHistoryItem[]> {
    return Array.from(this.searchHistoryItems.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
