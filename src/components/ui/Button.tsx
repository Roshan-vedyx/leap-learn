import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Button variants optimized for neurodivergent accessibility and responsiveness
const buttonVariants = cva(
  // Base styles - mobile-first approach with 44px+ touch targets
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer touch-manipulation font-primary",
    // Ensure minimum touch targets (44px)
    "min-h-[44px] min-w-[44px]",
    // Professional focus management
    "focus-visible:ring-2 focus-visible:ring-deep-ocean-blue focus-visible:ring-offset-2",
    // Active feedback for touch
    "active:scale-[0.98] active:transition-transform active:duration-100",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-deep-ocean-blue text-white shadow-soft",
          "hover:bg-deep-ocean-blue/90 active:bg-deep-ocean-blue/80",
          "md:hover:shadow-md md:hover:-translate-y-0.5",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 active:bg-red-800",
          "md:hover:shadow-md",
        ],
        outline: [
          "border-2 border-gray-300 bg-transparent text-warm-charcoal shadow-sm",
          "hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
          "md:hover:shadow-sm",
        ],
        secondary: [
          "bg-white border-2 border-gray-200 text-warm-charcoal shadow-sm",
          "hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100",
          "md:hover:shadow-md",
        ],
        ghost: [
          "bg-transparent text-warm-charcoal",
          "hover:bg-gray-100 active:bg-gray-200",
          "md:hover:bg-gray-50",
        ],
        link: [
          "bg-transparent text-deep-ocean-blue underline-offset-4",
          "hover:underline focus:underline",
          "min-h-auto min-w-auto", // Links don't need touch targets
        ],
        // Neurodivergent-specific variants
        calm: [
          "bg-gradient-to-br from-soft-lavender/20 to-soft-lavender/10",
          "text-deep-ocean-blue border-2 border-soft-lavender/30 shadow-gentle",
          "hover:bg-soft-lavender/30 hover:border-soft-lavender/50",
          "active:bg-soft-lavender/40",
          "md:hover:shadow-lg md:hover:shadow-soft-lavender/20",
        ],
        'high-contrast': [
          "bg-black text-white border-4 border-black font-semibold",
          "hover:bg-gray-800 hover:border-gray-800",
          "active:bg-gray-900",
          "focus-visible:ring-4 focus-visible:ring-yellow-400",
        ],
        celebration: [
          "bg-gradient-to-r from-sage-green to-deep-ocean-blue text-white shadow-lg",
          "hover:shadow-xl hover:scale-[1.02]",
          "active:shadow-md active:scale-[0.98]",
          "md:transform md:transition-transform",
        ],
      },
      size: {
        // Mobile-optimized sizes with responsive scaling
        sm: [
          // Mobile: minimum touch target
          "h-[44px] px-3 py-2 text-sm gap-1.5",
          // Tablet: slightly larger
          "md:h-[48px] md:px-4 md:text-base",
        ],
        default: [
          // Mobile: comfortable touch target
          "h-[48px] px-4 py-3 text-base gap-2",
          // Tablet: more generous spacing
          "md:h-[52px] md:px-6 md:py-3 md:text-base",
          // Desktop: full size
          "lg:h-[56px] lg:px-8 lg:text-lg",
        ],
        lg: [
          "h-[52px] px-6 py-4 text-lg gap-2.5",
          "md:h-[56px] md:px-8 md:py-4",
          "lg:h-[60px] lg:px-10 lg:text-xl",
        ],
        xl: [
          "h-[56px] px-8 py-5 text-xl gap-3",
          "md:h-[60px] md:px-10 md:py-5",
          "lg:h-[64px] lg:px-12 lg:text-2xl",
        ],
        // Specialized sizes for accessibility
        comfortable: [
          "h-[52px] px-6 py-4 text-lg gap-2.5",
          "md:h-[56px] md:px-8 md:py-4",
        ],
        'extra-large': [
          "h-[60px] px-8 py-6 text-xl gap-3",
          "md:h-[64px] md:px-10 md:py-6",
          "lg:h-[68px] lg:px-12 lg:text-2xl",
        ],
        // Icon button - perfect square, minimum touch target
        icon: [
          "h-[44px] w-[44px] p-0 gap-0",
          "md:h-[48px] md:w-[48px]",
          "lg:h-[52px] lg:w-[52px]",
        ],
        // Icon with text - accommodates both
        'icon-text': [
          "h-[48px] px-4 py-3 gap-2",
          "md:h-[52px] md:px-6",
          "lg:h-[56px] lg:px-8",
        ],
      },
      // Responsive text layout for icon + text combinations
      iconPosition: {
        left: "flex-row",
        right: "flex-row-reverse",
        top: "flex-col gap-1",
        bottom: "flex-col-reverse gap-1",
      },
      // Emotional regulation support
      mood: {
        neutral: "",
        energetic: [
          // Subtle animation that respects reduced motion
          "@media (prefers-reduced-motion: no-preference) { animate-soft-pulse }",
        ],
        calm: "shadow-gentle",
        focused: [
          "ring-2 ring-deep-ocean-blue/30 ring-offset-2",
          "bg-blue-50/30 border-blue-200",
        ],
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      iconPosition: "left",
      mood: "neutral",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
  'aria-label'?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    mood,
    iconPosition = 'left',
    asChild = false, 
    loading = false,
    icon,
    children,
    disabled,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Ensure disabled state when loading
    const isDisabled = disabled || loading
    
    // Auto-generate aria-label for icon-only buttons
    const needsAriaLabel = !ariaLabel && (!children || typeof children !== 'string') && icon
    
    // Handle icon sizing based on button size
    const getIconSize = () => {
      switch (size) {
        case 'sm': return 'w-4 h-4'
        case 'lg': case 'comfortable': return 'w-6 h-6'
        case 'xl': case 'extra-large': return 'w-7 h-7'
        case 'icon': return 'w-5 h-5 md:w-6 md:h-6'
        default: return 'w-5 h-5'
      }
    }
    
    // Render icon with proper sizing
    const renderIcon = (iconElement: React.ReactNode) => {
      if (React.isValidElement(iconElement)) {
        return React.cloneElement(iconElement as React.ReactElement, {
          className: cn(getIconSize(), iconElement.props.className),
          'aria-hidden': 'true',
        })
      }
      return iconElement
    }
    
    // Loading spinner with responsive sizing
    const loadingSpinner = (
      <svg 
        className={cn("animate-spin", getIconSize())} 
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
    )
    
    // Content layout based on icon position and loading state
    const renderContent = () => {
      if (loading) {
        return (
          <>
            {loadingSpinner}
            <span className="sr-only">Loading...</span>
            {children && (
              <span className={cn(
                // Hide text on very small screens for icon buttons
                size === 'icon' ? 'sr-only' : '',
                // Responsive text visibility
                size === 'sm' ? 'hidden sm:inline' : ''
              )}>
                {typeof children === 'string' ? children : 'Loading...'}
              </span>
            )}
          </>
        )
      }
      
      // Icon-only button
      if (icon && !children) {
        return renderIcon(icon)
      }
      
      // Text-only button
      if (children && !icon) {
        return children
      }
      
      // Icon + text button with responsive layout
      if (icon && children) {
        const iconElement = renderIcon(icon)
        
        // For mobile, might want to show only icon on smallest screens
        if (size === 'sm') {
          return (
            <>
              {iconPosition === 'left' && iconElement}
              <span className="hidden sm:inline">{children}</span>
              {iconPosition === 'right' && iconElement}
            </>
          )
        }
        
        // Standard icon + text layout
        switch (iconPosition) {
          case 'right':
            return <>{children}{iconElement}</>
          case 'top':
            return <>{iconElement}{children}</>
          case 'bottom':
            return <>{children}{iconElement}</>
          default: // left
            return <>{iconElement}{children}</>
        }
      }
      
      return children
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, iconPosition, mood }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-label={needsAriaLabel ? 'Icon button' : ariaLabel}
        aria-disabled={isDisabled}
        aria-busy={loading}
        role={asChild ? undefined : "button"}
        {...props}
      >
        {renderContent()}
      </Comp>
    )
  }
)

Button.displayName = "Button"

// Helper component for icon + text buttons with better API
interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition'> {
  icon: React.ReactNode
  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
  hideTextOnMobile?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconPosition = 'left', hideTextOnMobile = false, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        icon={icon}
        iconPosition={iconPosition}
        className={cn(
          hideTextOnMobile && children && "sm:gap-2",
          className
        )}
        {...props}
      >
        {children && (
          <span className={hideTextOnMobile ? "hidden sm:inline" : undefined}>
            {children}
          </span>
        )}
      </Button>
    )
  }
)

IconButton.displayName = "IconButton"

export { Button, IconButton, buttonVariants }