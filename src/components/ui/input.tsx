import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '../../lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn('flex h-11 w-full rounded-md border bg-background px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className)}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
