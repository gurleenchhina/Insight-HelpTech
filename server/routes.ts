import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  recommendationsRequestSchema, 
  aiSearchRequestSchema, 
  aiImageSearchRequestSchema,
  pestProductResponseSchema, 
  pestCategoryResponseSchema,
  loginSchema,
  updateLocationSchema,
  updateInventorySchema,
  updateSettingsSchema,
  nearbyTechRequestSchema,
  speechToTextRequestSchema
} from "@shared/schema";
import { processTextSearch, processImageSearch } from "./lib/openai";
import fs from "fs";
import path from "path";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Root API endpoint
  app.get("/api", (req: Request, res: Response) => {
    res.json({ message: "HelpTech API" });
  });

  // Get all pest categories
  app.get("/api/pest-categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllPestCategories();
      res.json(categories.map(category => pestCategoryResponseSchema.parse(category)));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pest categories", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get product recommendations by pest and location
  app.post("/api/recommendations", async (req: Request, res: Response) => {
    try {
      const { pestCategory, location } = recommendationsRequestSchema.parse(req.body);
      const recommendations = await storage.getRecommendationsByPestAndLocation(pestCategory, location);
      
      if (recommendations.length === 0) {
        return res.status(404).json({ message: "No recommendations found for the specified pest and location" });
      }
      
      res.json(recommendations.map(product => pestProductResponseSchema.parse(product)));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch recommendations", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Process AI search query
  app.post("/api/search", async (req: Request, res: Response) => {
    try {
      const { query } = aiSearchRequestSchema.parse(req.body);
      
      // Save the search query to history
      await storage.addSearchQuery(query);
      
      // Process with OpenAI
      const result = await processTextSearch(query);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Search processing failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Process image search
  app.post("/api/image-search", async (req: Request, res: Response) => {
    try {
      const { image } = aiImageSearchRequestSchema.parse(req.body);
      
      // Process with OpenAI
      const result = await processImageSearch(image);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Image search processing failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get recent searches
  app.get("/api/recent-searches", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const searches = await storage.getRecentSearches(limit);
      res.json(searches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent searches", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // User authentication
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { techId, pin } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(techId, pin);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid tech ID or PIN" });
      }
      
      // Don't send the pin in the response
      const { pin: _, ...userWithoutPin } = user;
      res.json(userWithoutPin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Authentication failed", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Update user location
  app.post("/api/user/:userId/location", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { latitude, longitude } = updateLocationSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserLocation(userId, latitude, longitude);
      
      // Don't send the pin in the response
      const { pin: _, ...userWithoutPin } = updatedUser;
      res.json(userWithoutPin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Update user inventory
  app.post("/api/user/:userId/inventory", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { productId, quantity } = updateInventorySchema.parse(req.body);
      
      const updatedUser = await storage.updateUserInventory(userId, productId, quantity);
      
      // Don't send the pin in the response
      const { pin: _, ...userWithoutPin } = updatedUser;
      res.json(userWithoutPin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Update user settings
  app.post("/api/user/:userId/settings", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = updateSettingsSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserSettings(userId, settings);
      
      // Don't send the pin in the response
      const { pin: _, ...userWithoutPin } = updatedUser;
      res.json(userWithoutPin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Get nearby technicians with product
  app.post("/api/nearby-technicians", async (req: Request, res: Response) => {
    try {
      const { productId, latitude, longitude, radiusKm } = nearbyTechRequestSchema.parse(req.body);
      
      const techs = await storage.getNearbyTechnicians(productId, latitude, longitude, radiusKm);
      
      // Don't send the pin in the response
      const techsWithoutPin = techs.map(tech => {
        const { pin: _, ...techWithoutPin } = tech;
        return techWithoutPin;
      });
      
      res.json(techsWithoutPin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to find nearby technicians", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Voice to text processing
  app.post("/api/speech-to-text", async (req: Request, res: Response) => {
    try {
      const { audioBase64 } = speechToTextRequestSchema.parse(req.body);
      
      // For now, we'll just return a mock response
      // In a real implementation, we would use an appropriate speech-to-text API
      setTimeout(() => {
        res.json({ text: "What products should I use for ants inside a home?" });
      }, 500);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Speech to text processing failed", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Serve product labels
  app.get("/api/labels/:product", (req: Request, res: Response) => {
    const product = req.params.product;
    let filePath = "";
    
    switch(product) {
      case "seclira":
        res.setHeader('Content-Type', 'application/pdf');
        filePath = path.join(process.cwd(), 'attached_assets', 'Seclira WSG Label.pdf');
        break;
      case "suspend-polyzone":
        res.setHeader('Content-Type', 'application/pdf');
        filePath = path.join(process.cwd(), 'attached_assets', 'Suspend Polyzone Label.pdf');
        break;
      case "temprid-sc":
        res.setHeader('Content-Type', 'application/pdf');
        filePath = path.join(process.cwd(), 'attached_assets', 'Temprid SC Label.pdf');
        break;
      default:
        return res.status(404).json({ message: "Label not found" });
    }
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ message: "Label file not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
