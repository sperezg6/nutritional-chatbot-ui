'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { GradientBlobBg } from '@/components/ui/gradient-blob-bg';

// Lazy load Three.js component to reduce initial bundle size (kept for optional use)
const DottedSurface = dynamic(
  () => import('@/components/ui/dotted-surface').then(mod => ({ default: mod.DottedSurface })),
  { ssr: false }
);

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

// Welcome message
const welcomeMessage = "Hola 👋 ¿En qué puedo asistirte?";

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
  // Spread indices across the array to show variety (array has 29 items)
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
    if (prefersReducedMotion) return; // Don't rotate if user prefers reduced motion

    const intervals: NodeJS.Timeout[] = [];

    // Create an interval for each position with different timing
    promptIndices.forEach((_, position) => {
      const interval = setInterval(() => {
        setPromptIndices(prev => {
          const newIndices = [...prev];
          // Move to next prompt in the pool, wrapping around
          newIndices[position] = (newIndices[position] + 1) % allPrompts.length;
          return newIndices;
        });
      }, rotationIntervals[position]);

      intervals.push(interval);
    });

    // Cleanup all intervals on unmount
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
      className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 pt-20 pb-8 sm:px-6 sm:pt-12 sm:pb-12 relative overflow-hidden"
    >
      {/* Alba Gradient Blob Background */}
      <GradientBlobBg opacity={0.5} />

      <div className="max-w-6xl w-full text-center relative z-10">
        {/* Title & Subtitle - exits first */}
        <motion.div
          variants={{
            initial: { opacity: 1, y: 0 },
            animate: { opacity: 1, y: 0 },
            exit: {
              opacity: 0,
              y: -20,
              transition: {
                duration: 0.25,
                ease: [0.4, 0.0, 0.2, 1]
              }
            }
          }}
        >
          {/* Welcome Message */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 tracking-tight leading-tight px-2">
            <span>Hola 👋</span>
            <br />
            <span>¿En qué puedo </span>
            <span className="bg-gradient-to-r from-medical-500 to-medical-400 bg-clip-text text-transparent">
              asistirte?
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 sm:mb-10 md:mb-12 px-2">
            Tu asistente de{' '}
            <span className="text-medical-600 dark:text-medical-400 font-medium">
              nutrición renal
            </span>
          </p>
        </motion.div>

        {/* Rotating Prompt Buttons - 4 on mobile, 6 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 max-w-3xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
          {visiblePromptIndices.map((promptIndex, position) => {
            const prompt = allPrompts[promptIndex % allPrompts.length];
            if (!prompt) return null;
            return (
              <div key={position} className="relative min-h-[44px] sm:min-h-[48px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${position}-${promptIndex}`}
                    initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={!prefersReducedMotion ? { opacity: 0, y: -10 } : {}}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    className="absolute inset-0"
                  >
                    <LiquidButton
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left px-3 py-2.5 sm:px-5 sm:py-4 text-sm sm:text-base text-gray-700 font-medium min-h-[44px] sm:min-h-[48px] w-full"
                    >
                      {prompt}
                    </LiquidButton>
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Input Field - subtle fade */}
        <motion.div
          variants={{
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: {
              opacity: 0.6,
              transition: {
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
                delay: 0.2
              }
            }
          }}
          className="max-w-3xl mx-auto px-2 sm:px-0"
        >
          <motion.div
            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm transition-all"
            animate={isFocused ? {
              scale: 1.02,
              borderColor: '#1A4D5C',
              boxShadow: '0 0 0 3px rgba(26, 77, 92, 0.15)',
            } : {
              scale: 1,
              borderColor: 'var(--border-color, #e5e7eb)',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isMobile ? "Escribe tu pregunta..." : "Escribe tu pregunta sobre nutrición renal aquí..."}
              className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 bg-medical-500 hover:bg-medical-600 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-medical-500/25"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </motion.div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          variants={{
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: {
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: [0.4, 0.0, 0.2, 1],
                delay: 0.3
              }
            }
          }}
          className="text-xs text-gray-600 dark:text-gray-400 mt-6 sm:mt-8 md:mt-10 max-w-2xl mx-auto px-4"
        >
          Este chatbot proporciona información educativa únicamente. Siempre consulta con tu médico antes de realizar cambios en tu dieta.
        </motion.p>
      </div>
    </motion.div>
  );
}
