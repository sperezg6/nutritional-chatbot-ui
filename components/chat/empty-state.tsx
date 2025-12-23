"use client"

import { motion } from "framer-motion"
import { Leaf, Utensils, FlaskConical, Apple, MessageCircle } from "lucide-react"

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void
}

const tips = [
  {
    icon: Utensils,
    title: "Planes de comidas",
    description: "Pide un plan semanal personalizado",
    prompt: "Crea un plan de comidas para esta semana",
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    icon: FlaskConical,
    title: "Resultados de laboratorio",
    description: "Ayuda a entender tus análisis",
    prompt: "¿Qué significa un nivel alto de creatinina?",
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Apple,
    title: "Alimentos permitidos",
    description: "Descubre qué puedes comer",
    prompt: "¿Qué frutas son seguras para mi dieta renal?",
    color: "text-green-500 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: MessageCircle,
    title: "Preguntas frecuentes",
    description: "Resuelve tus dudas comunes",
    prompt: "¿Cuánta agua debo tomar al día?",
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
]

export function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center mb-6"
      >
        <Leaf className="w-8 h-8 text-medical-500 dark:text-medical-400" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center"
      >
        ¿En qué puedo ayudarte hoy?
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md"
      >
        Soy tu asistente de nutrición renal. Puedo ayudarte con planes de comidas,
        interpretar resultados de laboratorio y responder tus preguntas sobre alimentación.
      </motion.p>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {tips.map((tip, index) => (
          <motion.button
            key={tip.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => onPromptClick(tip.prompt)}
            className={`flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800/50 hover:border-medical-300 dark:hover:border-medical-600
                       hover:shadow-md transition-all duration-200 text-left group cursor-pointer`}
          >
            <div className={`p-2 rounded-lg ${tip.bgColor} flex-shrink-0`}>
              <tip.icon className={`w-5 h-5 ${tip.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                {tip.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {tip.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-gray-400 dark:text-gray-500 mt-8 text-center max-w-md"
      >
        Recuerda: Esta información es educativa. Siempre consulta con tu médico
        antes de hacer cambios en tu dieta.
      </motion.p>
    </motion.div>
  )
}
