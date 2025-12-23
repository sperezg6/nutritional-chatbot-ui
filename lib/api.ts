/**
 * API Service for Nutritional Chatbot Backend
 * Handles communication with Lambda Function URLs (streaming + non-streaming)
 */

import type { ChatRequest, ChatResponse, ErrorResponse, APIError } from '@/types/api';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const STREAMING_ENDPOINT = process.env.NEXT_PUBLIC_STREAMING_ENDPOINT;

if (!API_ENDPOINT) {
  console.warn('NEXT_PUBLIC_API_ENDPOINT is not set');
}
if (!STREAMING_ENDPOINT) {
  console.warn('NEXT_PUBLIC_STREAMING_ENDPOINT is not set');
}

/**
 * Streaming response callbacks
 */
export interface StreamingCallbacks {
  onStart?: (sessionId: string, title: string) => void;
  onChunk?: (content: string) => void;
  onComplete?: (agentUsed: string) => void;
  onError?: (error: string) => void;
}

/**
 * Send a message with streaming response
 * Returns chunks in real-time via callbacks
 */
export async function sendMessageStreaming(
  message: string,
  sessionId: string | undefined,
  callbacks: StreamingCallbacks
): Promise<void> {
  try {
    const requestBody: ChatRequest = { message };
    if (sessionId) {
      requestBody.session_id = sessionId;
    }

    const response = await fetch(STREAMING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw createAPIError(`Error del servidor (${response.status})`, response.status);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw createAPIError('No se pudo iniciar la lectura de la respuesta');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'start':
                callbacks.onStart?.(data.session_id, data.title);
                break;
              case 'chunk':
                callbacks.onChunk?.(data.content);
                break;
              case 'end':
                callbacks.onComplete?.(data.agent_used);
                break;
              case 'error':
                callbacks.onError?.(data.content);
                break;
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE data:', line);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      callbacks.onError?.('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    } else if ((error as any).name === 'APIError') {
      callbacks.onError?.((error as Error).message);
    } else {
      callbacks.onError?.('Error inesperado al comunicarse con el servidor');
    }
    throw error;
  }
}

/**
 * Send a message to the chatbot backend
 *
 * @param message - User message content
 * @param sessionId - Optional session ID (creates new if not provided)
 * @returns Promise with response and session ID
 * @throws APIError on failure
 */
export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  try {
    const requestBody: ChatRequest = {
      message,
    };

    // Only include session_id if it's provided
    if (sessionId) {
      requestBody.session_id = sessionId;
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `Error del servidor (${response.status})`;
      try {
        const errorData: ErrorResponse = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw createAPIError(errorMessage, response.status);
    }

    const data: ChatResponse = await response.json();

    // Validate response
    if (!data.response || !data.session_id) {
      throw createAPIError('Respuesta inválida del servidor');
    }

    return data;

  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw createAPIError(
        'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        undefined,
        error
      );
    }

    // Re-throw if already an APIError
    if ((error as any).name === 'APIError') {
      throw error;
    }

    // Generic error
    throw createAPIError(
      'Error inesperado al comunicarse con el servidor',
      undefined,
      error
    );
  }
}

/**
 * Create a standardized API error
 */
function createAPIError(
  message: string,
  statusCode?: number,
  originalError?: any
): Error & { name: string; statusCode?: number; originalError?: any } {
  const error = new Error(message) as Error & {
    name: string;
    statusCode?: number;
    originalError?: any;
  };
  error.name = 'APIError';
  error.statusCode = statusCode;
  error.originalError = originalError;
  return error;
}

/**
 * Check if an error is an APIError
 */
export function isAPIError(error: any): error is APIError {
  return error && error.name === 'APIError';
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (isAPIError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}
