"use client"

import { useState } from "react"
import { RatingInteraction } from "@/components/ui/emoji-rating"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

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
      <DialogContent className="sm:max-w-[500px]">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-center">
                ¿Cómo fue tu experiencia?
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Tu retroalimentación nos ayuda a mejorar el asistente de nutrición
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <RatingInteraction onChange={setRating} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Comentarios adicionales (opcional)
              </label>
              <Textarea
                placeholder="Cuéntanos más sobre tu experiencia..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-8">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="bg-medical-500 hover:bg-medical-600"
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¡Gracias por tu retroalimentación!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tu opinión nos ayuda a mejorar
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
