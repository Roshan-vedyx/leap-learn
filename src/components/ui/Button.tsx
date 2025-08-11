import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Button variants optimized for neurodivergent accessibility
const buttonVariants = cva(
  // Base styles with accessibility features - Updated for professional look
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-ocean-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-touch min-w-touch cursor-pointer font-primary",
  {
    variants: {
      variant: {
        default:
          "bg-deep-ocean-blue text-white shadow-soft hover:bg-deep-ocean-blue/90 active:bg-deep-ocean-blue/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border border-gray-300 bg-transparent text-warm-charcoal shadow-sm hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
        secondary:
          "bg-white border border-gray-200 text-warm-charcoal shadow-sm hover:bg-gray-50 active:bg-gray-100",
        ghost: 
          "hover:bg-gray-100 hover:text-warm-charcoal active:bg-gray-200",
        link: 
          "text-deep-ocean-blue underline-offset-4 hover:underline focus:underline min-h-auto min-w-auto",
        // Updated Neurodivergent-specific variants with professional styling
        calm:
          "bg-gradient-to-br from-soft-lavender/20 to-soft-lavender/10 text-deep-ocean-blue border border-soft-lavender/30 hover:bg-soft-lavender/30 active:bg-soft-lavender/40 shadow-gentle",
        'high-contrast':
          "bg-contrast-high text-contrast-low border-2 border-contrast-low hover:bg-gray-800 active:bg-gray-900 font-semibold",
        celebration:
          "bg-gradient-to-r from-sage-green to-deep-ocean-blue text-white shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl",
        // Touch-friendly sizes for different motor abilities
        comfortable: "h-14 px-8 py-4 text-lg",
        'extra-large': "h-18 px-12 py-6 text-xl",
        icon: "h-12 w-12 p-0", // Square for icons, minimum touch target
      },
      // Emotional regulation support - Updated for professional look
      mood: {
        neutral: "",
        energetic: "animate-subtle-bounce",
        calm: "shadow-gentle",
        focused: "ring-2 ring-deep-ocean-blue ring-offset-2",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      mood: "neutral",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  'aria-label'?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    mood, 
    asChild = false, 
    loading = false,
    children,
    disabled,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Ensure disabled state when loading
    const isDisabled = disabled || loading
    
    // Auto-generate aria-label if not provided and content is not text
    const shouldGenerateAriaLabel = !ariaLabel && React.isValidElement(children)
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, mood, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        role={asChild ? undefined : "button"}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
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
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
            {typeof children === 'string' ? children : 'Loading...'}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }