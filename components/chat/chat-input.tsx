"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Search, Sparkles, ArrowRight } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

// Predefined suggestions for renal nutrition topics
const suggestionCategories = [
  {
    prefix: "potasio",
    suggestions: [
      "¿Qué alimentos son altos en potasio?",
      "¿Cómo reducir el potasio en los vegetales?",
      "¿Cuánto potasio puedo consumir al día?",
      "Frutas bajas en potasio",
    ],
  },
  {
    prefix: "fósforo",
    suggestions: [
      "¿Qué alimentos evitar por el fósforo?",
      "¿Cómo leer etiquetas para detectar fósforo oculto?",
      "Alternativas bajas en fósforo",
      "¿Por qué debo limitar el fósforo?",
    ],
  },
  {
    prefix: "sodio",
    suggestions: [
      "¿Cuánta sal puedo consumir?",
      "Condimentos sin sodio",
      "¿Cómo cocinar sin sal?",
      "Alimentos procesados a evitar",
    ],
  },
  {
    prefix: "proteína",
    suggestions: [
      "¿Cuánta proteína necesito al día?",
      "Mejores fuentes de proteína para dieta renal",
      "¿Debo limitar la proteína?",
      "Alternativas a la carne",
    ],
  },
  {
    prefix: "plan",
    suggestions: [
      "Crea un plan de comidas semanal",
      "Plan de desayunos para la semana",
      "Plan de comidas bajo en potasio",
      "Plan de comidas para diálisis",
    ],
  },
  {
    prefix: "receta",
    suggestions: [
      "Recetas bajas en potasio",
      "Recetas sin sal",
      "Recetas fáciles para dieta renal",
      "Recetas de snacks saludables",
    ],
  },
  {
    prefix: "fruta",
    suggestions: [
      "¿Qué frutas puedo comer?",
      "Frutas bajas en potasio",
      "Frutas a evitar en dieta renal",
      "Porciones de frutas recomendadas",
    ],
  },
  {
    prefix: "agua",
    suggestions: [
      "¿Cuánta agua debo tomar al día?",
      "¿Cómo controlar la sed?",
      "Límite de líquidos en diálisis",
      "Consejos para reducir líquidos",
    ],
  },
  {
    prefix: "laboratorio",
    suggestions: [
      "¿Qué significa mi nivel de creatinina?",
      "Interpretar resultados de BUN",
      "¿Qué es la tasa de filtración glomerular?",
      "¿Con qué frecuencia debo hacer análisis?",
    ],
  },
]

// General suggestions when no specific match
const generalSuggestions = [
  "¿Qué puedo desayunar?",
  "Lista de alimentos permitidos",
  "¿Qué alimentos debo evitar?",
  "Consejos para comer fuera de casa",
  "¿Cómo manejar los antojos?",
]

function getSuggestions(input: string): string[] {
  const trimmed = input.toLowerCase().trim()

  if (!trimmed) return []

  // Check for category matches
  for (const category of suggestionCategories) {
    if (trimmed.includes(category.prefix) || category.prefix.includes(trimmed)) {
      return category.suggestions.filter(s =>
        s.toLowerCase().includes(trimmed) || trimmed.length < 3
      ).slice(0, 4)
    }
  }

  // Search across all suggestions
  const allSuggestions = [
    ...suggestionCategories.flatMap(c => c.suggestions),
    ...generalSuggestions,
  ]

  const matches = allSuggestions.filter(s =>
    s.toLowerCase().includes(trimmed)
  ).slice(0, 4)

  // If no matches found but input is short, show general suggestions
  if (matches.length === 0 && trimmed.length >= 2) {
    return generalSuggestions.slice(0, 4)
  }

  return matches
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 150) // Max 150px (~5 lines)
      textarea.style.height = `${newHeight}px`
    }
  }, [message])

  // Update suggestions when message changes
  useEffect(() => {
    const newSuggestions = getSuggestions(message)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0 && message.trim().length > 0)
    setSelectedIndex(-1)
  }, [message])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage("")
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault()
        handleSelectSuggestion(suggestions[selectedIndex])
        return
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    if (e.key === "Enter" && !e.shiftKey && selectedIndex < 0) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/98 dark:bg-gray-900/98 border-t border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-end gap-3 max-w-4xl mx-auto relative">
        {/* Input Container with Suggestions */}
        <div className="flex-1 relative">
          {/* Input Field */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 && message.trim().length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder="Escribe tu mensaje..."
            disabled={disabled}
            rows={1}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-[15px] text-gray-900 dark:text-white shadow-sm
                       focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-medical-400 focus:ring-2 focus:ring-medical-100 dark:focus:ring-medical-900/40
                       transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed
                       resize-none overflow-hidden min-h-[52px]"
          />

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Sugerencias
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer flex items-center gap-3 group/item
                        ${selectedIndex === index
                          ? "bg-medical-50 dark:bg-medical-900/30 text-medical-700 dark:text-medical-300"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                        selectedIndex === index
                          ? "text-medical-500 dark:text-medical-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`} />
                      <span className="flex-1">{suggestion}</span>
                      <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${
                        selectedIndex === index
                          ? "opacity-100 translate-x-0 text-medical-500 dark:text-medical-400"
                          : "opacity-0 -translate-x-2 text-gray-400"
                      }`} />
                    </button>
                  ))}
                </div>
                <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    Usa ↑↓ para navegar, Enter para seleccionar
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="w-12 h-12 bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center shadow-lg shadow-medical-500/30
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-500"
          whileHover={message.trim() && !disabled ? { scale: 1.05 } : {}}
          whileTap={message.trim() && !disabled ? { scale: 0.95 } : {}}
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    </div>
  )
}
