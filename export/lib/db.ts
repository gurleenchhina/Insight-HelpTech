// This is a simple mock database adapter for the Next.js export
// In a production environment, this would connect to a real database

export interface Product {
  id: number;
  name: string;
  activeIngredient: string;
  applicationRate: string;
  safetyPrecautions: string;
  requiresVacancy: boolean;
  dilutionRate: string;
  category: string;
}

export interface PestCategory {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface SearchHistoryItem {
  id: number;
  query: string;
  timestamp: string;
}

class Database {
  private products: Product[] = [
    {
      id: 1,
      name: "Seclira WSG",
      activeIngredient: "Dinotefuran",
      applicationRate: "10-30g per liter of water",
      safetyPrecautions: "Wear gloves and mask when applying. Keep pets and children away until dry.",
      requiresVacancy: false,
      dilutionRate: "10-30g per liter of water",
      category: "Interior Spray"
    },
    {
      id: 2,
      name: "Suspend Polyzone",
      activeIngredient: "Deltamethrin",
      applicationRate: "10-20ml per liter of water",
      safetyPrecautions: "Avoid skin contact. Keep out of waterways.",
      requiresVacancy: false,
      dilutionRate: "10-20ml per liter of water",
      category: "Exterior Spray"
    },
    {
      id: 3,
      name: "Temprid SC",
      activeIngredient: "Imidacloprid + Beta-Cyfluthrin",
      applicationRate: "5-10ml per liter of water",
      safetyPrecautions: "Avoid skin contact. Use in well-ventilated areas.",
      requiresVacancy: false,
      dilutionRate: "5-10ml per liter of water",
      category: "Exterior Spray"
    },
    {
      id: 4,
      name: "Greenway Ant Roach Gel",
      activeIngredient: "Dinotefuran",
      applicationRate: "Small pea-sized drops every 10-12 inches",
      safetyPrecautions: "Apply out of reach of children and pets.",
      requiresVacancy: false,
      dilutionRate: "Ready to use",
      category: "Gel Bait"
    },
    {
      id: 5,
      name: "Maxforce Quantum",
      activeIngredient: "Imidacloprid",
      applicationRate: "Small drops in areas of ant activity",
      safetyPrecautions: "Apply away from food preparation surfaces.",
      requiresVacancy: false,
      dilutionRate: "Ready to use",
      category: "Gel Bait"
    },
    {
      id: 6,
      name: "Drione",
      activeIngredient: "Pyrethrins + Silica Gel",
      applicationRate: "Light dusting in cracks and crevices",
      safetyPrecautions: "Avoid inhalation. Wear mask when applying.",
      requiresVacancy: false,
      dilutionRate: "Ready to use",
      category: "Dust"
    },
    {
      id: 7,
      name: "KONK",
      activeIngredient: "Pyrethrins",
      applicationRate: "5-10 second spray for visible nests",
      safetyPrecautions: "Use with adequate ventilation. Evacuate area during application.",
      requiresVacancy: true,
      dilutionRate: "Ready to use",
      category: "Aerosol"
    },
    {
      id: 8,
      name: "Demand CS",
      activeIngredient: "Lambda-cyhalothrin",
      applicationRate: "5-10ml per liter of water",
      safetyPrecautions: "Avoid skin contact. Keep out of waterways.",
      requiresVacancy: false,
      dilutionRate: "5-10ml per liter of water",
      category: "Exterior Spray"
    },
    {
      id: 9,
      name: "Contrac Blox",
      activeIngredient: "Bromadiolone",
      applicationRate: "1-2 blocks per bait station",
      safetyPrecautions: "Must be used in tamper-resistant bait stations. Keep away from children and non-target animals.",
      requiresVacancy: false,
      dilutionRate: "Ready to use",
      category: "Rodenticide"
    },
    {
      id: 10,
      name: "Resolv",
      activeIngredient: "Bromadiolone",
      applicationRate: "1-2 blocks per bait station",
      safetyPrecautions: "For indoor use in tamper-resistant bait stations only.",
      requiresVacancy: false,
      dilutionRate: "Ready to use",
      category: "Rodenticide"
    },
    {
      id: 11,
      name: "Scorpio Ant Bait",
      activeIngredient: "Spinosad",
      applicationRate: "3-6g per square meter",
      safetyPrecautions: "Apply in dry conditions. Reapply after heavy rain.",
      requiresVacancy: false,
      dilutionRate: "Ready to use",
      category: "Granular Bait"
    }
  ];

  private pestCategories: PestCategory[] = [
    {
      id: 1,
      name: "Ants",
      description: "Common household pest that can infest kitchens and food storage areas.",
      imageUrl: "/images/ants.jpg"
    },
    {
      id: 2,
      name: "Spiders",
      description: "Eight-legged arthropods that may establish webs in homes.",
      imageUrl: "/images/spiders.jpg"
    },
    {
      id: 3,
      name: "Wasps",
      description: "Flying insects that can establish nests in and around structures.",
      imageUrl: "/images/wasps.jpg"
    },
    {
      id: 4,
      name: "Rodents",
      description: "Includes mice and rats that can damage property and spread disease.",
      imageUrl: "/images/rodents.jpg"
    },
    {
      id: 5,
      name: "Cockroaches",
      description: "Resilient insects that thrive in warm, humid environments.",
      imageUrl: "/images/cockroaches.jpg"
    },
    {
      id: 6,
      name: "Bed Bugs",
      description: "Small, parasitic insects that feed on human blood.",
      imageUrl: "/images/bedbugs.jpg"
    },
    {
      id: 7,
      name: "Stink Bugs",
      description: "Shield-shaped insects that release an unpleasant odor when disturbed.",
      imageUrl: "/images/stinkbugs.jpg"
    },
    {
      id: 8,
      name: "Centipedes",
      description: "Many-legged arthropods that prefer damp environments.",
      imageUrl: "/images/centipedes.jpg"
    }
  ];

  private searchHistory: SearchHistoryItem[] = [
    {
      id: 1,
      query: "How to treat ants in kitchen",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      query: "Wasp nest in attic",
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 3,
      query: "Spiders around windows",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  private currentSearchId = 4;

  async getAllProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.find(product => product.id === id);
  }

  async getProductByName(name: string): Promise<Product | undefined> {
    return this.products.find(product => 
      product.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getAllPestCategories(): Promise<PestCategory[]> {
    return [...this.pestCategories];
  }

  async getPestCategoryById(id: number): Promise<PestCategory | undefined> {
    return this.pestCategories.find(category => category.id === id);
  }

  async getPestCategoryByName(name: string): Promise<PestCategory | undefined> {
    return this.pestCategories.find(category => 
      category.name.toLowerCase() === name.toLowerCase()
    );
  }

  async addSearchQuery(query: string): Promise<SearchHistoryItem> {
    const id = this.currentSearchId++;
    const timestamp = new Date().toISOString();
    
    const searchItem: SearchHistoryItem = { id, query, timestamp };
    this.searchHistory.unshift(searchItem);
    
    // Keep only the last 10 searches
    if (this.searchHistory.length > 10) {
      this.searchHistory.pop();
    }
    
    return searchItem;
  }

  async getRecentSearches(limit: number = 5): Promise<SearchHistoryItem[]> {
    return this.searchHistory.slice(0, limit);
  }
}

export const db = new Database();