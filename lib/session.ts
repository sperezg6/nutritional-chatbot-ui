import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

const STORAGE_KEY = 'kidney-chat-conversations';

export function generateSessionId(): string {
  return uuidv4();
}

export function saveConversation(conversation: Conversation): void {
  const conversations = getAllConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);

  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.unshift(conversation);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function getConversation(id: string): Conversation | null {
  const conversations = getAllConversations();
  return conversations.find(c => c.id === id) || null;
}

export function getAllConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const conversations = JSON.parse(stored);
    // Convert timestamp strings back to Date objects
    return conversations.map((conv: any) => ({
      ...conv,
      timestamp: new Date(conv.timestamp),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error parsing conversations from localStorage:', error);
    return [];
  }
}

export function deleteConversation(id: string): void {
  const conversations = getAllConversations();
  const filtered = conversations.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateConversationTitle(id: string, title: string): void {
  const conversations = getAllConversations();
  const conversation = conversations.find(c => c.id === id);

  if (conversation) {
    conversation.title = title;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }
}

/**
 * Update conversation title in the database (Supabase)
 * This should be called after updateConversationTitle to sync with backend
 */
export async function updateConversationTitleInDB(
  sessionId: string,
  title: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to update title in DB:', data.error);
      return { success: false, error: data.error || 'Failed to update title' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating title in DB:', error);
    return { success: false, error: 'Network error' };
  }
}
