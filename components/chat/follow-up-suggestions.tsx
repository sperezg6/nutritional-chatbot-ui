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

// Topic detection with weighted scoring
interface TopicMatch {
  topic: string
  score: number
  keywords: string[]
}

// Detect which topics are covered in the response
function detectTopics(content: string): TopicMatch[] {
  const contentLower = content.toLowerCase()
  const topics: TopicMatch[] = []

  const topicKeywords: Record<string, string[]> = {
    'meal_plan': ['plan', 'menú', 'semana', 'día 1', 'día 2', 'desayuno', 'almuerzo', 'cena', 'colación'],
    'potassium': ['potasio', 'plátano', 'banana', 'tomate', 'papa', 'aguacate', 'naranja'],
    'phosphorus': ['fósforo', 'fosforo', 'lácteos', 'queso', 'leche', 'quelante'],
    'sodium': ['sodio', 'sal', 'hipertensión', 'presión', 'condimento'],
    'protein': ['proteína', 'proteina', 'carne', 'pollo', 'pescado', 'huevo', 'legumbres'],
    'recipes': ['receta', 'preparar', 'cocinar', 'ingredientes', 'preparación', 'mezcla'],
    'fruits_vegetables': ['fruta', 'verdura', 'vegetal', 'manzana', 'pera', 'zanahoria', 'lechuga'],
    'liquids': ['agua', 'líquido', 'bebida', 'sed', 'hidratación'],
    'dialysis': ['diálisis', 'dialisis', 'hemodiálisis', 'peritoneal', 'sesión'],
    'lab_results': ['laboratorio', 'creatinina', 'tfg', 'filtración', 'análisis', 'valores'],
    'snacks': ['snack', 'merienda', 'antojo', 'colación', 'entre comidas'],
    'kidney_disease': ['renal', 'riñón', 'riñones', 'erc', 'enfermedad renal', 'etapa'],
    'supplements': ['suplemento', 'vitamina', 'hierro', 'calcio', 'vitamina d'],
    'eating_out': ['restaurante', 'comer fuera', 'opciones', 'menú'],
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matchedKeywords = keywords.filter(kw => contentLower.includes(kw))
    if (matchedKeywords.length > 0) {
      topics.push({
        topic,
        score: matchedKeywords.length,
        keywords: matchedKeywords,
      })
    }
  }

  // Sort by score (most relevant topics first)
  return topics.sort((a, b) => b.score - a.score)
}

