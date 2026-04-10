type NavTab = 'home' | 'diary' | 'map'

interface Props {
  active: NavTab
  onChange: (tab: NavTab) => void
}

export function BottomNav({ active, onChange }: Props) {
  const tabs: Array<{ key: NavTab; emoji: string; label: string }> = [
    { key: 'diary', emoji: '📖', label: 'Diari' },
    { key: 'home',  emoji: '☀️', label: 'Inici' },
    { key: 'map',   emoji: '🗺️', label: 'Mapa' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-stretch"
      style={{
        zIndex: 20,
        background: 'rgba(10,4,0,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 64,
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`nav-btn ${active === tab.key ? 'active' : ''}`}
        >
          <span
            className="text-2xl transition-transform duration-200"
            style={{ transform: active === tab.key ? 'scale(1.15)' : 'scale(1)' }}
          >
            {tab.emoji}
          </span>
          <span
            className="font-body text-xs font-medium transition-all duration-200"
            style={{ opacity: active === tab.key ? 1 : 0.4 }}
          >
            {tab.label}
          </span>
          {active === tab.key && (
            <span
              className="absolute bottom-0 w-8 h-0.5 rounded-full bg-sunset-400"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            />
          )}
        </button>
      ))}
    </nav>
  )
}
