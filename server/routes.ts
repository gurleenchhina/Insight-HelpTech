
import express from "express";
import path from "path";
import fs from "fs";
import pdf from "pdf-parse";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = new Storage();

export async function registerRoutes(app: express.Express) {
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.get("/api/products", (_req, res) => {
    res.json(storage.getAllProducts());
  });

  app.get("/api/categories", (_req, res) => {
    res.json(storage.getAllPestCategories());
  });

  app.get("/api/recommendations", (_req, res) => {
    res.json(storage.getAllRecommendations());
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
