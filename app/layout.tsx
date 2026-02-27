import type { Metadata } from "next"
import { Nunito_Sans, Cardo } from "next/font/google"
import { ThemeProvider } from "@/lib/theme-context"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const cardo = Cardo({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Asistente de Nutrición Renal",
  description: "Tu asistente de nutrición personalizado para el manejo de la enfermedad renal",
  themeColor: "#4DBDC9",
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${nunitoSans.variable} ${cardo.variable}`} suppressHydrationWarning>
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
