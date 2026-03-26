import { tv } from 'tailwind-variants'
import type { ButtonHTMLAttributes } from 'react'

const buttonStyles = tv({
  base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95 disabled:active:scale-100',
  variants: {
    variant: {
      primary:   'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400',
      solid:     '',
      ghost:     '',
      secondary: 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white disabled:bg-gray-800 disabled:text-gray-600',
    },
    color: {
      blue:   '',
      green:  '',
      red:    '',
      orange: '',
      gray:   '',
    },
    size: {
      sm: 'py-1.5 px-3 text-xs',
      md: 'py-2.5 px-4 text-sm',
      lg: 'py-2.5 px-6 text-sm',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  compoundVariants: [
    // solid colors
    { variant: 'solid', color: 'blue',   class: 'bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white' },
    { variant: 'solid', color: 'green',  class: 'bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white' },
    { variant: 'solid', color: 'red',    class: 'bg-red-800 hover:bg-red-700 disabled:bg-gray-700 text-white' },
    { variant: 'solid', color: 'orange', class: 'bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white' },
    { variant: 'solid', color: 'gray',   class: 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white' },
    // ghost colors
    { variant: 'ghost', color: 'blue',   class: 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300' },
    { variant: 'ghost', color: 'green',  class: 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-300' },
    { variant: 'ghost', color: 'red',    class: 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300' },
    { variant: 'ghost', color: 'orange', class: 'bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300' },
    { variant: 'ghost', color: 'gray',   class: 'bg-gray-700/40 hover:bg-gray-700/70 border border-gray-600 text-gray-300' },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'blue',
    size: 'md',
  },
})

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'solid' | 'ghost' | 'secondary'
  color?: 'blue' | 'green' | 'red' | 'orange' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({ variant, color, size, fullWidth, className, children, ...rest }: Props) {
  return (
    <button className={buttonStyles({ variant, color, size, fullWidth, class: className })} {...rest}>
      {children}
    </button>
  )
}
