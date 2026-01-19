import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

const openRouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getModel() {
  const modelName = process.env.LLM_MODEL || 'google/gemini-3-flash-preview';

  console.log('Using LLM Model:', modelName);

  if (modelName.startsWith('openrouter/')) {
    const cleanName = modelName.replace('openrouter/', '');
    return openRouter(cleanName);
  }

  // Fallback to Google provider if keys are set and model requires it
  if (modelName.startsWith('gemini') || modelName.startsWith('google/')) {
     return google(modelName.replace('google/', ''));
  }

  // Default to OpenRouter for generic names if key exists
  if (process.env.OPENROUTER_API_KEY) {
    return openRouter(modelName);
  }
  
  throw new Error('LLM Provider not configured properly.');
}
