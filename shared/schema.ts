import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  techId: text("tech_id").notNull().unique(), // 4-digit ID
  pin: text("pin").notNull(), // 4-digit PIN 
  username: text("username").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  location: json("location").default({}).notNull(), // GPS coordinates
  inventory: json("inventory").default({}).notNull(), // Product inventory
  settings: json("settings").default({
    darkMode: false,
    brightness: 100,
    safetyAlerts: true,
    ppeReminders: true,
    textSize: 16
  }).notNull(), // User settings
  lastActive: text("last_active"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  techId: true,
  pin: true,
  username: true,
  firstName: true,
  lastName: true,
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regNumber: text("reg_number").notNull(),
  activeIngredient: text("active_ingredient").notNull(),
  applicationRate: text("application_rate").notNull(),
  safetyPrecautions: text("safety_precautions").notNull().array(),
  isPrimaryChoice: boolean("is_primary_choice").default(false),
  requiresVacancy: boolean("requires_vacancy").default(false),
  fullLabelLink: text("full_label_link"),
});

export const pestCategories = pgTable("pest_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
});

export const pestProductRecommendations = pgTable("pest_product_recommendations", {
  id: serial("id").primaryKey(),
  pestCategoryId: integer("pest_category_id").notNull(),
  productId: integer("product_id").notNull(),
  location: text("location").notNull(), // 'interior' or 'exterior'
  advice: text("advice"),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const pestProductResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  regNumber: z.string(),
  activeIngredient: z.string(),
  applicationRate: z.string(),
  safetyPrecautions: z.array(z.string()),
  isPrimaryChoice: z.boolean(),
  requiresVacancy: z.boolean(),
  fullLabelLink: z.string().optional(),
  advice: z.string().optional(),
});

export const pestCategoryResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z.string().optional(),
});

export const recommendationsRequestSchema = z.object({
  pestCategory: z.string(),
  location: z.string(),
});

export const aiSearchRequestSchema = z.object({
  query: z.string(),
});

export const aiImageSearchRequestSchema = z.object({
  image: z.string(), // base64 encoded image
});

// Auth schemas
export const loginSchema = z.object({
  techId: z.string().length(4, "Tech ID must be exactly 4 digits"),
  pin: z.string().length(4, "PIN must be exactly 4 digits")
});

export const updateLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const updateInventorySchema = z.object({
  productId: z.number(),
  quantity: z.number().int().min(0),
});

export const updateSettingsSchema = z.object({
  darkMode: z.boolean().optional(),
  brightness: z.number().min(0).max(100).optional(),
  safetyAlerts: z.boolean().optional(),
  ppeReminders: z.boolean().optional(),
  textSize: z.number().optional(),
});

export const nearbyTechRequestSchema = z.object({
  productId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number().default(10),
});

export const speechToTextRequestSchema = z.object({
  audioBase64: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PestCategory = typeof pestCategories.$inferSelect;
export type PestProductRecommendation = typeof pestProductRecommendations.$inferSelect;
export type SearchHistoryItem = typeof searchHistory.$inferSelect;
export type PestProductResponse = z.infer<typeof pestProductResponseSchema>;
export type PestCategoryResponse = z.infer<typeof pestCategoryResponseSchema>;
export type RecommendationsRequest = z.infer<typeof recommendationsRequestSchema>;
export type AISearchRequest = z.infer<typeof aiSearchRequestSchema>;
export type AIImageSearchRequest = z.infer<typeof aiImageSearchRequestSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateLocationRequest = z.infer<typeof updateLocationSchema>;
export type UpdateInventoryRequest = z.infer<typeof updateInventorySchema>;
export type UpdateSettingsRequest = z.infer<typeof updateSettingsSchema>;
export type NearbyTechRequest = z.infer<typeof nearbyTechRequestSchema>;
export type SpeechToTextRequest = z.infer<typeof speechToTextRequestSchema>;
