import { Index } from "@upstash/vector";
import { Message } from 'ai';


// Core types for our conversation system
type ConversationMetadata = {
  timestamp: string;
  userId: string;
  summary?: string;
  messageCount: number;
  messages: Message[];
}

type ConversationVector = {
  id: string;
  vector: number[];
  metadata: ConversationMetadata;
}

// Initialize vector database with environment variables
const VECTOR_URL = process.env.UPSTASH_VECTOR_REST_URL;
const VECTOR_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

if (!VECTOR_URL || !VECTOR_TOKEN) {
  throw new Error("Missing Upstash Vector configuration");
}

// Create database instance
const vectorIndex = new Index({
  url: VECTOR_URL,
  token: VECTOR_TOKEN,
});

// Database operations
async function storeConversation(conversation: ConversationVector): Promise<boolean> {
  try {
    await vectorIndex.upsert({
      id: conversation.id,
      vector: conversation.vector,
      metadata: conversation.metadata,
    });
    return true;
  } catch (error) {
    console.error("Error storing conversation:", error);
    throw error;
  }
}

async function getConversations(userId: string) {
  try {
    const defaultVector = new Array(1536).fill(0);
    // Use a string filter expression instead of a function
    return await vectorIndex.query({
      vector: defaultVector,
      topK: 100,
      includeMetadata: true,
      filter: `metadata.userId = "${userId}"`,  // Changed to string filter syntax
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

async function deleteConversations(userId: string): Promise<boolean> {
  try {
    const conversations = await getConversations(userId);
    await Promise.all(
      conversations.map(conv => vectorIndex.delete(conv.id))
    );
    return true;
  } catch (error) {
    console.error("Error deleting conversations:", error);
    throw error;
  }
}

export {
  type ConversationMetadata,
  type ConversationVector,
  vectorIndex,
  storeConversation,
  getConversations,
  deleteConversations,
};