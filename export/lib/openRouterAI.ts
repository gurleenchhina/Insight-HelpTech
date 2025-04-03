export interface AISearchResponse {
  recommendation: string;
  pestType: string;
  products: {
    primary?: string;
    alternative?: string;
  };
  applicationAdvice?: string;
}

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterChoice {
  message: OpenRouterMessage;
  index: number;
  finish_reason: string;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
}

/**
 * Process AI search with enhanced context
 */
export async function processAISearch(queryData: string): Promise<AISearchResponse> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API key is not set');
      throw new Error('API key not configured');
    }

    const parsedData = JSON.parse(queryData);
    const userQuery = parsedData.userQuery || queryData;
    
    // Construct the system prompt with our pest control knowledge
    const systemPrompt = `You are a pest control expert assistant specialized in Ontario, Canada regulations and guidelines. 
Your task is to provide professional recommendations for pest control treatments.

When responding to queries, use the following structure:
1. Identify the specific pest type from the query
2. Provide a primary product recommendation based on regulations
3. When appropriate, suggest an alternative product option
4. Include specific application advice and safety precautions

Format your response as a JSON object with these fields:
{
  "recommendation": "Brief overall recommendation",
  "pestType": "Specific pest category",
  "products": {
    "primary": "Main product recommendation",
    "alternative": "Alternative product if applicable"
  },
  "applicationAdvice": "Specific application guidelines and safety precautions"
}`;

    // Log the parsed data to understand what we're sending to the API
    console.log('Sending query to DeepSeek AI:', {
      userQuery,
      parsedData: JSON.stringify(parsedData).substring(0, 200) + '...'
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://helptech.repl.app',
        'X-Title': 'HelpTech Pest Control Assistant',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-32b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Query: ${userQuery}\n\nContext: ${JSON.stringify(parsedData)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json() as OpenRouterResponse;
    const content = result.choices[0]?.message?.content;
    
    console.log('Received response content:', content);
    
    // Handle the response content
    try {
      // Try to parse the response as a JSON object
      const jsonResponse = JSON.parse(content);
      
      // Return the parsed JSON response
      return {
        recommendation: jsonResponse.recommendation || "No specific recommendation provided.",
        pestType: jsonResponse.pestType || extractPestType(content),
        products: {
          primary: jsonResponse.products?.primary || undefined,
          alternative: jsonResponse.products?.alternative || undefined
        },
        applicationAdvice: jsonResponse.applicationAdvice || extractAdvice(content)
      };
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      
      // If parsing fails, use extraction methods to get structured data
      return {
        recommendation: cleanupResponseText(content) || "Sorry, I couldn't generate a recommendation.",
        pestType: extractPestType(content),
        products: extractProducts(content),
        applicationAdvice: extractAdvice(content)
      };
    }
  } catch (error) {
    console.error('Error in processAISearch:', error);
    throw error;
  }
}

/**
 * Process image search using DeepSeek AI through OpenRouter
 * Note: OpenRouter with DeepSeek might not have full multimodal capabilities
 */
export async function processImageSearch(base64Image: string, enhancedContext: string = '{}'): Promise<AISearchResponse> {
  // This would be implemented if using a model with multimodal capabilities
  // However, as DeepSeek through OpenRouter may not support this, we return a fallback
  return {
    recommendation: "Image search is not currently supported. Please try describing the pest in a text search instead.",
    pestType: "Unknown",
    products: {}
  };
}

function cleanupResponseText(text: string | undefined): string {
  if (!text) return '';
  
  // Remove markdown formatting and code blocks
  let cleaned = text.replace(/```json|```/g, '');
  
  // Remove any non-text content
  cleaned = cleaned.replace(/[^\w\s.,;:'"()\-?!/\\]+/g, ' ');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

function extractPestType(content: string): string {
  // Try to extract pest type from the response
  const pestTypePatterns = [
    /pest(?:s)?\s*(?:type|category|identified)?\s*(?:is|:)?\s*["']?([^"'\n.,]+)["']?/i,
    /treating\s+["']?([^"'\n.,]+)["']?/i,
    /(?:for|against)\s+["']?([^"'\n.,]+)["']?/i
  ];
  
  for (const pattern of pestTypePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "Unspecified pest";
}

function extractProducts(content: string): { primary?: string; alternative?: string } {
  const products = {
    primary: undefined as string | undefined,
    alternative: undefined as string | undefined
  };
  
  // Try to extract primary product
  const primaryPatterns = [
    /primary\s+(?:product|recommendation)?\s*(?:is|:)?\s*["']?([^"'\n.,]+)["']?/i,
    /recommend\s+(?:using)?\s*["']?([^"'\n.,]+)["']?/i,
    /use\s+["']?([^"'\n.,]+)["']?/i
  ];
  
  for (const pattern of primaryPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      products.primary = match[1].trim();
      break;
    }
  }
  
  // Try to extract alternative product
  const alternativePatterns = [
    /alternative\s+(?:product|recommendation)?\s*(?:is|:)?\s*["']?([^"'\n.,]+)["']?/i,
    /alternatively,?\s+(?:use|consider|try)?\s*["']?([^"'\n.,]+)["']?/i
  ];
  
  for (const pattern of alternativePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      products.alternative = match[1].trim();
      break;
    }
  }
  
  return products;
}

function extractAdvice(content: string): string | undefined {
  // Try to extract application advice
  const advicePatterns = [
    /application\s+(?:advice|guidelines)?\s*(?::|is)?\s*(.*?)(?:\.|$)/is,
    /apply\s+(?:the product|it)\s*(.*?)(?:\.|$)/is,
    /safety\s+(?:precautions|measures)?\s*(?::|include)?\s*(.*?)(?:\.|$)/is
  ];
  
  for (const pattern of advicePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}