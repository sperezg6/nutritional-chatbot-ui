"use client"

import { motion } from "framer-motion"
import { Utensils, FlaskConical, Apple, Building2, ArrowUpRight } from "lucide-react"

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void
}

const tips = [
  {
    icon: Building2,
    title: "Conoce Alba",
    description: "Información sobre nuestras clínicas y doctores",
    prompt: "¿Qué es Alba Diálisis y dónde están sus clínicas?",
  },
  {
    icon: Utensils,
    title: "Planes de comidas",
    description: "Pide un plan semanal personalizado",
    prompt: "Crea un plan de comidas para esta semana",
  },
  {
    icon: FlaskConical,
    title: "Resultados de laboratorio",
    description: "Ayuda a entender tus análisis",
    prompt: "¿Qué significa un nivel alto de creatinina?",
  },
  {
    icon: Apple,
    title: "Alimentos permitidos",
    description: "Descubre qué puedes comer",
    prompt: "¿Qué frutas son seguras para mi dieta renal?",
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
      {/* Section indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-2 h-2 rounded-full bg-[#F59F20]" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Nueva conversación
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-light text-gray-900 mb-3 text-center"
      >
        ¿En qué puedo ayudarte hoy?
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 mb-10 text-center max-w-md"
      >
        Soy el asistente personal de Alba. Puedo ayudarte con tratamientos, sucursales,
        nutrición renal y responder tus preguntas sobre cuidado de los riñones.
      </motion.p>

      {/* Tips Grid - Alba style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {tips.map((tip, index) => (
          <motion.button
            key={tip.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => onPromptClick(tip.prompt)}
            className="group flex items-start gap-4 p-5 border border-gray-200 hover:border-[#F59F20]/50 hover:bg-gray-50 transition-all duration-300 text-left"
          >
            <div className="w-10 h-10 border border-gray-200 group-hover:border-[#F59F20]/30 bg-gray-50 group-hover:bg-[#F59F20]/10 flex items-center justify-center flex-shrink-0 transition-all">
              <tip.icon className="w-5 h-5 text-gray-500 group-hover:text-[#F59F20] transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-gray-700 group-hover:text-gray-900 text-sm transition-colors">
                  {tip.title}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#F59F20] transition-colors flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
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
        className="text-xs text-gray-400 mt-10 text-center max-w-md"
      >
        Recuerda: Esta información es educativa. Siempre consulta con tu médico
        antes de hacer cambios en tu dieta.
      </motion.p>
    </motion.div>
  )
}
