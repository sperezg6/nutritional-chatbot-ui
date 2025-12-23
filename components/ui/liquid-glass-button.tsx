'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const liquidButtonVariants = cva(
  'group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-600 backdrop-blur-sm transition-all duration-300 ease-out hover:border-gray-300/80 dark:hover:border-gray-500 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-medical-500/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white/40 dark:bg-gray-800/60',
        glass: 'bg-white/30 dark:bg-gray-800/50',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2',
        lg: 'h-14 px-8 py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(liquidButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Liquid glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Animated shine effect */}
        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

        {/* Content */}
        <span className="relative z-10 text-gray-700 dark:text-gray-100">{children}</span>
      </Comp>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export { LiquidButton, liquidButtonVariants };
