import { tv } from 'tailwind-variants'

const spinnerStyles = tv({
  slots: {
    wrapper: '',
    ring: 'rounded-full animate-spin border-t-transparent',
  },
  variants: {
    size: {
      sm: { ring: 'w-3.5 h-3.5 border border-gray-500' },
      md: { ring: 'w-6 h-6 border-2 border-blue-500' },
    },
    centered: {
      true: { wrapper: 'flex justify-center py-12' },
    },
  },
  defaultVariants: {
    size: 'md',
    centered: false,
  },
})

interface Props {
  size?: 'sm' | 'md'
  centered?: boolean
}

export function Spinner({ size, centered }: Props) {
  const { wrapper, ring } = spinnerStyles({ size, centered })

  if (centered) {
    return (
      <div className={wrapper()}>
        <div className={ring()} />
      </div>
    )
  }

  return <div className={ring()} />
}
