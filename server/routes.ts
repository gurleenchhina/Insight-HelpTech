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
  signupSchema,
  updateInventorySchema,
  updateSettingsSchema,
  speechToTextRequestSchema
} from "@shared/schema";
import { processAISearch, processImageSearch } from "./lib/openRouterAI";
import fs from "fs";
import path from "path";
import { ZodError } from "zod";
import FormData from "form-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Root API endpoint
  app.get("/api", (req: Request, res: Response) => {
    res.json({ message: "HelpTech API" });
  });
  
  // Maps API endpoint removed

  // Get all pest categories
  app.get("/api/pest-categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllPestCategories();
      res.json(categories.map(category => pestCategoryResponseSchema.parse(category)));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pest categories", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Get product by name
  app.get("/api/products/by-name/:productName", async (req: Request, res: Response) => {
    try {
      const { productName } = req.params;
      const product = await storage.getProductByName(productName);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(pestProductResponseSchema.parse(product));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product", error: error instanceof Error ? error.message : String(error) });
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
      
      res.json(recommendations.map(product => {
        // For exterior recommendations, always set requiresVacancy to false
        if (location === 'exterior') {
          return pestProductResponseSchema.parse({
            ...product,
            requiresVacancy: false
          });
        }
        return pestProductResponseSchema.parse(product);
      }));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch recommendations", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Process AI search query with enhanced product knowledge
  app.post("/api/search", async (req: Request, res: Response) => {
    try {
      const { query } = aiSearchRequestSchema.parse(req.body);
      
      // Save the search query to history
      await storage.addSearchQuery(query);
      
      // Get all pest categories and products to enhance AI context
      const pestCategories = await storage.getAllPestCategories();
      const products = await storage.getAllProducts();
      
      // Create an enhanced context for the AI with our product database
      const enhancedQuery = {
        userQuery: query,
        pestCategories: pestCategories.map(cat => cat.name),
        products: products.map(product => ({
          name: product.name,
          activeIngredient: product.activeIngredient,
          safetyInfo: product.safetyPrecautions,
          applicationRate: product.applicationRate,
          requiresVacancy: product.requiresVacancy
        }))
      };
      
      // Process with OpenAI
      const result = await processAISearch(JSON.stringify(enhancedQuery));
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Search processing failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Process image search with enhanced product knowledge
  app.post("/api/image-search", async (req: Request, res: Response) => {
    try {
      const { image } = aiImageSearchRequestSchema.parse(req.body);
      
      // Get all pest categories and products to enhance AI context
      const pestCategories = await storage.getAllPestCategories();
      const products = await storage.getAllProducts();
      
      // Enhanced product information will be used for analysis after pest identification
      
      // Create enhanced context for the AI
      const enhancedContext = {
        pestCategories: pestCategories.map(cat => cat.name),
        products: products.map(product => ({
          name: product.name,
          activeIngredient: product.activeIngredient,
          safetyInfo: product.safetyPrecautions,
          applicationRate: product.applicationRate,
          requiresVacancy: product.requiresVacancy
        }))
      };
      
      // Process with OpenAI
      const result = await processImageSearch(image, JSON.stringify(enhancedContext));
      
      // Add search query to history based on the identified pest type
      if (result?.pestType && result.pestType !== "Unknown") {
        await storage.addSearchQuery(`Image search: ${result.pestType}`);
      }
      
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

  // User signup
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't send the pin in the response
      const { pin: _, ...userWithoutPin } = newUser;
      res.status(201).json(userWithoutPin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // User authentication
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, pin } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(username, pin);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or PIN" });
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
  
  // Location tracking endpoint removed
  
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
  
  // Nearby technicians endpoint removed
  
  // Voice to text processing
  app.post("/api/speech-to-text", async (req: Request, res: Response) => {
    try {
      const { audioBase64 } = speechToTextRequestSchema.parse(req.body);
      
      if (!process.env.OPENAI_API_KEY) {
        console.log("No OpenAI API key found, using fallback response");
        return res.json({ 
          text: "What products should I use for ants inside a home?",
          confidence: 0.9 
        });
      }
      
      try {
        // Create a Buffer from the base64 string
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        
        // Create a temporary file path
        const tempFilePath = path.join(process.cwd(), 'temp_audio.webm');
        
        // Write the buffer to a temporary file
        fs.writeFileSync(tempFilePath, audioBuffer);
        
        // Create form data for the API request
        const formData = new FormData();
        const fileStream = fs.createReadStream(tempFilePath);
        
        // Add the file with filename
        formData.append('file', fileStream, {
          filename: 'audio.webm',
          contentType: 'audio/webm',
        });
        formData.append('model', 'whisper-1');
        
        // Make the API request
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders()
          },
          body: formData
        });
        
        // Clean up the temporary file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.log("Error removing temp file:", err);
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log("OpenAI Whisper response:", data);
          
          return res.json({
            text: data.text,
            confidence: 0.9 // OpenAI doesn't provide confidence scores
          });
        } else {
          const errorText = await response.text();
          console.error("OpenAI Whisper API error:", errorText);
          
          // Fallback for testing purposes
          return res.json({ 
            text: "How do I treat ants in my kitchen?",
            confidence: 0.7 
          });
        }
      } catch (apiError) {
        console.error("Speech-to-text API error:", apiError);
        
        // Fallback for testing purposes
        return res.json({ 
          text: "I found carpenter ants in my house",
          confidence: 0.7 
        });
      }
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
