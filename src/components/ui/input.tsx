import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-pink-200 bg-white/60 px-4 py-2",
          "text-sm text-gray-800 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent",
          "transition-all duration-200",
          "backdrop-blur-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
