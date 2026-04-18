"use client"

import { useState } from "react"
import { RatingInteraction } from "@/components/ui/emoji-rating"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CheckCircle2, Loader2 } from "lucide-react"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  conversationId?: string
}

export function FeedbackModal({ isOpen, onClose, conversationId }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      return
    }

    setIsSubmitting(true)

    try {
      // Send feedback to API
      // session_id can be undefined or "welcome-screen" for general feedback
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: conversationId || null,
          rating,
          comment: comment.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      setSubmitted(true)

      // Close modal after a brief delay
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch {
      // Still show success message to user (fail silently)
      setSubmitted(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment("")
    setSubmitted(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border border-[var(--color-border)] dark:border-gray-800 rounded-2xl">
        {!submitted ? (
          <div className="p-6 sm:p-8">
            <DialogHeader className="space-y-3 mb-8">
              <DialogTitle className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
                ¿Cómo fue tu experiencia?
              </DialogTitle>
              <DialogDescription className="text-center text-base text-[var(--color-muted)] dark:text-gray-400">
                Tu retroalimentación nos ayuda a mejorar el asistente Alba
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RatingInteraction onChange={setRating} />
            </div>

            <div className="space-y-2 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                placeholder="Cuéntanos más sobre tu experiencia..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 resize-none min-h-[100px] border-gray-200 dark:border-gray-700 hover:border-[var(--color-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="flex-1 px-5 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-16 px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <CheckCircle2 className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¡Gracias por tu retroalimentación!
            </h3>
            <p className="text-sm text-[var(--color-muted)] dark:text-gray-400">
              Tu opinión nos ayuda a mejorar
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
