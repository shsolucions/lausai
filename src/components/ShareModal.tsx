import { useState } from 'react'
import type { Moment } from '../types'
import { MOMENT_LABELS, formatDate } from '../types'

interface Props {
  moment: Moment
  onClose: () => void
}

export function ShareModal({ moment, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const info = MOMENT_LABELS[moment.type]

  const shareText = [
    `${info.emoji} ${info.ca} capturat amb LauSai`,
    `⭐ ${moment.averageRating.toFixed(1)}/5`,
    moment.location?.placeName ? `📍 ${moment.location.placeName}` : '',
    formatDate(moment.createdAt),
    moment.note ? `\n"${moment.note}"` : '',
    '\n#LauSai #momentgastronòmic',
  ].filter(Boolean).join('\n')

  // Opció A: Web Share API (nativa)
  const canWebShare = typeof navigator.share === 'function'
  const canShareFiles = typeof navigator.canShare === 'function'

  const handleNativeShare = async () => {
    try {
      // Try sharing with image file if supported
      if (canShareFiles) {
        const res = await fetch(moment.photoDataUrl)
        const blob = await res.blob()
        const file = new File([blob], 'lausai-moment.jpg', { type: 'image/jpeg' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: shareText })
          return
        }
      }
      // Fallback: share text only
      await navigator.share({ text: shareText })
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share error', err)
      }
    }
  }

  // Opció B: Descarrega imatge
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = moment.photoDataUrl
    a.download = `lausai-moment-${Date.now()}.jpg`
    a.click()
  }

  // Opció C: WhatsApp
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  // Copiar text
  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 40, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-dark rounded-t-4xl w-full max-w-lg animate-slide-up pb-safe">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Preview */}
        <div className="mx-5 mt-3 rounded-3xl overflow-hidden relative h-44">
          <img src={moment.photoDataUrl} alt="Moment" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2">
              <span className={`moment-chip ${info.color}`}>{info.emoji} {info.ca}</span>
              <span className="text-white/70 text-xs font-body ml-auto">⭐ {moment.averageRating.toFixed(1)}</span>
            </div>
            {moment.location?.placeName && (
              <p className="text-white/60 text-xs font-body mt-1">📍 {moment.location.placeName}</p>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 pb-6 flex flex-col gap-3">
          <h3 className="font-display text-white font-bold text-lg text-center">
            Comparteix el moment
          </h3>

          {/* Opció A: Share nativa */}
          {canWebShare && (
            <button onClick={handleNativeShare} className="btn-primary">
              <span>📤</span> Comparteix ara (WhatsApp, Instagram…)
            </button>
          )}

          {/* Opció C: WhatsApp directe */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2"
            style={{ minHeight: 56 }}
          >
            <span className="text-xl">💬</span>
            <span className="font-body font-medium text-white/80">WhatsApp directe</span>
          </a>

          {/* Opció B: Descarrega */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownload} className="btn-secondary text-sm">
              ⬇️ Descarrega foto
            </button>
            <button onClick={handleCopy} className="btn-secondary text-sm">
              {copied ? '✓ Copiat!' : '📋 Copiar text'}
            </button>
          </div>

          <button onClick={onClose} className="font-body text-white/30 text-sm py-2 mt-1">
            Tancar
          </button>
        </div>
      </div>
    </div>
  )
}
