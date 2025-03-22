import OpenAI from "openai";

// Define the interface for AI search responses
interface AISearchResponse {
  recommendation: string;
  pestType: string;
  products: {
    primary?: string;
    alternative?: string;
  };
  applicationAdvice?: string;
}

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Process AI search with enhanced context
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

    const response = await openai.chat.completions.create({
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
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response content to get the structured data
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as AISearchResponse;
  } catch (error) {
    console.error("Error processing AI search with OpenAI:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your request. Please try again with more details about the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}

/**
 * Process text search using OpenAI
 */
export async function processTextSearch(query: string): Promise<AISearchResponse> {
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response content to get the structured data
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as AISearchResponse;
  } catch (error) {
    console.error("Error processing text search with OpenAI:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your request. Please try again with more details about the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}

/**
 * Process image search using OpenAI's vision capabilities
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
${pestCategoriesText}
${productInfoText}

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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please identify this pest and recommend appropriate treatment products according to Ontario regulations."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response content to get the structured data
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as AISearchResponse;
  } catch (error) {
    console.error("Error processing image search with OpenAI:", error);
    // Provide a fallback response in case of error
    return {
      recommendation: "I encountered an issue processing your image. Please try again with a clearer image or provide a text description of the pest problem.",
      pestType: "Unknown",
      products: {}
    };
  }
}