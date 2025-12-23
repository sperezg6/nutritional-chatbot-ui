"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, MessageSquare, Leaf } from "lucide-react"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { FeedbackModal } from "@/components/chat/feedback-modal"
import { HistoryPanel } from "@/components/chat/history-panel"
import { ThemeToggle } from "@/components/ui/theme-toggle"
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
    <div className="relative min-h-screen">
      {/* Minimal Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left - History */}
          <motion.button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Ver historial"
          >
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {/* Center - Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-10 h-10 bg-medical-500 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold text-medical-600 dark:text-medical-400">
              NutriRenal
            </span>
          </motion.div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setIsFeedbackOpen(true)}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Dar feedback"
            >
              <Star className="w-5 h-5 text-yellow-500" />
            </motion.button>
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <WelcomeScreen onPromptClick={handleSendMessage} isExiting={false} />

      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent onClose={handleDisclaimerClose}>
          <DialogHeader>
            <DialogTitle className="text-xl">Aviso Médico Importante</DialogTitle>
            <DialogDescription className="text-base leading-relaxed mt-4">
              Este chatbot proporciona educación nutricional para la enfermedad renal. {" "}
              <strong>NO es un sustituto de consejo médico profesional</strong>. Siempre
              consulta con tu nefrólogo o dietista registrado antes de realizar cambios
              en tu dieta. La información proporcionada es solo con fines educativos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button onClick={handleDisclaimerClose} className="w-full sm:w-auto">
              Entiendo
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
