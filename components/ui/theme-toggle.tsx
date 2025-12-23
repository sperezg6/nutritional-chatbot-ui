'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />;
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    );
  };

  const getLabel = () => {
    if (theme === 'system') return 'Sistema';
    return theme === 'dark' ? 'Oscuro' : 'Claro';
  };

  return (
    <motion.button
      onClick={cycleTheme}
      className={`
        w-14 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-full shadow-xl flex items-center justify-center
        hover:scale-110 hover:shadow-2xl
        hover:bg-gray-50 dark:hover:bg-gray-700
        cursor-pointer z-50 transition-all duration-300
        text-gray-600 dark:text-gray-300
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={`Tema: ${getLabel()}`}
      aria-label={`Cambiar tema (actual: ${getLabel()})`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.2 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
