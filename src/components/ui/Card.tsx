import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Card variants with responsive design
const cardVariants = cva(
  // Base styles - mobile-first approach
  [
    "relative overflow-hidden rounded-lg border shadow-sm transition-all duration-200",
    "bg-card text-card-foreground",
    // Mobile: 320px+ optimized
    "w-full min-h-[120px]",
    "p-4 space-y-3",
    // Touch-friendly spacing and sizing
    "touch-manipulation",
  ],
  {
    variants: {
      variant: {
        default: [
          // Mobile
          "border-border bg-card hover:shadow-md",
          // Tablet: 768px+
          "md:hover:shadow-lg md:hover:-translate-y-0.5",
        ],
        outlined: [
          "border-2 border-border bg-transparent",
          "hover:border-primary hover:bg-accent/5",
          "md:hover:shadow-md",
        ],
        filled: [
          "border-primary/20 bg-primary/5",
          "hover:border-primary/40 hover:bg-primary/10",
          "md:hover:shadow-md",
        ],
        elevated: [
          // Mobile: subtle elevation
          "border-none shadow-md bg-card",
          // Tablet+: enhanced elevation
          "md:shadow-lg md:hover:shadow-xl",
        ],
        interactive: [
          "cursor-pointer transition-all duration-150",
          "hover:shadow-md active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "md:hover:shadow-lg md:hover:-translate-y-1",
        ],
      },
      size: {
        sm: [
          // Mobile: min touch target 44px
          "min-h-[44px] p-3 space-y-2 text-sm",
          // Tablet: slightly larger
          "md:min-h-[48px] md:p-4",
        ],
        default: [
          // Mobile: comfortable spacing
          "min-h-[120px] p-4 space-y-3",
          // Tablet: more generous spacing  
          "md:min-h-[140px] md:p-6 md:space-y-4",
          // Desktop: full spacing
          "lg:p-8 lg:space-y-5",
        ],
        lg: [
          "min-h-[160px] p-5 space-y-4",
          "md:min-h-[180px] md:p-7 md:space-y-5",
          "lg:p-9 lg:space-y-6",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Mobile: compact header
      "flex flex-col space-y-2 pb-3",
      // Tablet: more space
      "md:space-y-3 md:pb-4",
      // Desktop: generous spacing
      "lg:pb-6",
      className
    )}
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
      // Mobile: readable but compact
      "font-semibold leading-tight tracking-tight",
      "text-lg leading-6",
      // Tablet: larger text
      "md:text-xl md:leading-7",
      // Desktop: full size
      "lg:text-2xl lg:leading-8",
      // Neurodivergent-friendly typography
      "text-card-foreground font-medium",
      // Dyslexia-friendly letter spacing
      "tracking-wide",
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
      // Mobile: base readable size
      "text-muted-foreground leading-relaxed",
      "text-sm leading-5",
      // Tablet: comfortable reading
      "md:text-base md:leading-6",
      // Desktop: optimal reading experience  
      "lg:text-lg lg:leading-7",
      // Enhanced readability for neurodivergent users
      "max-w-prose", // Limit line length for easier reading
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
    className={cn(
      // Mobile: compact content spacing
      "space-y-3",
      // Tablet: comfortable spacing
      "md:space-y-4",
      // Desktop: generous spacing
      "lg:space-y-5",
      className
    )}
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
    className={cn(
      // Mobile: single column on small screens, proper touch targets
      "flex flex-col gap-3 mt-4",
      "min-h-[44px]", // Ensure touch target compliance
      // Tablet: horizontal layout with proper spacing
      "md:flex-row md:items-center md:justify-between md:gap-4 md:mt-6",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized cards for different emotional states and accessibility needs
export interface EmotionalCardProps extends CardProps {
  mood?: 'calm' | 'energetic' | 'focused' | 'neutral'
  accessibilityMode?: 'adhd' | 'dyslexia' | 'autism' | 'default'
}

const EmotionalCard = React.forwardRef<HTMLDivElement, EmotionalCardProps>(
  ({ mood = 'neutral', accessibilityMode = 'default', className, children, ...props }, ref) => {
    const moodClasses = {
      calm: [
        // Calming colors and subtle animation
        "bg-gradient-to-br from-blue-50 to-green-50",
        "border-blue-200 hover:border-blue-300",
        "md:hover:shadow-blue-100/50",
      ],
      energetic: [
        // Vibrant but not overwhelming
        "bg-gradient-to-br from-orange-50 to-yellow-50",
        "border-orange-200 hover:border-orange-300", 
        "md:hover:shadow-orange-100/50",
        // Subtle pulse animation for desktop
        "md:animate-pulse-gentle",
      ],
      focused: [
        // Sharp, focused styling
        "bg-white border-2 border-indigo-200",
        "ring-1 ring-indigo-100 hover:ring-indigo-200",
        "md:hover:shadow-indigo-100/50",
      ],
      neutral: "bg-card border-border",
    }

    const accessibilityClasses = {
      adhd: [
        // High contrast, clear boundaries
        "border-2 border-blue-400 bg-blue-50/30",
        "shadow-lg ring-2 ring-blue-200/50",
        // Reduced motion for ADHD users
        "transition-none hover:transition-all hover:duration-200",
      ],
      dyslexia: [
        // Cream background, high contrast text
        "bg-yellow-50 border-amber-200 text-gray-800",
        // Enhanced typography
        "font-mono tracking-wider leading-relaxed",
      ],
      autism: [
        // Soft, predictable styling
        "bg-green-50/50 border-green-200",
        "shadow-sm hover:shadow-md",
        // Gentle, consistent transitions
        "transition-all duration-300",
      ],
      default: "",
    }

    return (
      <Card
        ref={ref}
        className={cn(
          Array.isArray(moodClasses[mood]) 
            ? moodClasses[mood].join(' ')
            : moodClasses[mood],
          Array.isArray(accessibilityClasses[accessibilityMode])
            ? accessibilityClasses[accessibilityMode].join(' ')
            : accessibilityClasses[accessibilityMode],
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