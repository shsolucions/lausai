import { useEffect, useState } from 'react'
import type { Moment, MomentType } from '../types'
import { MOMENT_LABELS, formatDate, formatTime } from '../types'
import { getAllMoments } from '../lib/db'

interface Props {
  onSelectMoment: (id: string) => void
  refreshKey: number
}

type Filter = 'all' | MomentType

function MomentCard({ moment, onClick }: { moment: Moment; onClick: () => void }) {
  const info = MOMENT_LABELS[moment.type]
  return (
    <button
      onClick={onClick}
      className="w-full glass rounded-3xl overflow-hidden active:scale-98 transition-all duration-200 text-left"
      style={{ transform: 'scale(1)', transition: 'transform 0.15s' }}
    >
      <div className="relative h-48">
        <img
          src={moment.photoDataUrl}
          alt={`Moment ${info.ca}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className={`moment-chip ${info.color}`}>
            {info.emoji} {info.ca}
          </span>
          <div className="flex items-center gap-1 glass-dark rounded-full px-2 py-1">
            <span className="text-sunset-400 text-sm">⭐</span>
            <span className="text-white font-body font-semibold text-xs">
              {moment.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-body text-white/50 text-xs mb-0.5">
            {formatDate(moment.createdAt)} · {formatTime(moment.createdAt)}
          </p>
          {moment.location?.placeName && (
            <p className="font-body text-white/70 text-sm flex items-center gap-1">
              <span className="text-xs">📍</span> {moment.location.placeName}
            </p>
          )}
          {moment.note && (
            <p className="font-body text-white/50 text-xs mt-1 italic line-clamp-1">
              "{moment.note}"
            </p>
          )}
        </div>
      </div>

      {/* Rating mini bar */}
      <div className="px-4 py-3 flex gap-1">
        {[1,2,3,4,5].map(n => (
          <div
            key={n}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: n <= Math.round(moment.averageRating) ? '#f97316' : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
    </button>
  )
}

export function DiaryScreen({ onSelectMoment, refreshKey }: Props) {
  const [moments, setMoments] = useState<Moment[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAllMoments().then(m => {
      setMoments(m)
      setLoading(false)
    })
  }, [refreshKey])

  const filtered = filter === 'all' ? moments : moments.filter(m => m.type === filter)

  const filters: Array<{ key: Filter; label: string; emoji: string }> = [
    { key: 'all',       label: 'Tots',    emoji: '✨' },
    { key: 'breakfast', label: 'Esmorzar',emoji: '☀️' },
    { key: 'lunch',     label: 'Dinar',   emoji: '🌤️' },
    { key: 'dinner',    label: 'Sopar',   emoji: '🌙' },
  ]

  return (
    <div className="flex flex-col h-full" style={{ zIndex: 10 }}>
      {/* Header */}
      <div className="glass-dark px-5 pt-14 pb-3 shrink-0">
        <h2 className="font-display text-2xl font-bold text-white text-overlay mb-3">
          El meu diari 📖
        </h2>
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                filter === f.key
                  ? 'bg-sunset-500 text-white shadow-lg shadow-sunset-500/30'
                  : 'glass text-white/60 border border-white/10'
              }`}
              style={{ minHeight: 36 }}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading && (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-sunset-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 gap-4 text-center">
            <div className="text-6xl animate-float">
              {filter === 'all' ? '🍽️' : MOMENT_LABELS[filter as MomentType]?.emoji}
            </div>
            <p className="font-display text-white/60 text-lg">
              {filter === 'all'
                ? 'Encara no tens cap moment al diari'
                : `Encara no tens cap ${MOMENT_LABELS[filter as MomentType]?.ca.toLowerCase()}`
              }
            </p>
            <p className="font-body text-white/30 text-sm">
              Fes la primera foto i comença a construir el teu record
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Group by date */}
            {groupByDate(filtered).map(([dateKey, dayMoments]) => (
              <div key={dateKey}>
                <p className="font-body text-white/30 text-xs uppercase tracking-widest mb-3 mt-1">
                  {dateKey}
                </p>
                <div className="flex flex-col gap-3">
                  {dayMoments.map(m => (
                    <MomentCard key={m.id} moment={m} onClick={() => onSelectMoment(m.id)} />
                  ))}
                </div>
              </div>
            ))}
            <div className="h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

function groupByDate(moments: Moment[]): [string, Moment[]][] {
  const groups = new Map<string, Moment[]>()
  for (const m of moments) {
    const key = new Date(m.createdAt).toLocaleDateString('ca-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    const arr = groups.get(key) ?? []
    arr.push(m)
    groups.set(key, arr)
  }
  return Array.from(groups.entries())
}
