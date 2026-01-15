"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface RatingInteractionProps {
  onChange?: (rating: number) => void
  className?: string
}

const ratingData = [
  { emoji: "😔", label: "Terrible", value: 1 },
  { emoji: "😕", label: "Pobre", value: 2 },
  { emoji: "😐", label: "Normal", value: 3 },
  { emoji: "🙂", label: "Bueno", value: 4 },
  { emoji: "😍", label: "Excelente", value: 5 },
]

export function RatingInteraction({ onChange, className }: RatingInteractionProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value: number) => {
    setRating(value)
    onChange?.(value)
  }

  const displayRating = hoverRating || rating
  const activeData = displayRating > 0 ? ratingData[displayRating - 1] : null

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Emoji rating buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {ratingData.map((item) => {
          const isSelected = rating === item.value
          const isHovered = hoverRating === item.value
          const isActive = displayRating >= item.value

          return (
            <button
              key={item.value}
              onClick={() => handleClick(item.value)}
              onMouseEnter={() => setHoverRating(item.value)}
              onMouseLeave={() => setHoverRating(0)}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-all duration-300 ease-out",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                isSelected && "bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]",
                !isSelected && isHovered && "bg-gray-100 dark:bg-gray-800"
              )}
              aria-label={`Calificar ${item.value}: ${item.label}`}
            >
              <span
                className={cn(
                  "text-3xl sm:text-4xl transition-all duration-300 ease-out select-none",
                  isActive || isHovered
                    ? "grayscale-0 scale-110"
                    : "grayscale-[0.5] opacity-60 hover:opacity-80 hover:grayscale-[0.2]"
                )}
              >
                {item.emoji}
              </span>
            </button>
          )
        })}
      </div>

      {/* Rating label */}
      <div className="h-6 flex items-center justify-center">
        {activeData ? (
          <span className="text-sm font-medium text-[var(--color-text)] dark:text-white animate-fade-in">
            {activeData.label}
          </span>
        ) : (
          <span className="text-sm text-[var(--color-muted)] dark:text-gray-400">
            Selecciona una calificación
          </span>
        )}
      </div>
    </div>
  )
}
