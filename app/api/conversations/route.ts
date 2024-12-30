// app/api/conversations/route.ts
import { auth } from '@/lib/auth';
import { getConversations } from '@/lib/db';

export async function GET() {
  try {
    const userId = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const conversations = await getConversations(userId);
    
    // Format conversations for the frontend
    const formattedConversations = conversations.reduce((acc, conv) => {
      acc[conv.id] = JSON.stringify(conv.metadata.messages);
      return acc;
    }, {} as Record<string, string>);

    return new Response(JSON.stringify(formattedConversations), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}