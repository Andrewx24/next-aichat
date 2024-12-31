import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from '@/lib/auth';
import { storeConversation } from '@/lib/db';

// Mark this route as using edge runtime
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const userId = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    // Create embedding for semantic search
    // We'll use a separate instance for embeddings since they don't need streaming
    const embeddingModel = openai('text-embedding-3-small');
    const conversationText = messages.map(m => m.content).join('\n');
    
    const { embeddings } = await embeddingModel.embed({
      input: conversationText,
    });

    // Store the conversation with its embedding
    const conversationId = Date.now().toString();
    await storeConversation({
      id: conversationId,
      vector: embeddings[0], // Use the first embedding
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
        messages,
      },
    });

    // Create a streaming response using the chat model
    const result = streamText({
      model: openai('gpt-4-turbo', {
        // You can customize the model behavior here
        temperature: 0.7, // Controls randomness (0-1)
      }),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}