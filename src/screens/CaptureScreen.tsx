import { useRef, useState, useCallback } from 'react'
import type { MomentType } from '../types'
import { MOMENT_LABELS } from '../types'

interface Props {
  onPhotoTaken: (photo: string, type: MomentType) => void
  onBack: () => void
}

type Step = 'select-type' | 'pre-camera' | 'camera' | 'preview'

export function CaptureScreen({ onPhotoTaken, onBack }: Props) {
  const [step, setStep] = useState<Step>('select-type')
  const [momentType, setMomentType] = useState<MomentType>('lunch')
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('')
  const [cameraError, setCameraError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openCamera = useCallback(async () => {
    setCameraError('')
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      setStep('camera')
    } catch {
      setCameraError('No hem pogut accedir a la càmera. Prova de pujar una foto des de la galeria.')
    }
  }, [])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width = v.videoWidth
    c.height = v.videoHeight
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.85)
    setPhotoDataUrl(dataUrl)
    // Stop camera stream
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setStep('preview')
  }, [stream])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPhotoDataUrl(result)
      setStep('preview')
    }
    reader.readAsDataURL(file)
  }

  const retake = () => {
    stream?.getTracks().forEach(t => t.stop())
    setPhotoDataUrl('')
    setStep('pre-camera')
  }

  const confirm = () => {
    stream?.getTracks().forEach(t => t.stop())
    onPhotoTaken(photoDataUrl, momentType)
  }

  // ── STEP: SELECT TYPE ──
  if (step === 'select-type') {
    return (
      <div className="flex flex-col h-full screen-enter" style={{ zIndex: 10, paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="glass-dark flex items-center gap-3 px-5 py-4 mt-12">
          <button onClick={onBack} className="text-white/70 p-2 -ml-2" style={{ minWidth: 44 }}>
            ← Enrere
          </button>
          <h2 className="font-display text-xl font-bold text-white text-overlay flex-1">
            Nou moment
          </h2>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 gap-6">
          <div className="text-center mb-4">
            <p className="font-display text-2xl text-white text-overlay font-medium">
              Quin moment és aquest?
            </p>
            <p className="font-body text-white/50 text-sm mt-1">
              Tria el tipus d'àpat per contextualitzar el record
            </p>
          </div>

          {(['breakfast', 'lunch', 'dinner'] as MomentType[]).map(type => {
            const info = MOMENT_LABELS[type]
            const isSelected = momentType === type
            return (
              <button
                key={type}
                onClick={() => setMomentType(type)}
                className={`flex items-center gap-4 p-5 rounded-3xl transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'glass-amber border-sunset-400/50'
                    : 'glass border-white/10'
                }`}
                style={{ minHeight: 72, border: isSelected ? '2px solid rgba(249,115,22,0.5)' : undefined }}
              >
                <span className="text-4xl">{info.emoji}</span>
                <div className="text-left">
                  <p className={`font-display text-xl font-bold ${isSelected ? 'text-sunset-300' : 'text-white'}`}>
                    {info.ca}
                  </p>
                  <p className="font-body text-white/40 text-xs">
                    {type === 'breakfast' && 'El millor inici del dia'}
                    {type === 'lunch' && 'Pausa i plaer al migdia'}
                    {type === 'dinner' && 'El moment màgic de la nit'}
                  </p>
                </div>
                {isSelected && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-sunset-500 flex items-center justify-center text-white text-xs">✓</div>
                )}
              </button>
            )
          })}

          <button
            onClick={() => setStep('pre-camera')}
            className="btn-primary mt-4"
          >
            Continuar →
          </button>
        </div>
      </div>
    )
  }

  // ── STEP: PRE-CAMERA (permission explanation) ──
  if (step === 'pre-camera') {
    return (
      <div className="flex flex-col h-full screen-enter" style={{ zIndex: 10, paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="glass-dark flex items-center gap-3 px-5 py-4 mt-12">
          <button onClick={() => setStep('select-type')} className="text-white/70 p-2 -ml-2">← Enrere</button>
          <h2 className="font-display text-xl font-bold text-white text-overlay">
            {MOMENT_LABELS[momentType].emoji} {MOMENT_LABELS[momentType].ca}
          </h2>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 gap-6 text-center">
          <div className="text-8xl animate-float">📷</div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-xl text-white font-bold mb-2">
              Llest per capturar?
            </h3>
            <p className="font-body text-white/60 text-sm leading-relaxed">
              Necessitem accés a la càmera per fotografiar el teu moment.
              <br /><br />
              El teu dispositiu et demanarà permís — és <strong className="text-sunset-300">solo per a LauSai</strong> i no guardem res sense el teu consentiment.
            </p>
          </div>

          {cameraError && (
            <div className="glass rounded-2xl p-4 border border-red-400/30">
              <p className="text-red-300 text-sm font-body">{cameraError}</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            <button onClick={openCamera} className="btn-primary">
              <span>📷</span> Obrir càmera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
            >
              <span>🖼️</span> Pujar des de la galeria
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileInput}
            />
            <button onClick={onBack} className="text-white/40 text-sm py-2 font-body">
              Cancel·lar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP: CAMERA ──
  if (step === 'camera') {
    return (
      <div className="flex flex-col h-full bg-black" style={{ zIndex: 20 }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
          <div className="flex justify-between items-start">
            <button
              onClick={() => { stream?.getTracks().forEach(t => t.stop()); setStep('pre-camera') }}
              className="glass-dark rounded-full w-11 h-11 flex items-center justify-center text-white"
            >
              ✕
            </button>
            <span className={`moment-chip ${MOMENT_LABELS[momentType].color}`}>
              {MOMENT_LABELS[momentType].emoji} {MOMENT_LABELS[momentType].ca}
            </span>
          </div>

          {/* Guide frame */}
          <div className="flex-1 flex items-center justify-center my-8">
            <div className="w-full max-w-xs aspect-square rounded-3xl border-2 border-white/30" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }} />
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={takePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
              aria-label="Fer foto"
            >
              <div className="w-16 h-16 rounded-full border-4 border-gray-300" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP: PREVIEW ──
  return (
    <div className="flex flex-col h-full bg-black screen-enter" style={{ zIndex: 10 }}>
      <img
        src={photoDataUrl}
        alt="Previsualització"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 flex flex-col justify-between p-6"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)' }}
      >
        <div className="text-center">
          <p className="font-display text-white text-lg font-bold text-overlay">T'agrada la foto?</p>
        </div>
        <div className="flex gap-4">
          <button onClick={retake} className="btn-secondary flex-1">
            🔄 Repetir
          </button>
          <button onClick={confirm} className="btn-primary flex-1">
            ✓ Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
