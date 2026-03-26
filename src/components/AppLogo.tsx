import { Link } from 'react-router-dom'
import { tv } from 'tailwind-variants'

const appLogoStyles = tv({
  slots: {
    link:     'flex items-center gap-3',
    mark:     'w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shrink-0',
    title:    'text-2xl font-extrabold tracking-widest uppercase font-sport bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent leading-none',
    subtitle: 'text-xs text-gray-500 tracking-widest uppercase mt-0.5',
  },
})

interface Props {
  title: string
  subtitle?: string
}

export function AppLogo({ title, subtitle }: Props) {
  const { link, mark, title: titleCls, subtitle: subtitleCls } = appLogoStyles()

  return (
    <Link to="/" className={link()}>
      <div className={mark()}>
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 21H5L13 3H19L14 11H20L11 21Z"/>
        </svg>
      </div>
      <div>
        <p className={titleCls()}>{title}</p>
        {subtitle && <p className={subtitleCls()}>{subtitle}</p>}
      </div>
    </Link>
  )
}
