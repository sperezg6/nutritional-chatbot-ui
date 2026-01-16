"use client"

import { useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Download, Maximize2, Minimize2, Share2 } from "lucide-react"
import { LazyMarkdownGfm } from "@/components/chat/lazy-markdown"
import { useToast } from "@/components/ui/toast"

interface ContentPanelProps {
  isOpen: boolean
  onClose: () => void
  content: string | null
  title?: string
  onDownloadPDF?: () => void
  isMealPlan?: boolean
}

export function ContentPanel({
  isOpen,
  onClose,
  content,
  title = "Contenido expandido",
  onDownloadPDF,
  isMealPlan = false,
}: ContentPanelProps) {
  const { showToast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleCopy = useCallback(async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      showToast("Contenido copiado al portapapeles", "success")
    } catch {
      showToast("Error al copiar", "error")
    }
  }, [content, showToast])

  const handleShare = useCallback(async () => {
    if (!content) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Información de Alba - Nutrición Renal",
          text: content,
        })
      } else {
        await navigator.clipboard.writeText(content)
        showToast("Enlace copiado para compartir", "success")
      }
    } catch {
      // User cancelled share - ignore
    }
  }, [content, showToast])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[640px] md:w-[800px] lg:w-[900px] xl:w-[1000px] bg-[#1E2A30] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-[#E85A2C]/10 border border-[#E85A2C]/30">
                  <Maximize2 className="w-4 h-4 text-[#E85A2C]" />
                </div>
                <h2 className="text-sm font-medium text-white/90 truncate max-w-[200px] sm:max-w-[300px]">
                  {title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Action buttons */}
                <button
                  onClick={handleCopy}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Copiar contenido"
                  title="Copiar"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Compartir"
                  title="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {isMealPlan && onDownloadPDF && (
                  <button
                    onClick={onDownloadPDF}
                    className="p-2 text-[#E85A2C] hover:bg-[#E85A2C]/10 transition-all"
                    aria-label="Descargar PDF"
                    title="Descargar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Cerrar panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-6 py-6"
            >
              {content && (
                <LazyMarkdownGfm
                  content={content}
                  className={`
                    prose prose-sm max-w-none prose-invert
                    text-white/80
                    prose-headings:font-light prose-headings:text-white
                    prose-h1:text-2xl prose-h1:mt-0 prose-h1:mb-6 prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
                    prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                    prose-p:my-3 prose-p:leading-relaxed prose-p:text-[15px]
                    prose-ul:my-4 prose-ul:space-y-2 prose-ul:list-none
                    prose-ol:my-4 prose-ol:space-y-2 prose-ol:list-none
                    prose-li:my-1 prose-li:leading-relaxed prose-li:pl-0 prose-li:text-[15px]
                    prose-hr:my-8 prose-hr:border-white/10
                    prose-strong:text-white prose-strong:font-medium
                    prose-a:text-[#E85A2C] prose-a:no-underline hover:prose-a:underline
                    prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#E85A2C]
                    prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
                    prose-table:border-collapse
                    prose-th:border prose-th:border-white/20 prose-th:px-3 prose-th:py-2 prose-th:bg-white/5
                    prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2
                  `}
                />
              )}
            </div>

            {/* Footer with keyboard hint */}
            <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40">
                Presiona <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60 mx-1">Esc</kbd> para cerrar
              </span>
              {isMealPlan && onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E85A2C] hover:bg-[#D14E22] text-black text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ContentPanel
