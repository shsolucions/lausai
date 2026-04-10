import { useEffect } from 'react'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info'
  onDone: () => void
}

export function Toast({ message, type = 'success', onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  const colors = {
    success: 'bg-green-500/80 border-green-400/30',
    error: 'bg-red-500/80 border-red-400/30',
    info: 'bg-sunset-500/80 border-sunset-400/30',
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' }

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-2xl border font-body text-sm text-white font-medium screen-enter"
      style={{
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        maxWidth: 'calc(100vw - 32px)',
        minWidth: 200,
      }}
      role="status"
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colors[type]}`}
      >
        {icons[type]}
      </span>
      {message}
    </div>
  )
}
