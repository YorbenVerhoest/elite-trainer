interface Props {
  size?: 'sm' | 'md'
  centered?: boolean
}

export function Spinner({ size = 'md', centered = false }: Props) {
  const cls =
    size === 'sm'
      ? 'w-3.5 h-3.5 border border-gray-500 border-t-transparent rounded-full animate-spin'
      : 'w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'

  if (centered) {
    return (
      <div className="flex justify-center py-12">
        <div className={cls} />
      </div>
    )
  }

  return <div className={cls} />
}
