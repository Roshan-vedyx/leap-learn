import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    variant?: 'default' | 'calm' | 'high-contrast'
    size?: 'default' | 'lg' | 'comfortable'
  }
>(({ className, children, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: "border-input",
    calm: "border-autism-primary bg-autism-calm-mint",
    'high-contrast': "border-contrast-high bg-contrast-low text-contrast-high border-3"
  }

  const sizes = {
    default: "h-12 px-4 py-3 text-base",
    lg: "h-14 px-6 py-4 text-lg",
    comfortable: "h-16 px-6 py-4 text-lg"
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between rounded-md border-2 bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        // Enhanced accessibility
        "min-h-touch cursor-pointer transition-colors",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    variant?: 'default' | 'calm' | 'high-contrast'
  }
>(({ className, children, position = "popper", variant = 'default', ...props }, ref) => {
  const variants = {
    default: "border-border bg-popover text-popover-foreground",
    calm: "border-autism-primary bg-autism-calm-mint text-autism-primary border-2",
    'high-contrast': "border-contrast-high bg-contrast-low text-contrast-high border-3"
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
          // Enhanced accessibility
          "animate-in fade-in-80 zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          variants[variant],
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-2 px-3 text-sm font-semibold leading-relaxed",
      // Enhanced readability
      "tracking-wide",
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    size?: 'default' | 'lg' | 'comfortable'
  }
>(({ className, children, size = 'default', ...props }, ref) => {
  const sizes = {
    default: "min-h-[36px] px-3 py-2 text-sm",
    lg: "min-h-[44px] px-4 py-3 text-base",
    comfortable: "min-h-[48px] px-6 py-4 text-lg"
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Enhanced touch targets and readability
        "leading-relaxed tracking-wide transition-colors",
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText className="pl-8">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Enhanced Select wrapper with label and error support
export interface EnhancedSelectProps {
  label?: string
  error?: string
  helper?: string
  variant?: 'default' | 'calm' | 'high-contrast'
  size?: 'default' | 'lg' | 'comfortable'
  children: React.ReactNode
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  id?: string
}

const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  label,
  error,
  helper,
  variant = 'default',
  size = 'default',
  children,
  placeholder,
  value,
  onValueChange,
  required,
  disabled,
  id
}) => {
  const selectId = id || React.useId()
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`

  return (
    <div className="w-full space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="text-sm font-medium leading-relaxed block mb-2"
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger 
          variant={error ? 'high-contrast' : variant}
          size={size}
          id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            helper && helperId,
            error && errorId
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent variant={variant}>
          {children}
        </SelectContent>
      </Select>

      {helper && !error && (
        <p id={helperId} className="text-sm text-muted-foreground leading-relaxed">
          {helper}
        </p>
      )}

      {error && (
        <p 
          id={errorId}
          className="text-sm text-destructive leading-relaxed flex items-center gap-2"
          role="alert"
        >
          <svg 
            className="h-4 w-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  EnhancedSelect,
}