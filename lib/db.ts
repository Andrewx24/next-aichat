// lib/db.ts
import { Index } from "@upstash/vector";
import { Message } from 'ai';

// Define the structure of metadata we store with each conversation
export interface ConversationMetadata {
  timestamp: string;
  userId: string;
  summary?: string;
  messageCount: number;
  messages: Message[]; // Store the actual messages in metadata
}

// Main interface for working with conversation vectors
export interface ConversationVector {
  id: string;
  vector: number[];
  metadata: ConversationMetadata;
}

// Ensure required environment variables are present
if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
  throw new Error("Missing required Upstash Vector environment variables");
}

// Create a singleton instance of the vector database
export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

// Store a new conversation or update an existing one
export async function storeConversation(conversation: ConversationVector) {
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

// Retrieve all conversations for a specific user
export async function getConversations(userId: string) {
  try {
    // Query with a zero vector to get all conversations, filtered by userId
    const zeroVector = new Array(1536).fill(0);
    const results = await vectorIndex.query({
      vector: zeroVector,
      topK: 100,
      includeMetadata: true,
      filter: (metadata) => metadata.userId === userId,
    });
    return results;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

// Delete all conversations for a specific user
export async function deleteConversations(userId: string) {
  try {
    const conversations = await getConversations(userId);
    await Promise.all(
      conversations.map((conv) => vectorIndex.delete(conv.id))
    );
    return true;
  } catch (error) {
    console.error("Error deleting conversations:", error);
    throw error;
  }
}