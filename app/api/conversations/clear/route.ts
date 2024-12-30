// app/api/conversations/clear/route.ts
import { auth } from '@/lib/auth';
import { deleteConversations } from '@/lib/db';

export async function POST() {
  try {
    const userId = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteConversations(userId);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}