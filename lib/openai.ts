import { openai as openaiClient, createOpenAI } from '@ai-sdk/openai';


// Verify environment variables
if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }




export const strictOpenAI = createOpenAI({
    compatibility: 'strict', // Enable strict mode for OpenAI API
  });

// Create commonly used model instances
export const chatModel = openaiClient('gpt-4-turbo');
export const embedModel = openaiClient('text-embedding-3-small');
