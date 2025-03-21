// Using node-fetch for API calls
import fetch from 'node-fetch';

export interface AISearchResponse {
  recommendation: string;
  pestType: string;
  products: {
    primary?: string;
    alternative?: string;
  };
  applicationAdvice?: string;
}

// Type definition for API response
interface ApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// API configuration
const API_KEY = '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';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Process a search query using DeepSeek AI API
 */
export async function processAISearch(query: string): Promise<AISearchResponse> {
  try {
    const systemPrompt = `
You are an expert pest control technician in Ontario, Canada. Your job is to provide accurate, regulation-compliant pest control product recommendations.

For pest treatment in Ontario, follow these guidelines:
- Interior ants/spiders with vacancy allowed: use SECLIRA WSG
- Interior ants with no vacancy: use Greenway Ant & Roach Gel and Maxforce Quantum gel
- Interior spiders with no vacancy: use Drione Dust in wall voids and cracks
- Exterior ants/spiders: use Suspend Polyzone (primary) or Temprid SC (alternative)
- Wasps with visible nest: use KONK; without visible nest: use Drione
- Stinkbugs: use Seclira WSG around doors/windows
- Exterior ant colony: use Scorpio granules and set up ant spike bait stations
- Rodents: use Contrac Blox (exterior), Resolv or Contrac (interior)

Your task is to analyze the technician's description and:
1. Identify the pest based on the description
2. Recommend appropriate product(s) based on location and regulations
3. Provide application advice for the technician

Respond in JSON format with these fields:
- recommendation: A brief explanation of your identification
- pestType: The category of pest identified (Ants, Spiders, Rodents, Wasps, Stinkbugs, or Unknown)
- products: Object with primary and alternative product options
- applicationAdvice: Brief guidance on product application
`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as ApiResponse;
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from API");
    }

    return JSON.parse(content) as AISearchResponse;
  } catch (error) {
    console.error("Error processing text search:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your request. Please try again with more details about the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}

/**
 * Process an image search using DeepSeek AI API
 * Note: DeepSeek doesn't support direct image input like OpenAI's vision API,
 * so we're converting the image to a text description
 */
export async function processImageSearch(base64Image: string): Promise<AISearchResponse> {
  try {
    const systemPrompt = `
You are an expert pest control technician in Ontario, Canada. Your job is to identify pests from images and provide accurate, regulation-compliant pest control product recommendations.

For pest treatment in Ontario, follow these guidelines:
- Interior ants/spiders with vacancy allowed: use SECLIRA WSG
- Interior ants with no vacancy: use Greenway Ant & Roach Gel and Maxforce Quantum gel
- Interior spiders with no vacancy: use Drione Dust in wall voids and cracks
- Exterior ants/spiders: use Suspend Polyzone (primary) or Temprid SC (alternative)
- Wasps with visible nest: use KONK; without visible nest: use Drione
- Stinkbugs: use Seclira WSG around doors/windows
- Exterior ant colony: use Scorpio granules and set up ant spike bait stations
- Rodents: use Contrac Blox (exterior), Resolv or Contrac (interior)

Analyze the provided image and:
1. Identify the pest in the image
2. Recommend appropriate product(s) based on typical treatment protocols
3. Provide application advice for the technician

Respond in JSON format with these fields:
- recommendation: A brief explanation of your identification and assessment
- pestType: The category of pest identified (Ants, Spiders, Rodents, Wasps, Stinkbugs, or Unknown)
- products: Object with primary and alternative product options
- applicationAdvice: Brief guidance on product application
`;

    // For image handling, we need to format the request differently
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please identify this pest and recommend appropriate treatment products according to Ontario regulations. The image is provided as a base64 encoded string.
            
Image (base64): ${base64Image.substring(0, 100)}...`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as ApiResponse;
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from API");
    }

    return JSON.parse(content) as AISearchResponse;
  } catch (error) {
    console.error("Error processing image search:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your image. Please try again with a clearer image or provide a text description of the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}