"use client"

import * as React from "react"
import { Paperclip, Send, Square, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AIChatInputProps {
  onSend?: (message: string) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
}

export function AIChatInput({
  onSend,
  placeholder = "Ask about kidney-friendly recipes...",
  disabled = false,
  isLoading = false,
}: AIChatInputProps) {
  const [message, setMessage] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSend?.(message.trim())
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Auto-resize textarea
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <motion.div
        className={cn(
          "relative rounded-3xl bg-white border-2 transition-all duration-200",
          isFocused ? "border-gray-400 shadow-lg" : "border-gray-200 shadow-md"
        )}
        initial={false}
        animate={{
          boxShadow: isFocused
            ? "0 10px 30px rgba(0, 0, 0, 0.1)"
            : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="flex items-end gap-2 p-3">
          {/* Attachment Button */}
          <button
            type="button"
            disabled={disabled || isLoading}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className="w-full resize-none bg-transparent border-0 outline-none text-gray-900 placeholder:text-gray-400 text-base py-2 max-h-[200px] disabled:cursor-not-allowed"
              style={{ minHeight: "28px" }}
            />
          </div>

          {/* Voice Input Button */}
          <AnimatePresence mode="wait">
            {!message.trim() ? (
              <motion.button
                key="mic"
                type="button"
                disabled={disabled || isLoading}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Voice input"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Mic className="w-5 h-5 text-gray-600" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                type="button"
                onClick={handleSend}
                disabled={disabled || isLoading || !message.trim()}
                className={cn(
                  "flex-shrink-0 p-2 rounded-xl transition-all duration-200",
                  message.trim() && !disabled && !isLoading
                    ? "bg-medical-500 hover:bg-medical-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
                aria-label="Send message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {isLoading ? (
                  <Square className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Character count or status */}
        <AnimatePresence>
          {message.length > 0 && (
            <motion.div
              className="px-5 pb-2 text-xs text-gray-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {message.length} characters
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Helper text */}
      <div className="mt-2 text-center text-xs text-gray-500">
        Press Enter to send, Shift + Enter for new line
      </div>
    </div>
  )
}
