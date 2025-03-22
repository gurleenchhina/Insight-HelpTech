
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function registerRoutes(app: express.Express) {
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.get("/api/products", (_req, res) => {
    try {
      const products = storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get("/api/categories", (_req, res) => {
    try {
      const categories = storage.getAllPestCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get("/api/recommendations", (req, res) => {
    try {
      const { pest, location } = req.query;
      if (!pest || !location) {
        return res.status(400).json({ error: 'Missing pest or location parameter' });
      }
      const recommendations = storage.getRecommendationsByPestAndLocation(pest.toString(), location.toString());
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  app.get("/api/labels/:name", (req, res) => {
    const labelsDir = path.join(process.cwd(), 'attached_assets');
    const files = fs.readdirSync(labelsDir);
    const pdfFile = files.find(f => f.toLowerCase().includes(req.params.name.toLowerCase()));
    
    if (pdfFile) {
      res.sendFile(path.join(labelsDir, pdfFile));
    } else {
      res.status(404).send('Label not found');
    }
  });

  return server;
}
