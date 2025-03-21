import { processTextSearch, processImageSearch as processOpenAIImageSearch } from './openai';

export interface AISearchResponse {
  recommendation: string;
  pestType: string;
  products: {
    primary?: string;
    alternative?: string;
  };
  applicationAdvice?: string;
}

/**
 * Process a search query using OpenAI
 */
export async function processAISearch(query: string): Promise<AISearchResponse> {
  return processTextSearch(query);
}

/**
 * Process an image search using OpenAI's vision capabilities
 */
export async function processImageSearch(base64Image: string): Promise<AISearchResponse> {
  return processOpenAIImageSearch(base64Image);
}
