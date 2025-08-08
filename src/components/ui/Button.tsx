import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Button variants optimized for neurodivergent accessibility
const buttonVariants = cva(
  // Base styles with accessibility features
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-touch min-w-touch cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: 
          "text-primary underline-offset-4 hover:underline focus:underline min-h-auto min-w-auto",
        // Neurodivergent-specific variants
        calm:
          "bg-autism-calm-mint text-autism-primary border-2 border-autism-primary hover:bg-autism-calm-sky active:bg-autism-calm-sage shadow-gentle",
        'high-contrast':
          "bg-contrast-high text-contrast-low border-2 border-contrast-low hover:bg-gray-800 active:bg-gray-900 font-semibold",
        celebration:
          "bg-gradient-to-r from-autism-secondary to-autism-primary text-white shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-105 active:scale-95",
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
      // Emotional regulation support
      mood: {
        neutral: "",
        energetic: "animate-gentle-bounce",
        calm: "shadow-calm",
        focused: "ring-2 ring-autism-primary ring-offset-2",
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