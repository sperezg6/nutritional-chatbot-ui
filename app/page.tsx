"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, MessageSquare, ArrowUpRight } from "lucide-react"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { FeedbackModal } from "@/components/chat/feedback-modal"
import { HistoryPanel } from "@/components/chat/history-panel"
import { generateSessionId } from "@/lib/session"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Check if user has seen disclaimer
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hasSeenDisclaimer")
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true)
    }
  }, [])

  const handleDisclaimerClose = () => {
    localStorage.setItem("hasSeenDisclaimer", "true")
    setShowDisclaimer(false)
  }

  const handleSendMessage = (message: string) => {
    // Navigate to 'new' - backend will create session on first message
    router.push(`/chat/new?firstMessage=${encodeURIComponent(message)}`)
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAF7]">
      {/* Alba-style Minimal Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 lg:px-16 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left - History button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Ver historial"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Historial</span>
          </button>

          {/* Center - Logo */}
          <a
            href="https://albadialisis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-gray-600 transition-colors"
          >
            ALBA
          </a>

          {/* Right - Feedback */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#4DBDC9] transition-colors"
            aria-label="Dar feedback"
          >
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Feedback</span>
          </button>
        </div>
      </motion.header>

      <WelcomeScreen onPromptClick={handleSendMessage} isExiting={false} />

      {/* Disclaimer Dialog - Alba styled */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent
          onClose={handleDisclaimerClose}
          className="bg-[#2B3A42] border border-white/10 text-white max-w-lg"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#4DBDC9]" />
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Aviso Importante
              </span>
            </div>
            <DialogTitle className="text-2xl font-light text-white">
              Información Médica
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed mt-4 text-white/60">
              Este chatbot proporciona educación nutricional para la enfermedad renal.{" "}
              <strong className="text-white">NO es un sustituto de consejo médico profesional</strong>. Siempre
              consulta con tu nefrólogo o dietista registrado antes de realizar cambios
              en tu dieta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              onClick={handleDisclaimerClose}
              className="w-full bg-[#4DBDC9] hover:bg-[#3A9BA6] text-black font-semibold uppercase tracking-wider"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentConversationId={undefined}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        conversationId="welcome-screen"
      />
    </div>
  )
}
