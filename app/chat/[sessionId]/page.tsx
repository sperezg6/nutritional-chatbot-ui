'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Star, ArrowDown, Edit2, Loader2, Check, X, Send, ArrowLeft } from 'lucide-react';
import { ChatMessage, UIMessage } from '@/components/chat/message';
import { MessageSkeleton } from '@/components/chat/message-skeleton';
import { HistoryPanel } from '@/components/chat/history-panel';
import { FeedbackModal } from '@/components/chat/feedback-modal';
import { ContentPanel } from '@/components/chat/content-panel';
import { FollowUpSuggestions, generateFollowUpSuggestions } from '@/components/chat/follow-up-suggestions';
import { EmptyState } from '@/components/chat/empty-state';
import { sendMessage, sendMessageStreaming, getErrorMessage } from '@/lib/api';
import { saveConversation as saveToStorage, getConversation as getFromStorage, getAllConversations, deleteConversation, updateConversationTitle, updateConversationTitleInDB, type Conversation } from '@/lib/session';
import { useToast } from '@/components/ui/toast';

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
  const [isContentPanelOpen, setIsContentPanelOpen] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<UIMessage | null>(null);
  const [conversationTitle, setConversationTitle] = useState('Nueva conversación');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [lastSendTime, setLastSendTime] = useState(0);
  const retryCountRef = useRef<Map<string, number>>(new Map());
  const MAX_RETRIES = 3;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasProcessedFirstMessage = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Load conversation on mount
  useEffect(() => {
    if (sessionId === 'new') return;
    if (messages.length > 0) return;

    const conversation = getFromStorage(sessionId);
    if (conversation) {
      setMessages(conversation.messages as UIMessage[]);
      setConversationTitle(conversation.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Load all conversations for history panel
  useEffect(() => {
    const loadConversations = () => {
      const allConvs = getAllConversations();
      setConversations(allConvs);
    };
    loadConversations();

    // Refresh when history panel opens
    if (isHistoryOpen) {
      loadConversations();
    }
  }, [isHistoryOpen]);

  // Handle first message from query param
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

  // Track scroll position for scroll-to-bottom button
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
      }, 100);
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

    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }
    if (userMessageIndex < 0) return;

    const userMessage = messages[userMessageIndex];
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await handleSendMessage(userMessage.content);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
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
    // Rate limiting: minimum 1 second between messages
    const now = Date.now();
    if (now - lastSendTime < 1000) {
      showToast('Por favor espera un momento antes de enviar otro mensaje', 'error');
      return;
    }
    setLastSendTime(now);

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

    let pendingUpdate = false;
    let rafId: number | null = null;

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const flushUpdate = () => {
      if (!pendingUpdate) return;
      pendingUpdate = false;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: streamedContent }
            : msg
        )
      );
    };

    const scheduleUpdate = () => {
      if (pendingUpdate) return;
      pendingUpdate = true;
      rafId = requestAnimationFrame(flushUpdate);
    };

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
            scheduleUpdate();
          }
        },
        onComplete: (agentUsed) => {
          if (rafId) cancelAnimationFrame(rafId);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, content: streamedContent }
                : msg
            )
          );

          setIsTyping(false);

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
          if (rafId) cancelAnimationFrame(rafId);

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
      if (rafId) cancelAnimationFrame(rafId);

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

    // Check retry count
    const currentRetries = retryCountRef.current.get(failedMessage.originalContent) || 0;
    if (currentRetries >= MAX_RETRIES) {
      showToast(`Se alcanzó el límite de ${MAX_RETRIES} reintentos. Por favor intenta más tarde.`, 'error');
      // Disable retry on this message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, canRetry: false, errorMessage: 'Límite de reintentos alcanzado' } : m
        )
      );
      return;
    }

    // Increment retry count
    retryCountRef.current.set(failedMessage.originalContent, currentRetries + 1);

    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await handleSendMessage(failedMessage.originalContent);
  };

  // Title editing handlers
  const handleStartEditTitle = () => {
    if (sessionId === 'new') return;
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

    setConversationTitle(trimmedTitle);
    updateConversationTitle(sessionId, trimmedTitle);
    setIsEditingTitle(false);
    setIsSavingTitle(true);

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

  const handleSelectConversation = (conversationId: string) => {
    setIsHistoryOpen(false);
    if (conversationId !== sessionId) {
      router.push(`/chat/${conversationId}`);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
    setConversations(prev => prev.filter(c => c.id !== conversationId));

    // If deleting current conversation, go to home
    if (conversationId === sessionId) {
      router.push('/');
    }
  };

  // Handle expanding a message in the side panel
  const handleExpandMessage = useCallback((message: UIMessage) => {
    setExpandedMessage(message);
    setIsContentPanelOpen(true);
  }, []);

  const handleCloseContentPanel = useCallback(() => {
    setIsContentPanelOpen(false);
    // Delay clearing the message for exit animation
    setTimeout(() => setExpandedMessage(null), 300);
  }, []);

  // Check if expanded message is a meal plan
  const isExpandedMealPlan = expandedMessage ? (
    (expandedMessage.content.includes('Límites Diarios') || expandedMessage.content.includes('📊')) &&
    (expandedMessage.content.includes('Desayuno') || expandedMessage.content.includes('Plan Semanal') || expandedMessage.content.includes('🌅'))
  ) : false;

  // Handle PDF download for expanded content
  const handleExpandedPDFDownload = useCallback(async () => {
    if (!expandedMessage) return;
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: expandedMessage.content }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-nutricional-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      showToast('Error al generar el PDF', 'error');
    }
  }, [expandedMessage, showToast]);

  // Cmd+E keyboard shortcut to expand latest long message
  useEffect(() => {
    const handleExpandShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant' && !m.isError);
        if (lastAssistantMessage && lastAssistantMessage.content.length > 800) {
          handleExpandMessage(lastAssistantMessage);
        }
      }
    };

    window.addEventListener('keydown', handleExpandShortcut);
    return () => window.removeEventListener('keydown', handleExpandShortcut);
  }, [messages, handleExpandMessage]);

  const handleInputSend = () => {
    if (inputValue.trim() && !isTyping) {
      handleSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#2B3A42] flex flex-col">
      {/* Alba-style Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-white/10 px-4 md:px-6 lg:px-10 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          {/* Back/Home */}
          <button
            onClick={handleNewChat}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* History button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Ver historial"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10" />

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
                  className="flex-1 text-sm font-medium text-white bg-white/5 border border-[#E85A2C]/50 px-3 py-1.5 focus:outline-none focus:border-[#E85A2C]"
                  maxLength={255}
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 text-[#E85A2C] hover:bg-[#E85A2C]/10 transition-colors"
                  aria-label="Guardar título"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEditTitle}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEditTitle}
                className="group flex items-center gap-2 min-w-0 hover:bg-white/5 px-2 py-1 transition-colors"
                disabled={sessionId === 'new'}
                title={sessionId === 'new' ? 'Envía un mensaje para crear la conversación' : 'Haz clic para editar el título'}
              >
                <h1 className="text-sm font-light text-white/80 truncate">
                  {conversationTitle}
                </h1>
                {isSavingTitle ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#E85A2C] flex-shrink-0" />
                ) : sessionId !== 'new' && (
                  <Edit2 className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </button>
            )}
          </div>

          {/* Right side - Actions */}
          <button
            onClick={handleNewChat}
            className="p-2 text-[#E85A2C] hover:bg-[#E85A2C]/10 transition-colors"
            aria-label="Nueva conversación"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-2 text-white/60 hover:text-[#E85A2C] hover:bg-[#E85A2C]/10 transition-colors"
            aria-label="Dar feedback"
          >
            <Star className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Messages Area */}
      <motion.div
        ref={messagesContainerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 relative"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <EmptyState onPromptClick={handleSendMessage} />
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatMessage
                    message={message}
                    index={index}
                    onRetry={handleRetryMessage}
                    onRegenerate={handleRegenerateMessage}
                    onExpand={handleExpandMessage}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Skeleton while loading */}
          {isTyping && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
            <MessageSkeleton lines={4} />
          )}

          {/* Follow-up suggestions */}
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
              className="absolute bottom-4 right-4 p-3 bg-white/10 border border-white/20 hover:border-[#E85A2C]/50 hover:bg-white/5 transition-all"
              aria-label="Ir al final"
            >
              <ArrowDown className="w-5 h-5 text-white/60" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Input Area - Alba style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="border-t border-white/10 px-4 md:px-6 lg:px-10 py-4"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`
              flex items-center gap-3 px-5 py-4 border transition-all duration-300
              ${isFocused
                ? 'border-[#E85A2C] bg-white/5'
                : 'border-white/20 hover:border-white/40'
              }
            `}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Escribe tu mensaje..."
              disabled={isTyping}
              aria-label="Mensaje para el asistente de nutrición"
              aria-describedby="input-hint"
              role="textbox"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-base disabled:opacity-50"
            />
            <span id="input-hint" className="sr-only">
              {isTyping ? 'Procesando mensaje, por favor espera' : 'Escribe tu pregunta y presiona Enter o el botón Enviar'}
            </span>

            <button
              onClick={handleInputSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-5 py-2.5 bg-[#E85A2C] hover:bg-[#D14E22] text-black text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Enviar mensaje"
            >
              <span className="hidden sm:inline">Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        currentConversationId={sessionId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        conversationId={sessionId}
      />

      {/* Content Panel for expanded messages */}
      <ContentPanel
        isOpen={isContentPanelOpen}
        onClose={handleCloseContentPanel}
        content={expandedMessage?.content || null}
        title="Respuesta completa"
        isMealPlan={isExpandedMealPlan}
        onDownloadPDF={isExpandedMealPlan ? handleExpandedPDFDownload : undefined}
      />
    </div>
  );
}
