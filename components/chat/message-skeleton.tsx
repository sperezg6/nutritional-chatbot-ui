"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Leaf } from "lucide-react"
import { useState, useEffect } from "react"

// Progressive text states with time thresholds (in seconds)
const LOADING_STATES = [
  { threshold: 0, text: "Generando respuesta..." },
  { threshold: 6, text: "Analizando opciones..." },
  { threshold: 12, text: "Ya casi listo..." },
  { threshold: 18, text: "Un momento más..." },
] as const

interface MessageSkeletonProps {
  lines?: number
}

export function MessageSkeleton({ lines = 3 }: MessageSkeletonProps) {
  const [currentText, setCurrentText] = useState(LOADING_STATES[0].text)

  useEffect(() => {
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000

      const currentState = [...LOADING_STATES]
        .reverse()
        .find((state) => elapsed >= state.threshold)

      if (currentState) {
        setCurrentText(currentState.text)
      }
    }, 100)

    return () => clearInterval(interval)
  }, []) // Empty dependency - only run once on mount

  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Bot Avatar */}
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

      {/* Clean Message Bubble with Progressive Text */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          {/* Animated Dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-medical-400 dark:bg-medical-500 rounded-full"
                animate={{
                  y: [0, -5, 0],
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

          {/* Dynamic Text with Smooth Transitions */}
          <div className="relative h-5 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentText}
                className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap"
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
