"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed select-none";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
      outline: "border border-border bg-transparent text-foreground hover:bg-secondary active:scale-[0.98]",
      ghost: "bg-transparent text-foreground hover:bg-secondary active:scale-[0.98]",
      link: "bg-transparent text-foreground underline-offset-4 hover:underline",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs min-w-[44px]", // WCAG minimum bounds
      md: "h-11 px-6 text-sm min-w-[44px]", // Standard height
      lg: "h-12 px-8 text-base min-w-[44px]", // Hero buttons
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
