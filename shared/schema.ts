import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
