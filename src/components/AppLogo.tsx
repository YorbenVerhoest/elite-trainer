import { Link } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
}

export function AppLogo({ title, subtitle }: Props) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(46,170,255,0.4)] group-hover:shadow-[0_0_28px_rgba(46,170,255,0.6)] transition-shadow">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 21H5L13 3H19L14 11H20L11 21Z"/>
        </svg>
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-widest uppercase font-sport bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent leading-none">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">{subtitle}</p>
        )}
      </div>
    </Link>
  )
}
