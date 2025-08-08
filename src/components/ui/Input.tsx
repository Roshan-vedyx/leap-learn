import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  // Base styles optimized for neurodivergent users
  "flex h-12 w-full rounded-md border-2 bg-background px-4 py-3 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        outline: "border-border",
        calm: "border-autism-primary bg-autism-calm-mint focus:border-autism-secondary",
        'high-contrast': "border-contrast-high bg-contrast-low text-contrast-high font-semibold",
        error: "border-destructive focus:border-destructive",
        success: "border-autism-secondary focus:border-autism-secondary",
      },
      size: {
        sm: "h-10 px-3 py-2 text-sm",
        default: "h-12 px-4 py-3 text-base",
        lg: "h-14 px-6 py-4 text-lg",
        comfortable: "h-16 px-6 py-4 text-lg", // Extra comfortable for motor accessibility
      },
      spacing: {
        default: "",
        comfortable: "letter-spacing-wide", // For dyslexia support
        wide: "tracking-wider",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      spacing: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    variant, 
    size, 
    spacing,
    label,
    error,
    success,
    helper,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const successId = `${inputId}-success`

    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-relaxed block mb-2"
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant: currentVariant, size, spacing }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(
              helper && helperId,
              error && errorId,
              success && successId
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text */}
        {helper && !error && !success && (
          <p 
            id={helperId}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {helper}
          </p>
        )}

        {/* Error message */}
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

        {/* Success message */}
        {success && (
          <p 
            id={successId}
            className="text-sm text-autism-secondary leading-relaxed flex items-center gap-2"
          >
            <svg 
              className="h-4 w-4 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            {success}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

// Specialized textarea component with same accessibility features
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<InputProps, 'type' | 'leftIcon' | 'rightIcon'> {
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size, 
    spacing,
    label,
    error,
    success,
    helper,
    id,
    resize = 'vertical',
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const successId = `${inputId}-success`

    const currentVariant = error ? 'error' : success ? 'success' : variant

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    }

    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-relaxed block mb-2"
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <textarea
          className={cn(
            inputVariants({ variant: currentVariant, size, spacing }),
            "min-h-[80px]",
            resizeClasses[resize],
            className
          )}
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            helper && helperId,
            error && errorId,
            success && successId
          )}
          {...props}
        />

        {helper && !error && !success && (
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

        {success && (
          <p 
            id={successId}
            className="text-sm text-autism-secondary leading-relaxed flex items-center gap-2"
          >
            <svg 
              className="h-4 w-4 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            {success}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Input, Textarea, inputVariants }