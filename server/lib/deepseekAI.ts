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

// API configuration for OpenRouter
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Additional headers required by OpenRouter
const SITE_URL = 'https://helptech.replit.app';
const SITE_NAME = 'HelpTech Pest Control';

/**
 * Process a text search query using DeepSeek AI through OpenRouter
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
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-zero:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ]
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

    try {
      // Clean up the content by removing LaTeX-style formatting and other symbols
      let cleanedContent = content;
      
      // Remove LaTeX box formatting
      cleanedContent = cleanedContent.replace(/\\boxed\s*\{\s*/g, '');
      cleanedContent = cleanedContent.replace(/\}\s*$/g, '');
      
      // Remove other unnecessary symbols/characters
      cleanedContent = cleanedContent.replace(/\\n/g, ' ');
      cleanedContent = cleanedContent.replace(/\\/g, '');
      cleanedContent = cleanedContent.replace(/`/g, '');
      
      // Attempt to parse the cleaned content
      const parsedResponse = JSON.parse(cleanedContent) as AISearchResponse;
      
      // Further clean up individual response fields
      if (parsedResponse.recommendation) {
        parsedResponse.recommendation = parsedResponse.recommendation
          .replace(/^\s*['"](.*)['"]\s*$/, '$1') // Remove quotes
          .replace(/[{}[\]]/g, '') // Remove brackets
          .trim();
      }
      
      if (parsedResponse.applicationAdvice) {
        parsedResponse.applicationAdvice = parsedResponse.applicationAdvice
          .replace(/^\s*['"](.*)['"]\s*$/, '$1') // Remove quotes
          .replace(/[{}[\]]/g, '') // Remove brackets
          .trim();
      }
      
      // Clean up product names if they exist
      if (parsedResponse.products) {
        if (parsedResponse.products.primary) {
          parsedResponse.products.primary = parsedResponse.products.primary
            .replace(/^\s*['"](.*)['"]\s*$/, '$1')
            .replace(/[{}[\]]/g, '')
            .trim();
        }
        
        if (parsedResponse.products.alternative) {
          parsedResponse.products.alternative = parsedResponse.products.alternative
            .replace(/^\s*['"](.*)['"]\s*$/, '$1')
            .replace(/[{}[\]]/g, '')
            .trim();
        }
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      
      // Clean up the raw content for a more readable non-JSON response
      let cleanedText = content
        .replace(/\\boxed\s*\{\s*/g, '')
        .replace(/\}\s*$/g, '')
        .replace(/\\n/g, ' ')
        .replace(/\\/g, '')
        .replace(/`/g, '')
        .replace(/[{}[\]]/g, '')
        .replace(/["']/g, '')
        .trim();
      
      // If response isn't proper JSON, create a simple response with the cleaned text
      return {
        recommendation: cleanedText,
        pestType: "Unknown",
        products: {}
      };
    }
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
 * Process an image search using DeepSeek AI through OpenRouter
 * Note: OpenRouter with DeepSeek might not have full multimodal capabilities like OpenAI
 */
export async function processImageSearch(base64Image: string): Promise<AISearchResponse> {
  try {
    const systemPrompt = `
You are an expert pest control technician in Ontario, Canada. Your job is to identify pests from descriptions and provide accurate, regulation-compliant pest control product recommendations.

For pest treatment in Ontario, follow these guidelines:
- Interior ants/spiders with vacancy allowed: use SECLIRA WSG
- Interior ants with no vacancy: use Greenway Ant & Roach Gel and Maxforce Quantum gel
- Interior spiders with no vacancy: use Drione Dust in wall voids and cracks
- Exterior ants/spiders: use Suspend Polyzone (primary) or Temprid SC (alternative)
- Wasps with visible nest: use KONK; without visible nest: use Drione
- Stinkbugs: use Seclira WSG around doors/windows
- Exterior ant colony: use Scorpio granules and set up ant spike bait stations
- Rodents: use Contrac Blox (exterior), Resolv or Contrac (interior)

Analyze the pest description and:
1. Identify the pest based on the provided description
2. Recommend appropriate product(s) based on typical treatment protocols
3. Provide application advice for the technician

Respond in JSON format with these fields:
- recommendation: A brief explanation of your identification and assessment
- pestType: The category of pest identified (Ants, Spiders, Rodents, Wasps, Stinkbugs, or Unknown)
- products: Object with primary and alternative product options
- applicationAdvice: Brief guidance on product application
`;

    // For image handling, we need to describe the image as text
    // Since the base64 string is too long to include directly, we'll extract some information about it
    const imageDescription = `The user has uploaded an image of what appears to be a pest. 
The image is in base64 format and starts with: ${base64Image.substring(0, 50)}...
Please identify what kind of pest this might be based on common pest control issues in Ontario.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-zero:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please identify this pest and recommend appropriate treatment products according to Ontario regulations. I found this pest in my home.

Image information: ${imageDescription}`
          }
        ]
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

    try {
      // Clean up the content by removing LaTeX-style formatting and other symbols
      let cleanedContent = content;
      
      // Remove LaTeX box formatting
      cleanedContent = cleanedContent.replace(/\\boxed\s*\{\s*/g, '');
      cleanedContent = cleanedContent.replace(/\}\s*$/g, '');
      
      // Remove other unnecessary symbols/characters
      cleanedContent = cleanedContent.replace(/\\n/g, ' ');
      cleanedContent = cleanedContent.replace(/\\/g, '');
      cleanedContent = cleanedContent.replace(/`/g, '');
      
      // Attempt to parse the cleaned content
      const parsedResponse = JSON.parse(cleanedContent) as AISearchResponse;
      
      // Further clean up individual response fields
      if (parsedResponse.recommendation) {
        parsedResponse.recommendation = parsedResponse.recommendation
          .replace(/^\s*['"](.*)['"]\s*$/, '$1') // Remove quotes
          .replace(/[{}[\]]/g, '') // Remove brackets
          .trim();
      }
      
      if (parsedResponse.applicationAdvice) {
        parsedResponse.applicationAdvice = parsedResponse.applicationAdvice
          .replace(/^\s*['"](.*)['"]\s*$/, '$1') // Remove quotes
          .replace(/[{}[\]]/g, '') // Remove brackets
          .trim();
      }
      
      // Clean up product names if they exist
      if (parsedResponse.products) {
        if (parsedResponse.products.primary) {
          parsedResponse.products.primary = parsedResponse.products.primary
            .replace(/^\s*['"](.*)['"]\s*$/, '$1')
            .replace(/[{}[\]]/g, '')
            .trim();
        }
        
        if (parsedResponse.products.alternative) {
          parsedResponse.products.alternative = parsedResponse.products.alternative
            .replace(/^\s*['"](.*)['"]\s*$/, '$1')
            .replace(/[{}[\]]/g, '')
            .trim();
        }
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      
      // Clean up the raw content for a more readable non-JSON response
      let cleanedText = content
        .replace(/\\boxed\s*\{\s*/g, '')
        .replace(/\}\s*$/g, '')
        .replace(/\\n/g, ' ')
        .replace(/\\/g, '')
        .replace(/`/g, '')
        .replace(/[{}[\]]/g, '')
        .replace(/["']/g, '')
        .trim();
      
      // If response isn't proper JSON, create a simple response with the cleaned text
      return {
        recommendation: cleanedText,
        pestType: "Unknown",
        products: {}
      };
    }
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