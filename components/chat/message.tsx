"use client"

import { useState, memo } from "react"
import { motion } from "framer-motion"
import { Leaf, User, RefreshCw, AlertCircle, Copy, Download, Share2, Bookmark, BookmarkCheck, RotateCcw } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useToast } from "@/components/ui/toast"

interface UIMessage {
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
}

export const ChatMessage = memo(function ChatMessage({ message, index, onRetry, onRegenerate }: MessageProps) {
  const isUser = message.role === "user"
  const isError = message.isError || false
  const [isDownloading, setIsDownloading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { showToast } = useToast()

  // Detect if message is a meal plan (contains specific markers)
  const isMealPlan = !isUser && (
    // Check for meal plan structure: daily limits + meal sections
    (message.content.includes('Límites Diarios') || message.content.includes('📊')) &&
    (message.content.includes('Desayuno') || message.content.includes('Plan Semanal') || message.content.includes('🌅'))
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      showToast("Mensaje copiado al portapapeles", "success")
    } catch {
      showToast("Error al copiar", "error")
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Información de Nutrición Renal',
          text: message.content,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(message.content)
        showToast("Enlace copiado para compartir", "success")
      }
    } catch {
      // User cancelled share - ignore
    }
  }

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id)
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // In a real app, this would save to localStorage or backend
    const bookmarks = JSON.parse(localStorage.getItem('chat-bookmarks') || '[]')
    if (!isBookmarked) {
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
  }

  const handleDownloadPDF = async () => {
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

      // Get PDF blob
      const blob = await response.blob()

      // Create download link
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
  }

  return (
    <motion.div
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
      initial={{ opacity: 0, x: isUser ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className={`w-8 h-8 rounded-full border-2 ${isError ? 'border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950' : 'border-medical-100 dark:border-medical-800 bg-white dark:bg-gray-800'} flex items-center justify-center flex-shrink-0`}>
          {isError ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Leaf className="w-4 h-4 text-medical-500 dark:text-medical-400" />
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex flex-col max-w-[80%]">
        <div
          className={`
            ${isUser
              ? 'bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl rounded-br-md shadow-lg shadow-medical-500/30'
              : isError
              ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-md shadow-sm'
              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md shadow-md'
            }
            px-5 py-4
          `}
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-white font-medium">
              {message.content}
            </p>
          ) : (
            <>
              <div
                className={`
                  prose prose-sm max-w-none dark:prose-invert
                  ${isError ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}
                  prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
                  prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
                  prose-p:my-3 prose-p:leading-relaxed
                  prose-ul:my-4 prose-ul:space-y-1.5
                  prose-ol:my-4 prose-ol:space-y-1.5
                  prose-li:my-1 prose-li:leading-relaxed
                  prose-hr:my-8 prose-hr:border-gray-200 dark:prose-hr:border-gray-700
                `}
                style={{
                  '--tw-prose-bullets': '#374151',
                } as React.CSSProperties}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-6 pb-3 border-b-2 border-gray-300" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-semibold text-gray-900 mt-6 mb-3" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-1" {...props} />,
                    a: ({node, href, children, ...props}) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-medical-600 hover:text-medical-700 underline font-medium"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    strong: ({node, children, ...props}) => {
                      const text = String(children);
                      // If bold text ends with a colon, render as a block heading
                      if (text.endsWith(':')) {
                        return <strong className="block mt-4 mb-2 text-gray-900 font-semibold" {...props}>{children}</strong>;
                      }
                      return <strong className="text-gray-900 font-semibold" {...props}>{children}</strong>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Action Buttons - only for non-error bot messages */}
              {!isError && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-105"
                    aria-label="Copiar mensaje"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-105"
                    aria-label="Compartir mensaje"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir</span>
                  </button>

                  {onRegenerate && (
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-105"
                      aria-label="Regenerar respuesta"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Regenerar</span>
                    </button>
                  )}

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all hover:scale-105 ${
                      isBookmarked
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-label={isBookmarked ? "Quitar de guardados" : "Guardar mensaje"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    <span>{isBookmarked ? 'Guardado' : 'Guardar'}</span>
                  </button>

                  {/* Download PDF Button - only for meal plans */}
                  {isMealPlan && (
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
                      aria-label="Descargar PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloading ? 'Generando...' : 'Descargar PDF'}</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Error Details */}
          {isError && message.errorMessage && (
            <p className="text-sm text-red-600 mt-2 border-t border-red-200 pt-2">
              {message.errorMessage}
            </p>
          )}

          {/* Retry Button */}
          {isError && message.canRetry && onRetry && (
            <button
              onClick={() => onRetry(message.id)}
              className="mt-3 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          )}
        </div>

        <span className={`text-[11px] ${isError ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'} mt-1.5 ${isUser ? 'text-right' : 'text-left'} px-1`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full border-2 border-medical-100 dark:border-medical-800 bg-medical-500 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  )
})
