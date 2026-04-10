import { useState } from 'react'
import type { MomentType, RatingData, GeoLocation } from '../types'
import { MOMENT_LABELS, RATING_CATEGORIES, calcAverage } from '../types'
import { saveMoment } from '../lib/db'

interface Props {
  photo: string
  momentType: MomentType
  onSaved: () => void
  onBack: () => void
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="star-btn"
          style={{ minWidth: 40, minHeight: 40 }}
          aria-label={`${n} estrella${n > 1 ? 'es' : ''}`}
        >
          {n <= (hover || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

type GeoStep = 'idle' | 'asking' | 'locating' | 'done' | 'denied' | 'manual'

export function RatingScreen({ photo, momentType, onSaved, onBack }: Props) {
  const [rating, setRating] = useState<RatingData>({ quality: 0, ambiance: 0, service: 0, taste: 0, value: 0 })
  const [note, setNote] = useState('')
  const [geoStep, setGeoStep] = useState<GeoStep>('idle')
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [manualPlace, setManualPlace] = useState('')
  const [saving, setSaving] = useState(false)

  const updateRating = (key: keyof RatingData, val: number) => {
    setRating(prev => ({ ...prev, [key]: val }))
  }

  const requestGeo = () => {
    setGeoStep('locating')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: Math.round(pos.coords.latitude * 1000) / 1000,
          lng: Math.round(pos.coords.longitude * 1000) / 1000,
        })
        setGeoStep('done')
      },
      () => setGeoStep('denied'),
      { timeout: 10000 }
    )
  }

  const handleSave = async () => {
    setSaving(true)
    const avg = calcAverage(rating)
    const finalLocation: GeoLocation | undefined = location
      ? { ...location, placeName: manualPlace || undefined }
      : manualPlace
      ? { lat: 0, lng: 0, placeName: manualPlace }
      : undefined

    const moment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: momentType,
      photoDataUrl: photo,
      rating,
      note: note.trim() || undefined,
      location: finalLocation,
      createdAt: Date.now(),
      averageRating: avg,
    }
    await saveMoment(moment)
    setSaving(false)
    onSaved()
  }

  const allRated = Object.values(rating).every(v => v > 0)

  return (
    <div className="flex flex-col h-full screen-enter" style={{ zIndex: 10 }}>
      {/* Header with photo */}
      <div className="relative h-44 shrink-0">
        <img src={photo} alt="Moment capturat" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-5 py-4 mt-10">
          <button onClick={onBack} className="text-white/70 p-2 -ml-2">← Enrere</button>
          <span className={`moment-chip ${MOMENT_LABELS[momentType].color}`}>
            {MOMENT_LABELS[momentType].emoji} {MOMENT_LABELS[momentType].ca}
          </span>
        </div>
        <div className="absolute bottom-4 left-5">
          <p className="font-display text-white text-xl font-bold text-overlay">Com t'ha semblat?</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Rating categories */}
        <div className="glass rounded-3xl p-5 flex flex-col gap-4">
          {RATING_CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{cat.emoji}</span>
              <div className="flex-1">
                <p className="font-body text-white text-sm font-medium mb-1">{cat.label}</p>
                <StarRating
                  value={rating[cat.key]}
                  onChange={v => updateRating(cat.key, v)}
                />
              </div>
            </div>
          ))}

          {/* Average preview */}
          {allRated && (
            <div className="mt-2 pt-4 border-t border-white/10 flex items-center gap-2">
              <span className="font-body text-white/50 text-sm">Mitjana:</span>
              <div className="flex items-center gap-1">
                {'⭐'.repeat(Math.round(calcAverage(rating)))}
              </div>
              <span className="font-display text-sunset-300 font-bold">
                {calcAverage(rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="glass rounded-3xl p-5">
          <label className="font-body text-white text-sm font-medium block mb-2">
            💬 Nota personal (opcional)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Com descriuries aquest moment? Alguna cosa especial que vols recordar..."
            className="textarea-field"
            rows={3}
            maxLength={500}
          />
          <p className="text-white/25 text-xs text-right mt-1 font-body">{note.length}/500</p>
        </div>

        {/* Geolocation */}
        <div className="glass rounded-3xl p-5">
          <p className="font-body text-white text-sm font-medium mb-3">
            📍 Afegir ubicació (opcional)
          </p>

          {geoStep === 'idle' && (
            <div className="flex flex-col gap-2">
              <button onClick={() => setGeoStep('asking')} className="btn-secondary text-sm">
                📡 Usar la meva ubicació actual
              </button>
              <button onClick={() => setGeoStep('manual')} className="btn-secondary text-sm">
                ✏️ Escriure el nom del lloc
              </button>
            </div>
          )}

          {geoStep === 'asking' && (
            <div className="glass rounded-2xl p-4 border border-sunset-400/30">
              <p className="font-body text-white/80 text-sm mb-3 leading-relaxed">
                Usarem la teva posició GPS per posar aquest moment al mapa. Pots dir que no i continuar sense ubicació.
              </p>
              <div className="flex gap-2">
                <button onClick={requestGeo} className="btn-primary text-sm flex-1" style={{ minHeight: 44 }}>
                  Sí, ubicar-me
                </button>
                <button onClick={() => setGeoStep('idle')} className="btn-secondary text-sm flex-1" style={{ minHeight: 44 }}>
                  No, gràcies
                </button>
              </div>
            </div>
          )}

          {geoStep === 'locating' && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-5 h-5 rounded-full border-2 border-sunset-400 border-t-transparent animate-spin" />
              <p className="font-body text-white/60 text-sm">Obtenint ubicació...</p>
            </div>
          )}

          {geoStep === 'done' && location && (
            <div className="flex items-center gap-2 py-2">
              <span className="text-green-400">✓</span>
              <p className="font-body text-white/70 text-sm">
                Ubicació afegida ({location.lat}, {location.lng})
              </p>
              <button onClick={() => { setLocation(null); setGeoStep('idle') }} className="ml-auto text-white/30 text-xs">Eliminar</button>
            </div>
          )}

          {geoStep === 'denied' && (
            <div className="glass rounded-2xl p-3 border border-red-400/20">
              <p className="font-body text-red-300 text-sm">No hem pogut obtenir la ubicació. Prova d'escriure el nom del lloc:</p>
              <button onClick={() => setGeoStep('manual')} className="text-sunset-400 text-sm mt-1">Escriure manualment →</button>
            </div>
          )}

          {geoStep === 'manual' && (
            <div>
              <input
                type="text"
                value={manualPlace}
                onChange={e => setManualPlace(e.target.value)}
                placeholder="Ex: Restaurant La Plaça, Girona"
                className="input-field"
              />
              <button onClick={() => setGeoStep('idle')} className="text-white/30 text-xs mt-2">← Tornar</button>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary mb-4"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Desant...
            </span>
          ) : (
            <><span>✨</span> Desa el moment</>
          )}
        </button>

        <div className="h-4" />
      </div>
    </div>
  )
}
