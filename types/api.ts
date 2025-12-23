/**
 * API Types for Nutritional Chatbot Backend
 */

// ===== Request/Response Types =====

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  title?: string;
}

export interface ErrorResponse {
  error: string;
  session_id?: string | null;
}

// ===== Database Types =====

export interface Session {
  id: string;
  user_id: string | null;
  title: string | null;
  started_at: string;
  last_message_at: string;
  message_count: number;
  context_snapshot: Record<string, any>;
  metadata: Record<string, any>;
  is_active: boolean;
  ended_at: string | null;
  deleted_at: string | null;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  agent_used: string | null;
  handoff_chain: string[] | null;
  tool_calls: Record<string, any> | null;
  tokens_used: Record<string, any> | null;
  model_used: string | null;
  latency_ms: number | null;
  safety_flags: Record<string, any> | null;
  was_modified_by_safety: boolean;
  user_feedback: 'helpful' | 'not_helpful' | 'harmful' | null;
  feedback_comment: string | null;
  created_at: string;
  sequence_number: number;
}

export interface MealPlan {
  id: string;
  user_id: string | null;
  plan_date: string;
  plan_type: string;
  meals: Record<string, any>;
  nutrition_totals: Record<string, any> | null;
  within_limits: boolean | null;
  limit_warnings: string[] | null;
  generated_by: string | null;
  generation_context: Record<string, any> | null;
  is_followed: boolean | null;
  user_rating: number | null;
  user_notes: string | null;
  created_at: string;
}

// ===== UI Message Type (simplified for display) =====

export interface UIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  agent_used?: string;
  isError?: boolean;
  canRetry?: boolean;
}

// ===== API Error =====

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
