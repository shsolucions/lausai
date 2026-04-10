interface Props {
  onDone: () => void
}

const steps = [
  {
    emoji: '📷',
    title: 'Captura el moment',
    description: 'Fes una foto del teu plat, cafè o beguda en qualsevol moment del dia.',
  },
  {
    emoji: '⭐',
    title: 'Valora l\'experiència',
    description: 'Puntua sabor, ambient, atenció i molt més. Afegeix una nota personal.',
  },
  {
    emoji: '✨',
    title: 'Fes-lo etern',
    description: 'Revisa el teu diari, explora el mapa de moments i comparteix quan vulguis.',
  },
]

export function OnboardingScreen({ onDone }: Props) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between px-6 py-10"
      style={{ zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className="text-center pt-8">
        <h1 className="font-display text-5xl font-black text-white text-overlay">
          Lau<span className="text-sunset-400">Sai</span>
        </h1>
        <p className="font-display italic text-white/60 text-base mt-2">
          captura el teu moment i fes-lo etern
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-5 w-full max-w-sm">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-4 glass rounded-3xl p-4 animate-fade-up"
            style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both', opacity: 0 }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(234,88,12,0.2))' }}
            >
              {s.emoji}
            </div>
            <div>
              <p className="font-display text-white font-bold text-base">{s.title}</p>
              <p className="font-body text-white/50 text-sm mt-0.5 leading-relaxed">{s.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'both', opacity: 0 }}>
        <button onClick={onDone} className="btn-primary text-lg">
          Comença el meu diari 🍽️
        </button>
        <p className="font-body text-white/25 text-xs text-center mt-3">
          Les teves dades es guarden localment al teu dispositiu
        </p>
      </div>
    </div>
  )
}
