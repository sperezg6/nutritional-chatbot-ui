'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const FlowFieldBackground = dynamic(() => import('@/components/ui/flow-field-background'), { ssr: false });

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Pool of all available prompts
const allPrompts = [
  // Alba - About the clinic
  "¿Qué es Alba Diálisis?",
  "¿Quiénes son los doctores de Alba?",
  "¿Dónde están las clínicas de Alba?",
  "¿Qué servicios ofrece Alba?",
  "¿Cómo puedo agendar una cita?",
  "¿Quién es la Dra. María Gutiérrez?",

  // General nutrition
  "¿Qué alimentos debo evitar?",
  "Ayúdame a planear mis comidas",
  "¿Qué puedo comer con enfermedad renal?",
  "Recetas bajas en potasio",
  "¿Cuánta proteína necesito?",

  // Meal planning
  "Ideas para el desayuno",
  "Recetas bajas en sodio",
  "¿Cómo controlar el fósforo?",
  "Plan de comidas semanal",
  "Snacks saludables para dieta renal",
  "¿Qué frutas puedo comer?",

  // Hydration and monitoring
  "¿Cómo bajar el potasio?",
  "Control de líquidos",
  "¿Cuándo consultar al médico?",

  // Specific dietary needs
  "Alternativas a la leche",
  "Proteínas bajas en fósforo",
  "¿Puedo comer aguacate?",
  "Recetas sin sal",
  "Alimentos ricos en hierro",
  "¿Qué verduras son seguras?",

  // Educational - kidney disease understanding
  "¿Qué son los cálculos renales?",
  "¿Qué es la enfermedad renal crónica?",
  "¿Cuáles son las etapas de la ERC?",
  "¿Qué es la diálisis?",
  "¿Por qué debo limitar el potasio?",
  "¿Por qué el fósforo afecta mis huesos?",
  "¿Cómo funcionan los riñones?",
  "¿Qué causa la enfermedad renal?",
  "¿Puedo revertir el daño renal?",
];

// Different rotation intervals for each position (in milliseconds)
const rotationIntervals = [4000, 5500, 7000, 6000, 5000, 4500];

interface WelcomeScreenProps {
  onPromptClick: (text: string) => void;
  isExiting?: boolean;
}

export function WelcomeScreen({ onPromptClick, isExiting = false }: WelcomeScreenProps) {
  const [input, setInput] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  // Track current prompt index for each position (4 on mobile, 6 on desktop)
  const [promptIndices, setPromptIndices] = useState<number[]>([0, 5, 11, 16, 22, 27]);

  // Show fewer prompts on mobile
  const visiblePromptCount = isMobile ? 4 : 6;
  const visiblePromptIndices = promptIndices.slice(0, visiblePromptCount);

  // Check if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Set up rotation intervals for each prompt position
  useEffect(() => {
    if (prefersReducedMotion) return;

    const intervals: NodeJS.Timeout[] = [];

    promptIndices.forEach((_, position) => {
      const interval = setInterval(() => {
        setPromptIndices(prev => {
          const newIndices = [...prev];
          newIndices[position] = (newIndices[position] + 1) % allPrompts.length;
          return newIndices;
        });
      }, rotationIntervals[position]);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [prefersReducedMotion]);

  const handleSend = () => {
    if (input.trim()) {
      onPromptClick(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (text: string) => {
    onPromptClick(text);
  };

  return (
    <motion.div
      initial="initial"
      animate={isExiting ? "exit" : "animate"}
      exit="exit"
      className="min-h-screen bg-[#FAFAF7] flex flex-col px-6 md:px-12 lg:px-16 pt-24 pb-12 relative overflow-hidden"
    >
      {/* Flow field animation background */}
      <FlowFieldBackground particleCount={150} speed={0.5} trailOpacity={0.15} />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAFAF7]/50 pointer-events-none" />

      {/* Main content */}
      <div className="max-w-4xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        {/* Title section */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            exit: { opacity: 0, y: -20, transition: { duration: 0.25 } }
          }}
          className="mb-12 md:mb-16"
        >
          {/* Section indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#4DBDC9]" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Asistente Nutricional
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-4">
            Hola, ¿en qué puedo
            <br />
            <span className="text-[#4DBDC9]">asistirte</span> hoy?
          </h1>

          <p className="text-lg text-gray-500 max-w-xl">
            Tu guía personalizada de nutrición renal. Pregunta sobre dietas, alimentos permitidos y recomendaciones.
          </p>
        </motion.div>

        {/* Prompt buttons grid */}
        <motion.div
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } },
            exit: { opacity: 0, transition: { duration: 0.2 } }
          }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Preguntas sugeridas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visiblePromptIndices.map((promptIndex, position) => {
              const prompt = allPrompts[promptIndex % allPrompts.length];
              if (!prompt) return null;
              return (
                <div key={position} className="relative min-h-[56px]">
                  <AnimatePresence mode="wait">
                    <motion.button
                      key={`${position}-${promptIndex}`}
                      initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={!prefersReducedMotion ? { opacity: 0, y: -10 } : {}}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                      onClick={() => handlePromptClick(prompt)}
                      className="absolute inset-0 w-full text-left px-5 py-4 border border-gray-200 hover:border-[#4DBDC9]/50 hover:bg-gray-50 transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm md:text-base text-gray-600 group-hover:text-gray-900 transition-colors">
                          {prompt}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#4DBDC9] transition-colors flex-shrink-0" />
                      </div>
                    </motion.button>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Input field - push to bottom */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } },
            exit: { opacity: 0.6, transition: { duration: 0.3, delay: 0.2 } }
          }}
          className="mt-auto"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Tu pregunta
            </span>
          </div>

          <div
            className={`
              flex items-center gap-3 px-5 py-4 border transition-all duration-300
              ${isFocused
                ? 'border-[#4DBDC9] bg-white'
                : 'border-gray-200 hover:border-gray-400'
              }
            `}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isMobile ? "Escribe tu pregunta..." : "Escribe tu pregunta sobre nutrición renal aquí..."}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-base"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-5 py-2.5 bg-[#4DBDC9] hover:bg-[#3A9BA6] text-black text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Enviar mensaje"
            >
              <span className="hidden sm:inline">Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay: 0.5, duration: 0.4 } },
            exit: { opacity: 0, transition: { duration: 0.2, delay: 0.3 } }
          }}
          className="text-xs text-gray-400 mt-6 max-w-2xl"
        >
          Este chatbot proporciona información educativa únicamente. Siempre consulta con tu médico antes de realizar cambios en tu dieta.
        </motion.p>
      </div>
    </motion.div>
  );
}
