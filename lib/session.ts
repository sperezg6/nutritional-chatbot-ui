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

// Track pending saves to avoid duplicate idle callbacks
let pendingSave: Conversation | null = null;
let idleCallbackId: number | null = null;

/**
 * Schedule a callback to run during browser idle time
 * Falls back to setTimeout for browsers without requestIdleCallback
 */
function scheduleIdleCallback(callback: () => void, timeout = 1000): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  // Fallback for Safari and older browsers
  return setTimeout(callback, 50) as unknown as number;
}

/**
 * Cancel a scheduled idle callback
 */
function cancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Save conversation immediately (for critical operations like new conversations)
 */
export function saveConversationImmediate(conversation: Conversation): void {
  const conversations = getAllConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);

  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.unshift(conversation);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

/**
 * Save conversation during browser idle time (for non-critical updates)
 * Multiple calls will be batched - only the latest conversation state is saved
 */
export function saveConversationDeferred(conversation: Conversation): void {
  // Store the latest state to save
  pendingSave = conversation;

  // Cancel any existing scheduled save
  if (idleCallbackId !== null) {
    cancelIdleCallback(idleCallbackId);
  }

  // Schedule save during idle time
  idleCallbackId = scheduleIdleCallback(() => {
    if (pendingSave) {
      saveConversationImmediate(pendingSave);
      pendingSave = null;
    }
    idleCallbackId = null;
  }, 2000); // Max wait 2 seconds
}

/**
 * Save conversation - uses deferred save for updates, immediate for new
 */
export function saveConversation(conversation: Conversation): void {
  const conversations = getAllConversations();
  const isExisting = conversations.some(c => c.id === conversation.id);

  if (isExisting) {
    // Existing conversation update - defer to idle time
    saveConversationDeferred(conversation);
  } else {
    // New conversation - save immediately
    saveConversationImmediate(conversation);
  }
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
 * Update conversation title in the database (DynamoDB)
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
