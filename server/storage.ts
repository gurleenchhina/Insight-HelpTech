import { Product, PestCategory, Recommendation } from "@shared/schema";

export class Storage {
  private products: Product[] = [];
  private pestCategories: PestCategory[] = [];
  private recommendations: Recommendation[] = [];
  private currentProductId = 1;
  private currentCategoryId = 1;
  private currentRecommendationId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data (Expanding on edited code's sample data)
    this.pestCategories = [
      { id: this.currentCategoryId++, name: "Ants", imageUrl: "/ants.jpg" },
      { id: this.currentCategoryId++, name: "Spiders", imageUrl: "/spiders.jpg" },
      { id: this.currentCategoryId++, name: "Wasps", imageUrl: "/wasps.jpg" },
      { id: this.currentCategoryId++, name: "Stinkbugs", imageUrl: "/stinkbugs.jpg" },
      { id: this.currentCategoryId++, name: "Rodents", imageUrl: "/rodents.jpg" },
    ];

    //Adding some sample products (mimicking original structure but simplified)
    this.products = [
        {id: this.currentProductId++, name: "Product 1", regNumber: "123", activeIngredient: "Ingredient A", applicationRate: "Rate A", safetyPrecautions: ["Safety 1", "Safety 2"], isPrimaryChoice: true, requiresVacancy: true, fullLabelLink: "/label1"},
        {id: this.currentProductId++, name: "Product 2", regNumber: "456", activeIngredient: "Ingredient B", applicationRate: "Rate B", safetyPrecautions: ["Safety 3", "Safety 4"], isPrimaryChoice: false, requiresVacancy: false, fullLabelLink: "/label2"}
    ];

    //Adding sample recommendations (mimicking original structure but simplified)
    this.recommendations = [
        {id: this.currentRecommendationId++, pestType: "Ants", location: "interior", productId: 1, advice: "Advice 1"},
        {id: this.currentRecommendationId++, pestType: "Spiders", location: "exterior", productId: 2, advice: "Advice 2"}
    ];
  }

  getAllProducts(): Product[] {
    return this.products;
  }

  getAllPestCategories(): PestCategory[] {
    return this.pestCategories;
  }

  getRecommendationsByPestAndLocation(pest: string, location: string): Recommendation[] {
    return this.recommendations.filter(r => 
      r.pestType.toLowerCase() === pest.toLowerCase() && 
      r.location.toLowerCase() === location.toLowerCase()
    );
  }
}

export const storage = new Storage();