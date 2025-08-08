import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Card variants for different neurodivergent needs
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        outline: "border-2 border-border",
        elevated: "shadow-md hover:shadow-lg",
        calm: "bg-autism-calm-mint border-autism-primary border-2 shadow-calm",
        'high-contrast': "bg-contrast-low border-contrast-high border-3 shadow-lg",
        celebration: "bg-gradient-to-br from-autism-calm-mint to-autism-calm-sky border-autism-primary border-2 shadow-gentle",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        comfortable: "p-8", // Extra comfortable spacing
      },
      interactive: {
        none: "",
        hover: "hover:shadow-md hover:scale-[1.01] cursor-pointer",
        focus: "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        full: "hover:shadow-md hover:scale-[1.01] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "font-semibold leading-tight tracking-tight text-xl md:text-2xl",
      // Dyslexia-friendly spacing
      "letter-spacing-wide",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-muted-foreground leading-relaxed",
      // Enhanced readability
      "text-base md:text-lg leading-7",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0 space-y-4", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between p-6 pt-4 gap-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized cards for different emotional states
export interface EmotionalCardProps extends CardProps {
  mood?: 'calm' | 'energetic' | 'focused' | 'neutral'
  accessibilityMode?: 'adhd' | 'dyslexia' | 'autism' | 'default'
}

const EmotionalCard = React.forwardRef<HTMLDivElement, EmotionalCardProps>(
  ({ mood = 'neutral', accessibilityMode = 'default', className, children, ...props }, ref) => {
    const moodClasses = {
      calm: "bg-autism-calm-mint border-autism-primary",
      energetic: "bg-gradient-to-br from-autism-calm-sky to-autism-calm-mint animate-gentle-bounce",
      focused: "ring-2 ring-autism-primary ring-offset-2",
      neutral: ""
    }

    const accessibilityClasses = {
      adhd: "border-3 border-adhd-accent bg-adhd-bg text-adhd-text",
      dyslexia: "bg-dyslexia-cream border-dyslexia-text font-dyslexia",
      autism: "bg-autism-neutral border-autism-primary",
      default: ""
    }

    return (
      <Card
        ref={ref}
        className={cn(
          moodClasses[mood],
          accessibilityClasses[accessibilityMode],
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )
  }
)
EmotionalCard.displayName = "EmotionalCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  EmotionalCard,
  cardVariants 
}