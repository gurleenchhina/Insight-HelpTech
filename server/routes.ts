import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  recommendationsRequestSchema, 
  aiSearchRequestSchema, 
  aiImageSearchRequestSchema,
  pestProductResponseSchema, 
  pestCategoryResponseSchema
} from "@shared/schema";
import { processAISearch, processImageSearch } from "./lib/deepseekAI";
import fs from "fs";
import path from "path";
import { ZodError } from "zod";
import pdf from 'pdf-parse';


async function getAllLabelsContent() {
    try {
        const labelsDir = path.join(process.cwd(), 'attached_assets');
        const labelFiles = fs.readdirSync(labelsDir).filter(file => path.extname(file) === '.pdf');
        const labelContent = await Promise.all(labelFiles.map(async (file) => {
            try {
                const filePath = path.join(labelsDir, file);
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                return data.text;
            } catch (error) {
                console.error(`Error reading PDF file ${file}:`, error);
                return '';
            }
        }));
        return labelContent.filter(text => text !== '').join(' ');
    } catch (error) {
        console.error('Error reading label content:', error);
        return '';
    }
}

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

      // Process with DeepSeek AI
      const labelInfo = await getAllLabelsContent();
      const result = await processAISearch(query, labelInfo);
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

      // Process with DeepSeek AI
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