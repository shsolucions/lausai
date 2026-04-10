import { useEffect, useState } from 'react'
import type { Moment } from '../types'
import { MOMENT_LABELS, RATING_CATEGORIES, formatDate, formatTime } from '../types'
import { getMomentById, deleteMoment } from '../lib/db'
import { ShareModal } from '../components/ShareModal'

interface Props {
  momentId: string
  onBack: () => void
  onDeleted: () => void
}

export function DetailScreen({ momentId, onBack, onDeleted }: Props) {
  const [moment, setMoment] = useState<Moment | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getMomentById(momentId).then(m => setMoment(m ?? null))
  }, [momentId])

  const handleDelete = async () => {
    setDeleting(true)
    await deleteMoment(momentId)
    onDeleted()
  }

  if (!moment) {
    return (
      <div className="flex items-center justify-center h-full" style={{ zIndex: 10 }}>
        <div className="w-8 h-8 border-2 border-sunset-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const info = MOMENT_LABELS[moment.type]

  return (
    <div className="flex flex-col h-full screen-enter" style={{ zIndex: 10 }}>
      {/* Photo hero */}
      <div className="relative h-72 shrink-0">
        <img src={moment.photoDataUrl} alt="Moment" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-5 py-4 mt-10">
          <button
            onClick={onBack}
            className="glass-dark rounded-full w-10 h-10 flex items-center justify-center text-white text-sm"
          >
            ←
          </button>
          <span className={`moment-chip ${info.color}`}>{info.emoji} {info.ca}</span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="glass-dark rounded-full w-10 h-10 flex items-center justify-center text-white text-lg"
              aria-label="Compartir"
            >
              ↗
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="glass-dark rounded-full w-10 h-10 flex items-center justify-center text-red-400 text-lg"
              aria-label="Eliminar"
            >
              🗑
            </button>
          </div>
        </div>

        {/* Hero info */}
        <div className="absolute bottom-4 left-5 right-5">
          <p className="font-body text-white/50 text-xs">
            {formatDate(moment.createdAt)} · {formatTime(moment.createdAt)}
          </p>
          {moment.location?.placeName && (
            <p className="font-body text-white/80 text-sm flex items-center gap-1 mt-0.5">
              📍 {moment.location.placeName}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {'⭐'.repeat(Math.round(moment.averageRating))}
            </div>
            <span className="font-display text-sunset-300 font-bold text-lg">
              {moment.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Ratings breakdown */}
        <div className="glass rounded-3xl p-5">
          <h3 className="font-display text-white font-bold mb-4">Valoració detallada</h3>
          <div className="flex flex-col gap-3">
            {RATING_CATEGORIES.map(cat => {
              const val = moment.rating[cat.key]
              return (
                <div key={cat.key} className="flex items-center gap-3">
                  <span className="text-lg w-7">{cat.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-body text-white/70 text-xs">{cat.label}</span>
                      <span className="font-body text-sunset-300 text-xs font-semibold">{val}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <div
                          key={n}
                          className="flex-1 h-1.5 rounded-full"
                          style={{ background: n <= val ? '#f97316' : 'rgba(255,255,255,0.1)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Note */}
        {moment.note && (
          <div className="glass rounded-3xl p-5">
            <h3 className="font-body text-white/50 text-xs uppercase tracking-wider mb-2">Nota personal</h3>
            <p className="font-display text-white/80 italic text-base leading-relaxed">
              "{moment.note}"
            </p>
          </div>
        )}

        {/* Location */}
        {moment.location && (
          <div className="glass rounded-3xl p-5">
            <h3 className="font-body text-white/50 text-xs uppercase tracking-wider mb-2">Ubicació</h3>
            {moment.location.placeName && (
              <p className="font-body text-white font-medium">📍 {moment.location.placeName}</p>
            )}
            {moment.location.lat !== 0 && (
              <p className="font-mono text-white/30 text-xs mt-1">
                {moment.location.lat}, {moment.location.lng}
              </p>
            )}
          </div>
        )}

        {/* Share CTA */}
        <button onClick={() => setShowShare(true)} className="btn-primary">
          <span>↗</span> Comparteix aquest moment
        </button>

        <div className="h-4" />
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal moment={moment} onClose={() => setShowShare(false)} />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 flex items-end justify-center p-4"
          style={{ zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div className="glass-dark rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-display text-white text-xl font-bold text-center mb-2">
              Eliminar moment?
            </h3>
            <p className="font-body text-white/50 text-sm text-center mb-6">
              Aquesta acció no es pot desfer. El moment s'eliminarà permanentment.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">
                Cancel·lar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-red-500/80 text-white font-semibold font-body"
                style={{ minHeight: 56 }}
              >
                {deleting ? 'Eliminant...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
