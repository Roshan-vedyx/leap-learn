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
    variant?: 'default' | 'calm' | 'minimal'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-background/80 backdrop-blur-sm",
    calm: "bg-autism-calm-mint/90 backdrop-blur-sm",
    minimal: "bg-background/60"
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
    variant?: 'default' | 'calm' | 'high-contrast' | 'celebration'
    size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
    showCloseButton?: boolean
  }
>(({ className, children, variant = 'default', size = 'default', showCloseButton = true, ...props }, ref) => {
  const variants = {
    default: "border bg-background text-foreground",
    calm: "border-autism-primary bg-autism-calm-mint text-autism-primary border-2",
    'high-contrast': "border-contrast-high bg-contrast-low text-contrast-high border-3",
    celebration: "bg-gradient-to-br from-autism-calm-mint to-autism-calm-sky border-autism-primary border-2"
  }

  const sizes = {
    sm: "max-w-sm",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]"
  }

  return (
    <DialogPortal>
      <DialogOverlay variant={variant === 'calm' ? 'calm' : 'default'} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "rounded-lg p-6",
          // Enhanced accessibility
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
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
      "flex flex-col space-y-2 text-center sm:text-left",
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
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2",
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
      // Enhanced readability
      "text-xl md:text-2xl leading-relaxed",
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
      "text-sm text-muted-foreground",
      // Enhanced readability
      "text-base leading-relaxed",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Enhanced Modal with neurodivergent-specific features
export interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  variant?: 'default' | 'calm' | 'high-contrast' | 'celebration'
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
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
}

const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  variant = 'default',
  size = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  primaryAction,
  secondaryAction
}) => {
  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent
        variant={variant}
        size={size}
        showCloseButton={showCloseButton}
        onPointerDownOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="py-4">
          {children}
        </div>

        {(primaryAction || secondaryAction) && (
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

// Specialized modals for different emotional states
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

// Calm Corner Modal - special modal for emotional regulation
export interface CalmCornerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBreathingExercise?: () => void
  onCalmMusic?: () => void
  onSafeSpace?: () => void
}

const CalmCornerModal: React.FC<CalmCornerModalProps> = ({
  open,
  onOpenChange,
  onBreathingExercise,
  onCalmMusic,
  onSafeSpace
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      variant="calm"
      title="Calm Corner"
      description="Take a moment to center yourself. What would help you feel better right now?"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="grid gap-4">
        {onBreathingExercise && (
          <Button
            variant="calm"
            size="comfortable"
            onClick={() => {
              onBreathingExercise()
              onOpenChange(false)
            }}
            className="w-full justify-start"
          >
            🫁 Breathing Exercise
          </Button>
        )}
        
        {onCalmMusic && (
          <Button
            variant="calm"
            size="comfortable"
            onClick={() => {
              onCalmMusic()
              onOpenChange(false)
            }}
            className="w-full justify-start"
          >
            🎵 Calm Sounds
          </Button>
        )}
        
        {onSafeSpace && (
          <Button
            variant="calm"
            size="comfortable"
            onClick={() => {
              onSafeSpace()
              onOpenChange(false)
            }}
            className="w-full justify-start"
          >
            🏠 Safe Space
          </Button>
        )}
        
        <Button
          variant="outline"
          size="comfortable"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          I'm feeling better now
        </Button>
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