// Context-aware follow-up suggestions based on what was discussed
const contextualFollowUps: Record<string, string[]> = {
  'meal_plan': [
    "¿Puedo sustituir algún ingrediente del plan?",
    "¿Cómo adapto este plan si trabajo fuera de casa?",
    "¿Qué snacks puedo agregar entre comidas?",
    "Dame las recetas detalladas de este plan",
  ],
  'potassium': [
    "¿Cómo reducir el potasio al cocinar vegetales?",
    "Dame una lista de frutas bajas en potasio",
    "¿Cuáles son los síntomas de potasio alto?",
    "Alternativas bajas en potasio para estos alimentos",
  ],
  'phosphorus': [
    "¿Cómo identificar fósforo oculto en etiquetas?",
    "¿Cuándo debo tomar los quelantes de fósforo?",
    "Alternativas de lácteos bajas en fósforo",
    "¿Qué aditivos contienen fósforo?",
  ],
  'sodium': [
    "Dame opciones de condimentos sin sal",
    "¿Cómo dar sabor sin usar sal?",
    "¿Qué alimentos procesados debo evitar?",
    "Hierbas y especias recomendadas",
  ],
  'protein': [
    "¿Cuánta proteína necesito según mi etapa?",
    "Opciones de proteína vegetal permitidas",
    "¿El huevo es buena fuente de proteína para mí?",
    "¿Cómo distribuir la proteína en el día?",
  ],
  'recipes': [
    "¿Puedo congelar esta preparación?",
    "Dame más recetas similares",
    "¿Cómo hacer una versión más rápida?",
    "Sugerencias de acompañamientos",
  ],
  'fruits_vegetables': [
    "¿Cómo preparar vegetales para reducir potasio?",
    "¿Cuántas porciones de fruta al día?",
    "¿Puedo tomar jugos de fruta?",
    "Lista completa de vegetales permitidos",
  ],
  'liquids': [
    "Consejos para controlar la sed",
    "¿Qué bebidas están permitidas además del agua?",
    "¿El hielo cuenta como parte de mis líquidos?",
    "¿Cómo calcular mi límite de líquidos?",
  ],
  'dialysis': [
    "¿Qué comer antes de la diálisis?",
    "¿Cambia mi dieta los días de diálisis?",
    "Snacks prácticos para llevar a la sesión",
    "¿Cómo manejar el hambre durante la diálisis?",
  ],
  'lab_results': [
    "¿Qué valores debo vigilar más de cerca?",
    "¿Con qué frecuencia debo hacer análisis?",
    "¿Cómo mejorar mis valores con la dieta?",
    "Explica qué significa cada valor",
  ],
  'snacks': [
    "Más opciones de snacks dulces permitidos",
    "Snacks prácticos para llevar al trabajo",
    "Ideas de snacks para la noche",
    "¿Cuántos snacks puedo comer al día?",
  ],
  'kidney_disease': [
    "¿Qué puedo hacer para retrasar la progresión?",
    "¿Cómo afecta la dieta a mi función renal?",
    "Cambios de estilo de vida recomendados",
    "¿Cuándo debería consultar con mi nefrólogo?",
  ],
  'supplements': [
    "¿Qué suplementos debo evitar?",
    "¿Necesito tomar vitamina D?",
    "¿Los suplementos de hierro son seguros?",
    "¿Puedo tomar multivitamínicos?",
  ],
  'eating_out': [
    "¿Qué pedir en un restaurante mexicano?",
    "Consejos para fiestas y eventos sociales",
    "¿Cómo manejar la comida rápida?",
    "Preguntas que hacer al mesero",
  ],
}

// Suggestions that naturally extend the conversation
const extensionSuggestions: Record<string, string[]> = {
  'meal_plan': [
    "¿Cómo ajusto las porciones para mi peso?",
    "Plan para el fin de semana",
  ],
  'recipes': [
    "¿Qué otros platillos puedo hacer con estos ingredientes?",
    "Recetas para ocasiones especiales",
  ],
  'general': [
    "¿Qué debo comprar en el supermercado?",
    "¿Cómo leer las etiquetas nutricionales?",
    "Consejos para preparar comidas con anticipación",
  ],
}

// Helper function to generate context-aware follow-up suggestions
export function generateFollowUpSuggestions(content: string): string[] {
  const detectedTopics = detectTopics(content)
  const suggestions: string[] = []
  const usedSuggestions = new Set<string>()

  // Add suggestions from the top 2 detected topics
  const topTopics = detectedTopics.slice(0, 2)

  for (const topicMatch of topTopics) {
    const topicSuggestions = contextualFollowUps[topicMatch.topic] || []
    // Pick 2 suggestions from each top topic
    for (const suggestion of topicSuggestions.slice(0, 2)) {
      if (!usedSuggestions.has(suggestion)) {
        suggestions.push(suggestion)
        usedSuggestions.add(suggestion)
      }
      if (suggestions.length >= 3) break
    }
  }

  // Add extension suggestions if we have a clear topic
  if (topTopics.length > 0 && suggestions.length < 4) {
    const primaryTopic = topTopics[0].topic
    const extensions = extensionSuggestions[primaryTopic] || extensionSuggestions['general']
    for (const ext of extensions) {
      if (!usedSuggestions.has(ext) && suggestions.length < 4) {
        suggestions.push(ext)
        usedSuggestions.add(ext)
      }
    }
  }

  // Fill remaining spots with general suggestions if needed
  if (suggestions.length < 3) {
    const generalSuggestions = [
      "¿Qué alimentos debo evitar en general?",
      "Dame un ejemplo de menú diario",
      "¿Qué puedo comer como snack?",
      "Consejos para comer fuera de casa",
    ]
    for (const suggestion of generalSuggestions) {
      if (!usedSuggestions.has(suggestion) && suggestions.length < 4) {
        suggestions.push(suggestion)
        usedSuggestions.add(suggestion)
      }
    }
  }

  return suggestions.slice(0, 4)
}
