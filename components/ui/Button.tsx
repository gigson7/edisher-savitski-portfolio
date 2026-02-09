import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "rounded",
          {
            // Primary Variant - Gold outlined, elegant
            "border-2 border-gold-500 bg-transparent text-gold-600 hover:bg-gold-500 hover:text-neutral-900":
              variant === "primary",
            // Secondary Variant - Neutral outlined, subtle
            "border border-neutral-300 bg-transparent text-neutral-800 hover:border-gold-500 hover:text-gold-600":
              variant === "secondary",
            // Outline Variant - Darker neutral border
            "border border-neutral-400 bg-transparent text-neutral-700 hover:border-gold-600 hover:text-gold-600":
              variant === "outline",
            // Sizes - More generous padding
            "px-6 py-2 text-sm": size === "sm",
            "px-8 py-3 text-base": size === "md",
            "px-10 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
