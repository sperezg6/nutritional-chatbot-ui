"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  isVisible?: boolean
}

export function FollowUpSuggestions({ suggestions, onSelect, isVisible = true }: FollowUpSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-4 ml-0 md:ml-11"
    >
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 * index }}
            onClick={() => onSelect(suggestion)}
            className="group inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300
                       hover:text-medical-600 dark:hover:text-medical-400
                       hover:bg-medical-50/50 dark:hover:bg-medical-900/20 rounded-lg
                       transition-all duration-200 cursor-pointer"
          >
            <span>{suggestion}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-medical-500 group-hover:translate-x-0.5 transition-all" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// Helper to shuffle and pick random items
function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Helper function to generate follow-up suggestions based on message content
export function generateFollowUpSuggestions(content: string): string[] {
  const contentLower = content.toLowerCase()
  const suggestions: string[] = []

  // Snacks related
  if (contentLower.includes('snack') || contentLower.includes('merienda') || contentLower.includes('antojo')) {
    suggestions.push(
      "¿Qué snacks puedo llevar al trabajo?",
      "Opciones de snacks dulces permitidos",
      "Snacks para viajes largos",
      "Ideas de snacks para niños con enfermedad renal",
    )
  }

  // Meal plan related
  if (contentLower.includes('plan') || contentLower.includes('comida') || contentLower.includes('menú')) {
    suggestions.push(
      "¿Puedo sustituir algún ingrediente?",
      "¿Cómo preparo esto de forma rápida?",
      "¿Qué snacks puedo agregar entre comidas?",
      "Ajustar plan para más días",
    )
  }

  // Potassium related
  if (contentLower.includes('potasio') || contentLower.includes('plátano') || contentLower.includes('banana')) {
    suggestions.push(
      "¿Qué frutas tienen menos potasio?",
      "¿Cómo reducir el potasio al cocinar?",
      "¿Cuál es mi límite diario de potasio?",
      "Síntomas de potasio alto",
    )
  }

  // Phosphorus related
  if (contentLower.includes('fósforo') || contentLower.includes('fosforo')) {
    suggestions.push(
      "¿Qué alimentos evitar por el fósforo?",
      "¿Cómo identificar fósforo en etiquetas?",
      "Alternativas bajas en fósforo",
      "¿Los quelantes de fósforo ayudan?",
    )
  }

  // Sodium related
  if (contentLower.includes('sodio') || contentLower.includes('sal')) {
    suggestions.push(
      "¿Qué condimentos sin sal puedo usar?",
      "Recetas bajas en sodio",
      "¿Cuánta sal puedo consumir al día?",
      "Hierbas y especias para dar sabor",
    )
  }

  // Protein related
  if (contentLower.includes('proteína') || contentLower.includes('proteina') || contentLower.includes('carne')) {
    suggestions.push(
      "¿Qué proteínas son mejores para mí?",
      "¿Cuánta proteína necesito diario?",
      "Alternativas vegetales a la carne",
      "¿El huevo es buena opción?",
    )
  }

  // Lab results related
  if (contentLower.includes('laboratorio') || contentLower.includes('creatinina') || contentLower.includes('tfg')) {
    suggestions.push(
      "¿Con qué frecuencia debo hacer análisis?",
      "¿Qué valores debo vigilar?",
      "¿Cómo mejorar mi función renal naturalmente?",
      "¿Qué significa nivel alto de creatinina?",
    )
  }

  // Recipes related
  if (contentLower.includes('receta') || contentLower.includes('preparar') || contentLower.includes('cocinar')) {
    suggestions.push(
      "Más recetas similares",
      "¿Puedo congelar esta preparación?",
      "Versión más rápida de preparar",
      "Ideas para acompañamientos",
    )
  }

  // Fruits and vegetables
  if (contentLower.includes('fruta') || contentLower.includes('verdura') || contentLower.includes('vegetal')) {
    suggestions.push(
      "Lista completa de frutas permitidas",
      "¿Cómo preparar vegetales para reducir potasio?",
      "Porciones diarias recomendadas",
      "¿Puedo tomar jugos de fruta?",
    )
  }

  // Liquids/water related
  if (contentLower.includes('agua') || contentLower.includes('líquido') || contentLower.includes('sed')) {
    suggestions.push(
      "¿Cuánta agua puedo tomar al día?",
      "Consejos para controlar la sed",
      "¿Qué bebidas están permitidas?",
      "¿El hielo cuenta como líquido?",
    )
  }

  // Dialysis related
  if (contentLower.includes('diálisis') || contentLower.includes('dialisis') || contentLower.includes('hemodiálisis')) {
    suggestions.push(
      "¿Qué comer antes de la diálisis?",
      "Dieta para días de diálisis",
      "¿Cambio mi alimentación post-diálisis?",
      "Snacks para llevar a la sesión",
    )
  }

  // If we found specific suggestions, return 4 random ones
  if (suggestions.length > 0) {
    return shuffleAndPick(suggestions, Math.min(4, suggestions.length))
  }

  // Default suggestions for general nutrition advice
  const defaultSuggestions = [
    "¿Qué alimentos debo evitar en general?",
    "Dame un plan de comidas de ejemplo",
    "¿Qué suplementos podrían ayudarme?",
    "Consejos para comer fuera de casa",
    "¿Cómo manejar los antojos?",
    "Lista de compras recomendada",
  ]

  return shuffleAndPick(defaultSuggestions, 4)
}
