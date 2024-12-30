// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from '@/lib/auth';
import { storeConversation } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const userId = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    // Generate embedding for the conversation
    const conversationText = messages.map(m => m.content).join('\n');
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: conversationText,
    });

    // Store conversation with embedding
    const conversationId = Date.now().toString();
    await storeConversation({
      id: conversationId,
      vector: embedding.data[0].embedding,
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
        messages,
      },
    });

    // Generate and stream the response
    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}