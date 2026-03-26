interface Props {
  children: React.ReactNode
}

export function PageShell({ children }: Props) {
  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
    >
      <div className="h-px bg-gradient-to-r from-blue-500 via-orange-400 to-transparent" />
      {children}
    </div>
  )
}
