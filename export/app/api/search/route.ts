import { NextResponse } from 'next/server';
import { processAISearch } from '@/lib/openRouterAI';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' }, 
        { status: 400 }
      );
    }
    
    // Save the search query to history
    await db.addSearchQuery(query);
    
    // Get all pest categories and products to enhance AI context
    const pestCategories = await db.getAllPestCategories();
    const products = await db.getAllProducts();
    
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
    
    // Process with DeepSeek through OpenRouter
    const result = await processAISearch(JSON.stringify(enhancedQuery));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search processing failed:', error);
    return NextResponse.json(
      { error: 'Failed to process search' }, 
      { status: 500 }
    );
  }
}