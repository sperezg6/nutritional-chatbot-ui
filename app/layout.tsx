import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/lib/theme-context"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Asistente de Nutrición Renal",
  description: "Tu asistente de nutrición personalizado para el manejo de la enfermedad renal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
