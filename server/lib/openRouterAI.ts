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

// API Constants
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "https://helptech.replit.app"; // Replace with your actual site URL
const SITE_NAME = "HelpTech Pest Control";
const MODEL = "deepseek/deepseek-r1-zero:free"; // Using DeepSeek model

/**
 * Process a text search query using DeepSeek AI through OpenRouter
 */
export async function processAISearch(queryData: string): Promise<AISearchResponse> {
  try {
    // Parse the enhanced query data
    let userQuery = queryData;
    let pestCategoriesData = [];
    let productsData = [];
    
    try {
      const parsedData = JSON.parse(queryData);
      userQuery = parsedData.userQuery || queryData;
      pestCategoriesData = parsedData.pestCategories || [];
      productsData = parsedData.products || [];
    } catch (e) {
      // If parsing fails, use the original query string
      console.log("Using original query string - not JSON formatted");
    }
    
    // Construct detailed product information for the AI
    const productInfoText = productsData.length > 0 
      ? `\nAvailable Products Information:\n${productsData.map((p: any) => 
        `- ${p.name}: Contains ${p.activeIngredient}. Application rate: ${p.applicationRate}. ${p.requiresVacancy ? 'Requires vacancy' : 'No vacancy required'}. Safety: ${p.safetyInfo?.join(', ') || 'Follow label instructions'}`
      ).join('\n')}`
      : '';
    
    // Construct pest categories list
    const pestCategoriesText = pestCategoriesData.length > 0
      ? `\nPest Categories in our system: ${pestCategoriesData.join(', ')}`
      : '';
      
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
${pestCategoriesText}
${productInfoText}

Your task is to analyze the technician's description and:
1. Identify the pest based on the description
2. Recommend appropriate product(s) based on location and regulations
3. Provide application advice for the technician

If the user asks about a product we have in our database, provide detailed information about it.
If the user asks about a pest treatment, recommend the most appropriate products from our inventory.

Respond in JSON format with these fields:
- recommendation: A brief explanation of your identification and reasoning
- pestType: The category of pest identified (Ants, Spiders, Rodents, Wasps, Stinkbugs, or Unknown)
- products: Object with primary and alternative product options
- applicationAdvice: Brief guidance on product application
`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Using the environment variable
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userQuery
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the response format
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    try {
      // Try to parse as JSON first
      return JSON.parse(content) as AISearchResponse;
    } catch (parseError) {
      // If not JSON, try to extract structured data from text response
      console.log("Response not in JSON format, attempting to extract structured data");
      
      // Create a simple structured response
      return {
        recommendation: content,
        pestType: extractPestType(content),
        products: extractProducts(content),
        applicationAdvice: extractAdvice(content)
      };
    }
  } catch (error) {
    console.error("Error processing AI search with OpenRouter:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your request. Please try again with more details about the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}

/**
 * Process image search using DeepSeek AI through OpenRouter
 * Note: OpenRouter with DeepSeek might not have full multimodal capabilities
 */
export async function processImageSearch(base64Image: string, enhancedContext: string = '{}'): Promise<AISearchResponse> {
  try {
    // Parse enhanced context if provided
    let pestCategoriesData = [];
    let productsData = [];
    
    try {
      const parsedData = JSON.parse(enhancedContext);
      pestCategoriesData = parsedData.pestCategories || [];
      productsData = parsedData.products || [];
    } catch (e) {
      console.log("Using default context - enhanced context parsing failed");
    }
    
    // Construct detailed product information for the AI
    const productInfoText = productsData.length > 0 
      ? `\nAvailable Products Information:\n${productsData.map((p: any) => 
        `- ${p.name}: Contains ${p.activeIngredient}. Application rate: ${p.applicationRate}. ${p.requiresVacancy ? 'Requires vacancy' : 'No vacancy required'}. Safety: ${p.safetyInfo?.join(', ') || 'Follow label instructions'}`
      ).join('\n')}`
      : '';
    
    // Construct pest categories list
    const pestCategoriesText = pestCategoriesData.length > 0
      ? `\nPest Categories in our system: ${pestCategoriesData.join(', ')}`
      : '';
  
    const systemPrompt = `
You are an expert pest control technician in Ontario, Canada. Your job is to identify pests and provide accurate, regulation-compliant pest control product recommendations.

For pest treatment in Ontario, follow these guidelines:
- Interior ants/spiders with vacancy allowed: use SECLIRA WSG
- Interior ants with no vacancy: use Greenway Ant & Roach Gel and Maxforce Quantum gel
- Interior spiders with no vacancy: use Drione Dust in wall voids and cracks
- Exterior ants/spiders: use Suspend Polyzone (primary) or Temprid SC (alternative)
- Wasps with visible nest: use KONK; without visible nest: use Drione
- Stinkbugs: use Seclira WSG around doors/windows
- Exterior ant colony: use Scorpio granules and set up ant spike bait stations
- Rodents: use Contrac Blox (exterior), Resolv or Contrac (interior)
${pestCategoriesText}
${productInfoText}

I will be describing an image of a pest. Analyze the description and:
1. Identify the pest based on the description
2. Recommend appropriate product(s) based on typical treatment protocols
3. Provide application advice for the technician

Respond in JSON format with these fields:
- recommendation: A brief explanation of your identification and assessment
- pestType: The category of pest identified (Ants, Spiders, Rodents, Wasps, Stinkbugs, or Unknown)
- products: Object with primary and alternative product options
- applicationAdvice: Brief guidance on product application
`;

    // Create a text description of the image for DeepSeek since it may not support multimodal input
    const userPrompt = "This is an image of a pest. It appears to need identification and treatment recommendations. Please analyze based on common pest characteristics and provide recommendations based on the Ontario guidelines.";

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Using the environment variable
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the response format
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    try {
      // Try to parse as JSON first
      return JSON.parse(content) as AISearchResponse;
    } catch (parseError) {
      // If not JSON, try to extract structured data from text response
      console.log("Response not in JSON format, attempting to extract structured data");
      
      // Create a simple structured response
      return {
        recommendation: content,
        pestType: extractPestType(content),
        products: extractProducts(content),
        applicationAdvice: extractAdvice(content)
      };
    }
  } catch (error) {
    console.error("Error processing image search with OpenRouter:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your image. Please try again with a clearer image or provide a text description of the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}

// Helper functions to extract structured data from text responses
function extractPestType(content: string): string {
  const pestTypes = ['Ants', 'Spiders', 'Rodents', 'Wasps', 'Stinkbugs'];
  for (const type of pestTypes) {
    if (content.includes(type) || content.includes(type.toLowerCase())) {
      return type;
    }
  }
  return 'Unknown';
}

function extractProducts(content: string): { primary?: string; alternative?: string } {
  const products = {
    primary: undefined,
    alternative: undefined
  };
  
  // List of known products to search for
  const knownProducts = [
    'SECLIRA WSG', 'Seclira', 
    'Greenway Ant & Roach Gel', 'Greenway', 
    'Maxforce Quantum', 
    'Drione', 'Drione Dust',
    'Suspend Polyzone', 
    'Temprid SC', 
    'KONK', 
    'Scorpio granules',
    'Contrac Blox', 
    'Resolv'
  ];
  
  // Find primary product
  for (const product of knownProducts) {
    if (content.includes(product)) {
      products.primary = product;
      break;
    }
  }
  
  // Check for alternative product mention
  const altIndicators = ['alternative', 'alternatively', 'another option', 'second choice'];
  for (const indicator of altIndicators) {
    if (content.includes(indicator)) {
      const startIndex = content.indexOf(indicator);
      const textAfter = content.substring(startIndex);
      
      // Look for a product in the text after the alternate indicator
      for (const product of knownProducts) {
        if (textAfter.includes(product) && product !== products.primary) {
          products.alternative = product;
          break;
        }
      }
      
      if (products.alternative) break;
    }
  }
  
  return products;
}

function extractAdvice(content: string): string | undefined {
  const adviceIndicators = ['apply', 'application', 'use', 'treatment', 'recommend'];
  for (const indicator of adviceIndicators) {
    if (content.includes(indicator)) {
      // Find sentence containing advice
      const sentences = content.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(indicator)) {
          return sentence.trim();
        }
      }
    }
  }
  return undefined;
}