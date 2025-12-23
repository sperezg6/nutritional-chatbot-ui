"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Leaf } from "lucide-react"
import { useState, useEffect } from "react"

// Text progression states with their time thresholds (in seconds)
const TYPING_STATES = [
  { threshold: 0, text: "Analizando..." },
  { threshold: 2, text: "Pensando..." },
  { threshold: 4, text: "Preparando respuesta..." },
  { threshold: 6, text: "Casi listo..." },
  { threshold: 8, text: "Un momento más..." },
] as const

export function TypingIndicator() {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentText, setCurrentText] = useState<string>(TYPING_STATES[0].text)

  useEffect(() => {
    // Start timing from when component mounts
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 // Convert to seconds

      // Find the appropriate text based on elapsed time
      const currentState = [...TYPING_STATES]
        .reverse()
        .find((state) => elapsed >= state.threshold)

      if (currentState && currentState.text !== currentText) {
        setCurrentText(currentState.text)
      }

      setElapsedTime(elapsed)
    }, 100) // Check every 100ms for smooth transitions

    return () => clearInterval(interval)
  }, [currentText])

  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Leaf Avatar */}
      <div className="w-8 h-8 rounded-full border-2 border-medical-100 dark:border-medical-800 bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Leaf className="w-4 h-4 text-medical-500 dark:text-medical-400" />
        </motion.div>
      </div>

      {/* Message Bubble with Dynamic Text */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 min-w-[160px]">
        <div className="flex items-center gap-2">
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-medical-400 dark:bg-medical-500 rounded-full"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Dynamic Text with Fade Transitions */}
          <div className="relative h-5 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentText}
                className="text-[14px] text-gray-500 dark:text-gray-400 font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {currentText}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
