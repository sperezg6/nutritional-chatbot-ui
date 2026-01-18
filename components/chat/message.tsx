"use client"

import { useState, memo, useCallback } from "react"
import { motion } from "framer-motion"
import { Leaf, User, RefreshCw, AlertCircle, Copy, Download, Share2, Bookmark, BookmarkCheck, RotateCcw, Maximize2, Loader2 } from "lucide-react"
import { LazyMarkdownGfm } from "@/components/chat/lazy-markdown"
import { useToast } from "@/components/ui/toast"

// Threshold for showing expand button (characters)
const LONG_CONTENT_THRESHOLD = 800

export interface UIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
  errorMessage?: string
  canRetry?: boolean
  originalContent?: string
}

interface MessageProps {
  message: UIMessage
  index: number
  onRetry?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  onExpand?: (message: UIMessage) => void
}

export const ChatMessage = memo(function ChatMessage({ message, index, onRetry, onRegenerate, onExpand }: MessageProps) {
  const isUser = message.role === "user"
  const isError = message.isError || false
  const isLongContent = !isUser && message.content.length > LONG_CONTENT_THRESHOLD
  const [isDownloading, setIsDownloading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { showToast } = useToast()

  // Detect if message is a meal plan - more flexible detection
  const isMealPlan = !isUser && (
    // Has meal-related content
    (message.content.includes('Desayuno') ||
     message.content.includes('Comida') ||
     message.content.includes('Cena') ||
     message.content.includes('Colación') ||
     message.content.includes('🌅') ||
     message.content.includes('🍳') ||
     message.content.includes('🥗')) &&
    // And has nutritional/plan structure
    (message.content.includes('Límites') ||
     message.content.includes('Plan') ||
     message.content.includes('Día') ||
     message.content.includes('📊') ||
     message.content.includes('Sodio') ||
     message.content.includes('Proteína') ||
     message.content.includes('Calorías') ||
     message.content.includes('kcal'))
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      showToast("Mensaje copiado al portapapeles", "success")
    } catch {
      showToast("Error al copiar", "error")
    }
  }, [message.content, showToast])

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Información de Alba - Nutrición Renal',
          text: message.content,
        })
      } else {
        await navigator.clipboard.writeText(message.content)
        showToast("Enlace copiado para compartir", "success")
      }
    } catch {
      // User cancelled share - ignore
    }
  }, [message.content, showToast])

  const handleRegenerate = useCallback(() => {
    if (onRegenerate) {
      onRegenerate(message.id)
    }
  }, [onRegenerate, message.id])

  const handleBookmark = useCallback(() => {
    setIsBookmarked(prev => {
      const newValue = !prev
      const bookmarks = JSON.parse(localStorage.getItem('chat-bookmarks') || '[]')
      if (newValue) {
        bookmarks.push({
          id: message.id,
          content: message.content,
          timestamp: message.timestamp,
          savedAt: new Date(),
        })
      } else {
        const index = bookmarks.findIndex((b: { id: string }) => b.id === message.id)
        if (index > -1) bookmarks.splice(index, 1)
      }
      localStorage.setItem('chat-bookmarks', JSON.stringify(bookmarks))
      return newValue
    })
  }, [message.id, message.content, message.timestamp])

  const handleExpand = useCallback(() => {
    if (onExpand) {
      onExpand(message)
    }
  }, [onExpand, message])

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plan-nutricional-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      showToast('Error al generar el PDF. Por favor intenta de nuevo.', 'error')
    } finally {
      setIsDownloading(false)
    }
  }, [message.content, showToast])

  return (
    <motion.div
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Bot Avatar - Alba style */}
      {!isUser && (
        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
          isError
            ? 'border border-red-500/30 bg-red-500/10'
            : 'border border-[#E85A2C]/30 bg-[#E85A2C]/10'
        }`}>
          {isError ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <Leaf className="w-4 h-4 text-[#E85A2C]" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col max-w-[80%]">
        <div
          className={`
            ${isUser
              ? 'bg-[#E85A2C] text-black'
              : isError
              ? 'bg-red-500/10 border border-red-500/30'
              : 'bg-white/5 border border-white/10'
            }
            px-5 py-4
          `}
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
              {message.content}
            </p>
          ) : (
            <>
              <LazyMarkdownGfm
                content={message.content}
                className={`
                  prose prose-sm max-w-none prose-invert
                  ${isError ? 'text-red-300' : 'text-white/80'}
                  prose-headings:font-light prose-headings:text-white
                  prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                  prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                  prose-p:my-2 prose-p:leading-relaxed
                  prose-ul:my-3 prose-ul:space-y-1 prose-ul:list-none
                  prose-ol:my-3 prose-ol:space-y-1 prose-ol:list-none
                  prose-li:my-0.5 prose-li:leading-relaxed prose-li:pl-0
                  prose-hr:my-6 prose-hr:border-white/10
                  prose-strong:text-white prose-strong:font-medium
                  prose-a:text-[#E85A2C] prose-a:no-underline hover:prose-a:underline
                `}
              />

              {/* Action Buttons - Alba style */}
              {!isError && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                  {/* Expand button - shown for long content */}
                  {isLongContent && onExpand && (
                    <button
                      onClick={handleExpand}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#E85A2C] hover:bg-[#D14E22] transition-all"
                      aria-label="Expandir en panel lateral"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Expandir</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 bg-white/5 border border-white/10 hover:border-white/30 hover:text-white transition-all"
                    aria-label="Copiar mensaje"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 bg-white/5 border border-white/10 hover:border-white/30 hover:text-white transition-all"
                    aria-label="Compartir mensaje"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>

                  {onRegenerate && (
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 bg-white/5 border border-white/10 hover:border-white/30 hover:text-white transition-all"
                      aria-label="Regenerar respuesta"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regenerar</span>
                    </button>
                  )}

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                      isBookmarked
                        ? 'text-[#E85A2C] bg-[#E85A2C]/10 border border-[#E85A2C]/30'
                        : 'text-white/60 bg-white/5 border border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                    aria-label={isBookmarked ? "Quitar de guardados" : "Guardar mensaje"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    <span>{isBookmarked ? 'Guardado' : 'Guardar'}</span>
                  </button>

                  {/* Download PDF Button - only for meal plans */}
                  {isMealPlan && (
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#E85A2C] hover:bg-[#D14E22] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
                      aria-label={isDownloading ? "Generando PDF..." : "Descargar PDF"}
                      aria-busy={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{isDownloading ? 'Generando...' : 'PDF'}</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Error Details */}
          {isError && message.errorMessage && (
            <p className="text-sm text-red-300 mt-2 pt-2 border-t border-red-500/20">
              {message.errorMessage}
            </p>
          )}

          {/* Retry Button */}
          {isError && message.canRetry && onRetry && (
            <button
              onClick={() => onRetry(message.id)}
              className="mt-3 flex items-center gap-2 text-sm text-red-300 hover:text-red-200 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          )}
        </div>

        <span className={`text-[11px] ${isError ? 'text-red-400/60' : 'text-white/30'} mt-1.5 ${isUser ? 'text-right' : 'text-left'} px-1`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* User Avatar - Alba style */}
      {isUser && (
        <div className="w-8 h-8 border border-[#E85A2C]/30 bg-[#E85A2C] flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-black" />
        </div>
      )}
    </motion.div>
  )
})
