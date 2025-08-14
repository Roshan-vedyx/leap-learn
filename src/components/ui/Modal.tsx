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
    default: "bg-background/80 backdrop-blur-sm",
    calm: "bg-autism-calm-mint/90 backdrop-blur-sm",
    minimal: "bg-background/60",
    'sensory-regulation': "bg-[#8BA888]" // Soft sage green - configurable later
  }

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
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
    size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
    showCloseButton?: boolean
  }
>(({ className, children, variant = 'default', size = 'default', showCloseButton = true, ...props }, ref) => {
  const variants = {
    default: "border bg-background text-foreground",
    calm: "border-autism-primary bg-autism-calm-mint text-autism-primary border-2",
    'high-contrast': "border-contrast-high bg-contrast-low text-contrast-high border-3",
    celebration: "bg-gradient-to-br from-autism-calm-mint to-autism-calm-sky border-autism-primary border-2",
    'sensory-regulation': "bg-transparent border-0 shadow-none" // Full screen, no container styling
  }

  const sizes = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]"
  }

  // For sensory regulation, we want full screen with no container constraints
  const contentClassName = variant === 'sensory-regulation' 
    ? "fixed inset-0 w-screen h-screen flex items-center justify-center"
    : cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg p-6",
        variants[variant],
        sizes[size],
        className
      )

  return (
    <DialogPortal>
      <DialogOverlay variant={variant === 'sensory-regulation' ? 'sensory-regulation' : (variant === 'calm' ? 'calm' : 'default')} />
      <DialogPrimitive.Content
        ref={ref}
        className={contentClassName}
        {...props}
      >
        {children}
        {showCloseButton && variant !== 'sensory-regulation' && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Keep your existing Modal interface
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'calm' | 'high-contrast' | 'celebration' | 'sensory-regulation'
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
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
        {/* Only show header for non-sensory regulation modals */}
        {variant !== 'sensory-regulation' && (title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content area - full screen for sensory regulation */}
        <div className={variant === 'sensory-regulation' ? "w-full h-full" : "py-4"}>
          {children}
        </div>

        {/* Only show footer for non-sensory regulation modals */}
        {variant !== 'sensory-regulation' && (primaryAction || secondaryAction) && (
          <DialogFooter>
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant === 'calm' ? 'calm' : 
                        primaryAction.variant === 'celebration' ? 'celebration' : 'default'}
                onClick={primaryAction.onClick}
                loading={primaryAction.loading}
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

// Keep your existing specialized modal types
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

// Updated CalmCornerModal - simplified for sensory regulation
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
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      {/* Full screen sensory regulation interface */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Temporary exit button for testing - will be replaced with proper timer logic */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 rounded-full p-3 text-white text-xl transition-colors z-10"
          aria-label="Exit calm corner"
        >
          ✕
        </button>

        {/* Three regulation options */}
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {/* HEAVY option */}
          <button
            onClick={() => {
              console.log('HEAVY selected')
              onHeavy?.()
            }}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border-2 border-white/20 hover:border-white/40"
            aria-label="Heavy pressure regulation"
          >
            <div className="text-6xl mb-2">🤗</div>
            <div className="text-lg font-semibold">HEAVY</div>
          </button>

          {/* ROCK option */}
          <button
            onClick={() => {
              console.log('ROCK selected')
              onRock?.()
            }}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border-2 border-white/20 hover:border-white/40"
            aria-label="Rocking movement regulation"
          >
            <div className="text-6xl mb-2">🌊</div>
            <div className="text-lg font-semibold">ROCK</div>
          </button>

          {/* QUIET option */}
          <button
            onClick={() => {
              console.log('QUIET selected')
              onQuiet?.()
            }}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border-2 border-white/20 hover:border-white/40"
            aria-label="Quiet sensory reduction"
          >
            <div className="text-6xl mb-2">🌙</div>
            <div className="text-lg font-semibold">QUIET</div>
          </button>
        </div>
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