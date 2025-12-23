"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "./button"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      icon: "text-yellow-500",
      button: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  }

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mx-4">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start gap-4">
                <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${variantStyles[variant].icon}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 flex gap-3 justify-end bg-gray-50 dark:bg-gray-800/50">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2"
                >
                  {cancelText}
                </Button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${variantStyles[variant].button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
