import { useEffect, useState } from 'react'
import type { Moment } from '../types'
import { MOMENT_LABELS, formatTime } from '../types'
import { getAllMoments } from '../lib/db'

interface Props {
  onCapture: () => void
  onDiary: () => void
  onMap: () => void
}

export function HomeScreen({ onCapture, onDiary, onMap }: Props) {
  const [lastMoment, setLastMoment] = useState<Moment | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    getAllMoments().then(moments => {
      setTotalCount(moments.length)
      setLastMoment(moments[0] ?? null)
    })
  }, [])

  const today = new Date().toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="relative flex flex-col h-full screen-enter" style={{ zIndex: 10 }}>

      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest mb-0.5">
              {today}
            </p>
            <h1 className="font-display text-4xl font-black text-white text-overlay leading-tight">
              Lau<span className="text-sunset-400">Sai</span>
            </h1>
          </div>
          {totalCount > 0 && (
            <div className="glass rounded-2xl px-4 py-2 text-center">
              <p className="font-display text-2xl font-bold text-sunset-300">{totalCount}</p>
              <p className="font-body text-xs text-white/50">moments</p>
            </div>
          )}
        </div>
        <p className="font-display italic text-white/70 text-sm mt-2 text-overlay">
          captura el teu moment i fes-lo etern
        </p>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">

        {/* Main CTA */}
        <div className="w-full animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both', opacity: 0 }}>
          <button
            onClick={onCapture}
            className="btn-primary text-lg py-5 rounded-3xl"
            style={{ minHeight: 72 }}
          >
            <span className="text-2xl">📷</span>
            <span>Captura el moment</span>
          </button>
        </div>

        {/* Last moment preview */}
        {lastMoment && (
          <div
            className="w-full glass rounded-3xl overflow-hidden animate-fade-up cursor-pointer active:scale-95 transition-transform"
            style={{ animationDelay: '0.2s', animationFillMode: 'both', opacity: 0 }}
            onClick={onDiary}
          >
            <div className="relative h-40">
              <img
                src={lastMoment.photoDataUrl}
                alt="Últim moment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`moment-chip ${MOMENT_LABELS[lastMoment.type].color} mb-1`}>
                      {MOMENT_LABELS[lastMoment.type].emoji} {MOMENT_LABELS[lastMoment.type].ca}
                    </span>
                    <p className="text-white/60 text-xs font-body mt-1">
                      {formatTime(lastMoment.createdAt)} · Últim moment
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sunset-400 text-lg">⭐</span>
                    <span className="text-white font-body font-semibold text-sm">
                      {lastMoment.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!lastMoment && (
          <div
            className="w-full glass rounded-3xl p-8 text-center animate-fade-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both', opacity: 0 }}
          >
            <div className="text-5xl mb-3 animate-float">🍽️</div>
            <p className="font-display text-white/80 text-lg font-medium">
              Encara no tens cap moment
            </p>
            <p className="font-body text-white/40 text-sm mt-1">
              Fes la primera foto i comença el teu diari
            </p>
          </div>
        )}

        {/* Secondary actions */}
        <div
          className="w-full grid grid-cols-2 gap-3 animate-fade-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both', opacity: 0 }}
        >
          <button onClick={onDiary} className="btn-secondary text-sm py-3">
            <span>📖</span> El meu diari
          </button>
          <button onClick={onMap} className="btn-secondary text-sm py-3">
            <span>🗺️</span> Mapa de moments
          </button>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="px-6 pb-8 text-center">
        <p className="font-body text-white/25 text-xs">
          Avui pot ser un gran dia gastronòmic ✨
        </p>
      </div>
    </div>
  )
}
