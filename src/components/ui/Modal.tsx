import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: 'default' | 'calm' | 'minimal' | 'sensory-regulation'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-black/50 backdrop-blur-sm",
    calm: "bg-blue-900/30 backdrop-blur-md",
    minimal: "bg-black/30 backdrop-blur-sm",
    'sensory-regulation': "bg-gradient-to-br from-blue-400 to-green-400" // Calming gradient
  }

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    variant?: 'default' | 'calm' | 'high-contrast' | 'celebration' | 'sensory-regulation'
    size?: 'sm' | 'default' | 'lg' | 'xl' | 'full' | 'mobile-full'
    showCloseButton?: boolean
  }
>(({ className, children, variant = 'default', size = 'default', showCloseButton = true, ...props }, ref) => {
  const variants = {
    default: "border bg-white text-gray-900 shadow-xl",
    calm: [
      "border-2 border-blue-200 bg-blue-50/95 text-blue-900",
      "shadow-2xl shadow-blue-200/50",
    ],
    'high-contrast': [
      "border-4 border-black bg-white text-black",
      "shadow-2xl ring-4 ring-yellow-400",
    ],
    celebration: [
      "bg-gradient-to-br from-green-50 to-blue-50",
      "border-2 border-green-200 text-gray-900",
      "shadow-2xl shadow-green-200/50",
    ],
    'sensory-regulation': "bg-transparent border-0 shadow-none p-0" // Full screen, no container
  }

  const sizes = {
    sm: [
      // Mobile: almost full screen with margins
      "w-[calc(100vw-2rem)] max-w-sm",
      "max-h-[calc(100vh-2rem)]",
      // Desktop: small centered
      "sm:w-full sm:max-w-sm",
    ],
    default: [
      // Mobile: full width with small margins
      "w-[calc(100vw-1rem)] max-w-lg",
      "max-h-[calc(100vh-1rem)]",
      // Tablet: centered with max width
      "md:w-full md:max-w-lg",
    ],
    lg: [
      "w-[calc(100vw-1rem)] max-w-2xl",
      "max-h-[calc(100vh-1rem)]",
      "md:w-full md:max-w-2xl",
    ],
    xl: [
      "w-[calc(100vw-1rem)] max-w-4xl", 
      "max-h-[calc(100vh-1rem)]",
      "md:w-full md:max-w-4xl",
    ],
    'mobile-full': [
      // Full screen on mobile, centered on desktop
      "w-screen h-screen",
      "md:w-[90vw] md:h-[90vh] md:max-w-4xl",
    ],
    full: "w-screen h-screen" // Always full screen
  }

  // Special handling for sensory regulation (full screen)
  const contentClassName = variant === 'sensory-regulation' 
    ? "fixed inset-0 w-screen h-screen flex items-center justify-center"
    : cn(
        // Base modal positioning and behavior
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
        "grid gap-4 duration-200 overflow-hidden",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        // Responsive layout
        "rounded-none p-4", // Mobile: no border radius, compact padding
        "sm:rounded-lg sm:p-6", // Desktop: rounded corners, generous padding
        // Variant styling
        Array.isArray(variants[variant]) 
          ? variants[variant].join(' ')
          : variants[variant],
        // Size constraints
        Array.isArray(sizes[size])
          ? sizes[size].join(' ')
          : sizes[size],
        className
      )

  return (
    <DialogPortal>
      <DialogOverlay variant={variant === 'sensory-regulation' ? 'sensory-regulation' : 
                              (variant === 'calm' ? 'calm' : 'default')} />
      <DialogPrimitive.Content
        ref={ref}
        className={contentClassName}
        {...props}
      >
        {children}
        {showCloseButton && variant !== 'sensory-regulation' && (
          <DialogPrimitive.Close className={cn(
            // Mobile: larger close button for touch
            "absolute right-3 top-3 p-2",
            "rounded-full bg-white/90 hover:bg-white",
            "ring-offset-background transition-all",
            "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:pointer-events-none",
            // Desktop: smaller, positioned in corner
            "sm:right-4 sm:top-4 sm:p-1.5 sm:bg-transparent sm:hover:bg-gray-100",
            "text-gray-500 hover:text-gray-700"
          )}>
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Mobile: compact header
      "flex flex-col space-y-2 text-center",
      // Desktop: more generous spacing, left-aligned
      "sm:space-y-3 sm:text-left",
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Mobile: stacked buttons with full width
      "flex flex-col-reverse gap-3 pt-4",
      // Desktop: horizontal layout
      "sm:flex-row sm:justify-end sm:gap-2 sm:pt-6",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      // Mobile: readable size
      "text-xl font-semibold leading-tight tracking-tight",
      // Desktop: larger title
      "sm:text-2xl",
      // Neurodivergent-friendly typography
      "text-gray-900 font-medium",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      // Mobile: base readable size
      "text-base text-gray-600 leading-relaxed",
      // Desktop: slightly larger
      "sm:text-lg",
      // Limit line length for readability
      "max-w-prose",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Main Modal Component
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'calm' | 'high-contrast' | 'celebration' | 'sensory-regulation'
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full' | 'mobile-full'
  primaryAction?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'calm' | 'celebration'
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = 'default',
  size = 'default',
  primaryAction,
  secondaryAction,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={className}
        variant={variant}
        size={size}
        showCloseButton={variant !== 'sensory-regulation'}
        onPointerDownOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        {/* Header - hidden for sensory regulation */}
        {variant !== 'sensory-regulation' && (title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {/* Content area */}
        <div className={cn(
          variant === 'sensory-regulation' ? "w-full h-full" : "flex-1",
          // Mobile: compact content spacing
          variant !== 'sensory-regulation' && "py-2",
          // Desktop: more generous spacing
          variant !== 'sensory-regulation' && "sm:py-4"
        )}>
          {children}
        </div>

        {/* Footer - hidden for sensory regulation */}
        {variant !== 'sensory-regulation' && (primaryAction || secondaryAction) && (
          <DialogFooter>
            {secondaryAction && (
              <Button
                variant="outline"
                size="comfortable"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant === 'calm' ? 'calm' : 
                        primaryAction.variant === 'celebration' ? 'celebration' : 'default'}
                size="comfortable"
                onClick={primaryAction.onClick}
                loading={primaryAction.loading}
                className="w-full sm:w-auto"
              >
                {primaryAction.label}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Specialized Emotional Modal
export interface EmotionalModalProps extends Omit<ModalProps, 'variant'> {
  mood?: 'calm' | 'celebration' | 'focus' | 'neutral'
  accessibilityMode?: 'adhd' | 'dyslexia' | 'autism' | 'default'
}

const EmotionalModal: React.FC<EmotionalModalProps> = ({
  mood = 'neutral',
  accessibilityMode = 'default',
  ...props
}) => {
  const getVariant = () => {
    if (accessibilityMode === 'adhd') return 'high-contrast'
    if (mood === 'calm' || accessibilityMode === 'autism') return 'calm'
    if (mood === 'celebration') return 'celebration'
    return 'default'
  }

  return <Modal {...props} variant={getVariant()} />
}

// Sensory Regulation Modal with Mobile-Optimized Layout
export interface CalmCornerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHeavy?: () => void
  onRock?: () => void
  onQuiet?: () => void
}

const CalmCornerModal: React.FC<CalmCornerModalProps> = ({
  open,
  onOpenChange,
  onHeavy,
  onRock,
  onQuiet
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      variant="sensory-regulation"
      size="full"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      {/* Full screen sensory regulation interface */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Exit button - larger on mobile */}
        <button
          onClick={() => onOpenChange(false)}
          className={cn(
            "absolute z-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors",
            "text-white backdrop-blur-sm",
            // Mobile: larger touch target, positioned safely
            "top-6 right-6 p-4 text-2xl",
            // Desktop: smaller, corner positioned
            "sm:top-8 sm:right-8 sm:p-3 sm:text-xl"
          )}
          aria-label="Exit calm corner"
        >
          ✕
        </button>

        {/* Title - responsive typography */}
        <h2 className={cn(
          "text-white font-semibold mb-8 text-center",
          // Mobile: larger, more prominent
          "text-2xl mb-6",
          // Desktop: elegant sizing
          "sm:text-3xl sm:mb-12"
        )}>
          Choose Your Calm
        </h2>

        {/* Three regulation options - responsive grid */}
        <div className={cn(
          "grid gap-6 place-items-center",
          // Mobile: single column for easy thumb navigation
          "grid-cols-1 w-full max-w-xs",
          // Tablet: horizontal layout
          "md:grid-cols-3 md:max-w-none md:gap-12",
          // Desktop: more spacing
          "lg:gap-16"
        )}>
          {/* HEAVY option */}
          <button
            onClick={() => {
              console.log('HEAVY selected')
              onHeavy?.()
            }}
            className={cn(
              "flex flex-col items-center justify-center",
              "bg-white/10 hover:bg-white/20 active:bg-white/25",
              "rounded-2xl transition-all text-white",
              "border-2 border-white/20 hover:border-white/40",
              "focus:outline-none focus:ring-4 focus:ring-white/30",
              // Mobile: larger touch targets
              "w-full h-32 text-lg",
              // Desktop: square design
              "md:w-32 md:h-32"
            )}
            aria-label="Heavy pressure regulation"
          >
            <div className="text-6xl mb-2">🤗</div>
            <div className="font-semibold">HEAVY</div>
          </button>

          {/* ROCK option */}
          <button
            onClick={() => {
              console.log('ROCK selected')
              onRock?.()
            }}
            className={cn(
              "flex flex-col items-center justify-center",
              "bg-white/10 hover:bg-white/20 active:bg-white/25",
              "rounded-2xl transition-all text-white",
              "border-2 border-white/20 hover:border-white/40",
              "focus:outline-none focus:ring-4 focus:ring-white/30",
              "w-full h-32 text-lg",
              "md:w-32 md:h-32"
            )}
            aria-label="Rocking movement regulation"
          >
            <div className="text-6xl mb-2">🌊</div>
            <div className="font-semibold">ROCK</div>
          </button>

          {/* QUIET option */}
          <button
            onClick={() => {
              console.log('QUIET selected')
              onQuiet?.()
            }}
            className={cn(
              "flex flex-col items-center justify-center",
              "bg-white/10 hover:bg-white/20 active:bg-white/25",
              "rounded-2xl transition-all text-white",
              "border-2 border-white/20 hover:border-white/40",
              "focus:outline-none focus:ring-4 focus:ring-white/30",
              "w-full h-32 text-lg",
              "md:w-32 md:h-32"
            )}
            aria-label="Quiet sensory reduction"
          >
            <div className="text-6xl mb-2">🌙</div>
            <div className="font-semibold">QUIET</div>
          </button>
        </div>

        {/* Instructions - responsive positioning */}
        <p className={cn(
          "text-white/90 text-center mt-8 px-4",
          "text-base leading-relaxed",
          "sm:text-lg sm:mt-12",
          "max-w-md"
        )}>
          Take your time. Choose what feels right for you.
        </p>
      </div>
    </Modal>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Modal,
  EmotionalModal,
  CalmCornerModal,
}