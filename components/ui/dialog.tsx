"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => onOpenChange?.(false)}
          />
          <div className="relative z-50">{children}</div>
        </div>
      )}
    </>
  )
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
  onClose?: () => void
}

const DialogContent = ({ className, children, onClose }: DialogContentProps) => {
  return (
    <div
      className={cn(
        "relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

const DialogHeader = ({ className, children }: DialogHeaderProps) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

const DialogTitle = ({ className, children }: DialogTitleProps) => {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white", className)}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const DialogDescription = ({ className, children }: DialogDescriptionProps) => {
  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
      {children}
    </p>
  )
}

interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

const DialogFooter = ({ className, children }: DialogFooterProps) => {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
      {children}
    </div>
  )
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
