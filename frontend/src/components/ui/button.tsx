import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-mint to-sky text-[#040614] hover:brightness-110 shadow-none hover:shadow-lg hover:-translate-y-0.5",
        mental:
          "bg-gradient-to-r from-edufis-mental-start to-edufis-mental-end text-white shadow-[0_12px_28px_rgba(141,131,255,0.25)] hover:shadow-[0_18px_36px_rgba(141,131,255,0.35)] hover:-translate-y-0.5",
        fisico:
          "bg-gradient-to-r from-edufis-fisico-start to-edufis-fisico-end text-white shadow-[0_12px_28px_rgba(33,209,177,0.25)] hover:shadow-[0_18px_36px_rgba(33,209,177,0.35)] hover:-translate-y-0.5",
        interior:
          "bg-gradient-to-r from-edufis-interior-start to-edufis-interior-end text-[#040614] shadow-[0_12px_28px_rgba(251,191,36,0.25)] hover:shadow-[0_18px_36px_rgba(251,191,36,0.35)] hover:-translate-y-0.5",
        emocional:
          "bg-gradient-to-r from-vio to-edufis-mental-end text-white shadow-[0_12px_28px_rgba(169,99,255,0.25)] hover:shadow-[0_18px_36px_rgba(169,99,255,0.35)] hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_12px_28px_rgba(239,68,68,0.25)] hover:shadow-[0_18px_36px_rgba(239,68,68,0.35)] hover:-translate-y-0.5",
        outline:
          "border border-lme-border bg-transparent text-ink hover:bg-white/5 hover:border-sub",
        secondary:
          "bg-lme-surface-soft text-ink border border-lme-border hover:bg-white/10",
        ghost:
          "text-sub hover:text-ink hover:bg-white/5",
        link:
          "text-sky underline-offset-4 hover:underline hover:text-mint",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
