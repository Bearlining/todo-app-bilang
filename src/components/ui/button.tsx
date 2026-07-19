import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost" | "macaron"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      default: "bg-gradient-to-r from-pink-300 to-peach-300 text-white shadow-lg hover:shadow-xl hover:scale-105",
      secondary: "bg-gradient-to-r from-mint-300 to-sky-300 text-white shadow-lg hover:shadow-xl hover:scale-105",
      outline: "border-2 border-pink-300 text-pink-400 hover:bg-pink-50",
      ghost: "hover:bg-pink-50 text-gray-600",
      macaron: "bg-white/60 backdrop-blur-sm border border-white/40 text-gray-700 shadow-md hover:shadow-lg",
    }

    const sizes = {
      default: "h-12 px-6 py-3",
      sm: "h-9 px-4 rounded-lg",
      lg: "h-14 px-8 rounded-2xl text-base",
      icon: "h-10 w-10",
    }

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
