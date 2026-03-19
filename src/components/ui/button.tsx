import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c97a40]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1916] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:     'bg-[#c97a40] text-white hover:bg-[#b86c34] shadow-[0_1px_3px_rgba(0,0,0,0.4)]',
        destructive: 'bg-[#c0554e]/90 text-white hover:bg-[#c0554e] shadow-sm',
        outline:     'border border-white/10 bg-transparent text-[#b8b0a6] hover:bg-white/5 hover:text-[#f0ece6]',
        secondary:   'bg-[#2a2927] text-[#b8b0a6] hover:bg-[#323130] hover:text-[#f0ece6]',
        ghost:       'text-[#b8b0a6] hover:bg-white/5 hover:text-[#f0ece6]',
        link:        'text-[#c97a40] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-11 rounded-lg px-8 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
