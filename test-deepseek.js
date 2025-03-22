// Simple test script to check DeepSeek API
import fetch from 'node-fetch';

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Additional headers required by OpenRouter
const SITE_URL = 'https://helptech.replit.app';
const SITE_NAME = 'HelpTech Pest Control';

async function testDeepSeekAPI() {
  try {
    console.log('Testing DeepSeek API connection...');
    
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
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Test message. Please respond with a short confirmation message.'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('API Response:', data);
    console.log('Response content:', data.choices?.[0]?.message?.content || 'No content');
    console.log('DeepSeek API is working!');
  } catch (error) {
    console.error('Error testing DeepSeek API:', error);
  }
}

testDeepSeekAPI();