'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, ArrowLeft, Star, ArrowDown, RefreshCw, Leaf, Edit2, Loader2, Check, X } from 'lucide-react';
import { ChatMessage } from '@/components/chat/message';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageSkeleton } from '@/components/chat/message-skeleton';
import { HistoryPanel } from '@/components/chat/history-panel';
import { FeedbackModal } from '@/components/chat/feedback-modal';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FollowUpSuggestions, generateFollowUpSuggestions } from '@/components/chat/follow-up-suggestions';
import { EmptyState } from '@/components/chat/empty-state';
import { sendMessage, sendMessageStreaming, getErrorMessage } from '@/lib/api';
import { saveConversation as saveToStorage, getConversation as getFromStorage, updateConversationTitle, updateConversationTitleInDB, type Conversation } from '@/lib/session';
import { useToast } from '@/components/ui/toast';
// UI Message type for chat display
interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  errorMessage?: string;
  canRetry?: boolean;
  originalContent?: string;
}


export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const firstMessage = searchParams.get('firstMessage');

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('Nueva conversación');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasProcessedFirstMessage = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Load conversation on mount (from localStorage as backup)
  // Skip if messages already exist (prevents reload after URL swap from /chat/new)
  useEffect(() => {
    // Don't try to load if this is a new session
    if (sessionId === 'new') return;

    // Skip if messages are already loaded (URL just changed from /chat/new)
    if (messages.length > 0) return;

    const conversation = getFromStorage(sessionId);
    if (conversation) {
      setMessages(conversation.messages as UIMessage[]);
      setConversationTitle(conversation.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Handle first message from query param (only once)
  useEffect(() => {
    if (firstMessage && messages.length === 0 && !hasProcessedFirstMessage.current) {
      hasProcessedFirstMessage.current = true;
      handleSendMessage(decodeURIComponent(firstMessage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Track scroll position for scroll-to-bottom button (debounced)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom && messages.length > 2);
      }, 100); // Debounce 100ms
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message regeneration
  const handleRegenerateMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the user message before this assistant message
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }
    if (userMessageIndex < 0) return;

    const userMessage = messages[userMessageIndex];

    // Remove the assistant message we want to regenerate
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    // Resend the user's message
    await handleSendMessage(userMessage.content);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      // Cmd/Ctrl + H for history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setIsHistoryOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    // Don't save if this is still a 'new' session (wait for real session_id)
    if (sessionId === 'new') return;

    if (messages.length > 0) {
      const conversation: Conversation = {
        id: sessionId,
        title: conversationTitle,
        preview: messages[0]?.content.substring(0, 60) + '...',
        timestamp: new Date(),
        messages,
      };
      saveToStorage(conversation);
    }
  }, [messages, sessionId, conversationTitle]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const botMessageId = (Date.now() + 1).toString();
    let streamedContent = '';
    let newSessionId: string | null = null;
    let newTitle: string | null = null;
    let botMessageAdded = false;

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Don't add bot message yet - skeleton will show while waiting

    try {
      const actualSessionId = sessionId === 'new' ? undefined : sessionId;

      await sendMessageStreaming(content, actualSessionId, {
        onStart: (sessionIdFromServer, titleFromServer) => {
          newSessionId = sessionIdFromServer;
          newTitle = titleFromServer;
          if (titleFromServer && sessionId === 'new') {
            setConversationTitle(titleFromServer);
          }
        },
        onChunk: (chunk) => {
          streamedContent += chunk;

          // Add bot message on first chunk (replaces skeleton)
          if (!botMessageAdded) {
            botMessageAdded = true;
            const newBotMessage: UIMessage = {
              id: botMessageId,
              role: 'assistant',
              content: streamedContent,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newBotMessage]);
          } else {
            // Update existing bot message with new content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, content: streamedContent }
                  : msg
              )
            );
          }
        },
        onComplete: (agentUsed) => {
          setIsTyping(false);

          // Save conversation to localStorage
          if (sessionId === 'new' && newSessionId) {
            const finalBotMessage: UIMessage = {
              id: botMessageId,
              role: 'assistant',
              content: streamedContent,
              timestamp: new Date(),
            };
            const updatedMessages = [userMessage, finalBotMessage];
            const conversation: Conversation = {
              id: newSessionId,
              title: newTitle || conversationTitle,
              preview: content.substring(0, 60) + '...',
              timestamp: new Date(),
              messages: updatedMessages,
            };
            saveToStorage(conversation);
            router.replace(`/chat/${newSessionId}`, { scroll: false });
          }
        },
        onError: (errorMsg) => {
          // Add or update error message
          const errorMessage: UIMessage = {
            id: botMessageId,
            role: 'assistant',
            content: 'Lo siento, hubo un error al procesar tu mensaje.',
            timestamp: new Date(),
            isError: true,
            errorMessage: errorMsg,
            canRetry: true,
            originalContent: content,
          };

          if (!botMessageAdded) {
            setMessages((prev) => [...prev, errorMessage]);
          } else {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === botMessageId ? errorMessage : msg))
            );
          }
          setIsTyping(false);
        },
      });
    } catch (error) {
      // Add error message (bot message may not exist yet)
      const errorMessage: UIMessage = {
        id: botMessageId,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date(),
        isError: true,
        errorMessage: getErrorMessage(error),
        canRetry: true,
        originalContent: content,
      };

      if (!botMessageAdded) {
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === botMessageId ? errorMessage : msg))
        );
      }
      setIsTyping(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const failedMessage = messages[messageIndex] as UIMessage;
    if (!failedMessage.originalContent) return;

    // Remove the error message
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    // Retry sending the original message
    await handleSendMessage(failedMessage.originalContent);
  };

  // Title editing handlers
  const handleStartEditTitle = () => {
    if (sessionId === 'new') return; // Can't edit title of new conversation
    setEditedTitle(conversationTitle);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleSaveTitle = async () => {
    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle || trimmedTitle === conversationTitle) {
      setIsEditingTitle(false);
      return;
    }

    // Update locally first for instant feedback
    setConversationTitle(trimmedTitle);
    updateConversationTitle(sessionId, trimmedTitle);
    setIsEditingTitle(false);
    setIsSavingTitle(true);

    // Sync with database
    const result = await updateConversationTitleInDB(sessionId, trimmedTitle);
    setIsSavingTitle(false);

    if (result.success) {
      showToast("Título actualizado", "success");
    } else {
      showToast("Error al guardar en el servidor", "error");
    }
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleNewChat = () => {
    router.push('/');
  };

  return (
    <div className="relative">
      <motion.div
        initial="initial"
        animate="animate"
        className="flex flex-col h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
      >
        {/* Header */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: -30 },
            animate: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.3,
                ease: [0.0, 0.0, 0.2, 1],
              },
            },
          }}
          className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-3 shadow-sm"
        >
          <div className="max-w-6xl mx-auto flex items-center gap-2 md:gap-3">
            {/* Logo/Brand */}
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 p-1.5 hover:bg-medical-50 dark:hover:bg-medical-900/30 rounded-xl transition-colors"
              aria-label="Inicio"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-medical-500 to-medical-600 rounded-lg flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-semibold text-medical-600 dark:text-medical-400">
                NutriRenal
              </span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* History button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Ver historial"
            >
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Title - Editable */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      else if (e.key === 'Escape') handleCancelEditTitle();
                    }}
                    className="flex-1 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-medical-300 dark:border-medical-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-medical-500"
                    maxLength={255}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 hover:bg-medical-50 dark:hover:bg-medical-900/30 rounded transition-colors"
                    aria-label="Guardar título"
                  >
                    <Check className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                  </button>
                  <button
                    onClick={handleCancelEditTitle}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    aria-label="Cancelar"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEditTitle}
                  className="group flex items-center gap-2 min-w-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1 transition-colors"
                  disabled={sessionId === 'new'}
                  title={sessionId === 'new' ? 'Envía un mensaje para crear la conversación' : 'Haz clic para editar el título'}
                >
                  <h1 className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    {conversationTitle}
                  </h1>
                  {isSavingTitle ? (
                    <Loader2 className="w-3 h-3 animate-spin text-medical-500 flex-shrink-0" />
                  ) : sessionId !== 'new' && (
                    <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </button>
              )}
            </div>

            {/* Right side - Actions */}
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-medical-50 dark:hover:bg-medical-900/30 rounded-xl transition-colors"
              aria-label="Nueva conversación"
            >
              <Plus className="w-5 h-5 text-medical-600 dark:text-medical-400" />
            </button>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-xl transition-colors"
              aria-label="Dar feedback"
            >
              <Star className="w-5 h-5 text-yellow-500" />
            </button>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Messages Area */}
        <motion.div
          ref={messagesContainerRef}
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: [0.0, 0.0, 0.2, 1],
                delay: 0.1,
              },
            },
          }}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-4 relative"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <EmptyState onPromptClick={handleSendMessage} />
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.3,
                        ease: [0.0, 0.0, 0.2, 1],
                      },
                    }}
                  >
                    <ChatMessage
                      message={message}
                      index={index}
                      onRetry={handleRetryMessage}
                      onRegenerate={handleRegenerateMessage}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Show skeleton only if typing and last message is from user (not yet streaming) */}
                {isTyping && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                  <MessageSkeleton lines={4} />
                )}

            {/* Follow-up suggestions after last bot message */}
            {!isTyping && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.isError && (
              <FollowUpSuggestions
                suggestions={generateFollowUpSuggestions(messages[messages.length - 1].content)}
                onSelect={handleSendMessage}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                aria-label="Ir al final"
              >
                <ArrowDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Input Area */}
        <motion.div
          variants={{
            initial: { opacity: 0.6 },
            animate: {
              opacity: 1,
              transition: {
                duration: 0.2,
                ease: [0.0, 0.0, 0.2, 1],
                delay: 0.2,
              },
            },
          }}
        >
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </motion.div>
      </motion.div>


      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={[]}
        currentConversationId={sessionId}
        onSelectConversation={() => {}}
        onDeleteConversation={() => {}}
        onNewChat={handleNewChat}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        conversationId={sessionId}
      />
    </div>
  );
}

