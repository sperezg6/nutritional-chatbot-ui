import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          50: '#FEF3E7',
          100: '#FDDCCC',
          200: '#FABD99',
          300: '#F49B66',
          400: '#F4A261',       // Soft Coral
          500: '#E85A2C',       // Alba Orange
          600: '#C94A1F',       // Deeper Orange
          700: '#A63D18',
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Alba warm palette
        alba: {
          dark: '#2B3A42',              // Warm Charcoal
          'dark-light': '#364954',
          orange: '#E85A2C',
          'orange-light': '#F4A261',
          'orange-dark': '#C94A1F',
          sage: '#6B8E7D',              // Soft Sage
          'sage-light': '#8BA99A',
          cream: '#FAF9F6',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          50: '#E8F0ED',
          100: '#C5DDD4',
          200: '#A1CABB',
          300: '#8BA99A',       // Sage tones
          400: '#6B8E7D',
          500: '#567264',
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Medical green palette
        medical: {
          50: 'var(--medical-50)',
          100: 'var(--medical-100)',
          200: 'var(--medical-200)',
          300: 'var(--medical-300)',
          400: 'var(--medical-400)',
          500: 'var(--medical-500)',
          600: 'var(--medical-600)',
          700: 'var(--medical-700)',
          800: 'var(--medical-800)',
          900: 'var(--medical-900)',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeInUp: 'fadeInUp 0.8s ease-out',
        slideInLeft: 'slideInLeft 0.4s ease-out',
        slideInRight: 'slideInRight 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
