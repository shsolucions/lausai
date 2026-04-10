import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `Ets l'assistent de LauSai, una app web per capturar i recordar moments gastronòmics (esmorzars, dinars i sopars). El teu nom és Sultan.

La teva personalitat:
- Proper, càlid i entusiasta de la gastronomia
- Respostes curtes i útils (màxim 3 frases llevat que calgui més)
- Sempre en català (llevat que l'usuari t'escrigui en castellà o anglès, llavors adapta't)
- Usa emojis moderadament

El que pots ajudar:
- Com usar LauSai (capturar moments, valorar, compartir, mapa)
- Consells per fotografiar menjar
- Recomanacions gastronòmiques generals
- Resoldre dubtes sobre permisos de càmera/ubicació
- Motivar l'usuari a capturar més moments

Si no saps alguna cosa, sigues honest i suggereix on trobar ajuda.`

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hola! Sóc en Sultan, el teu assistent gastronòmic 🥑 Com puc ajudar-te avui?'
      }])
      setTimeout(() => inputRef.current?.focus(), 300)
    }
    if (open) setHasNew(false)
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text ?? 'Ho sento, ha hagut un error. Torna-ho a provar.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setHasNew(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'No he pogut connectar. Comprova la connexio i torna-ho a provar.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-4 w-80 max-h-[70vh] flex flex-col rounded-3xl overflow-hidden screen-enter"
          style={{ zIndex: 30, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, #3f6212, #14532d)' }}
          >
            <img
              src="/icons/avocado.png"
              alt="Sultan"
              style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-display text-white font-bold text-sm">Sultan</p>
              <p className="font-body text-white/70 text-xs">Assistent LauSai</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              style={{ minWidth: 32, minHeight: 32 }}
            >✕</button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            style={{ background: 'rgba(10,20,5,0.93)', backdropFilter: 'blur(20px)' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <img
                    src="/icons/avocado.png"
                    alt="Sultan"
                    style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, marginRight: 8, marginTop: 4 }}
                  />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 font-body text-sm leading-relaxed ${
                    msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                  }`}
                  style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #f97316, #ea580c)'
                      : 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.92)',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-2">
                <img src="/icons/avocado.png" alt="Sultan" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
                <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft"
                        style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 p-3 shrink-0"
            style={{ background: 'rgba(10,20,5,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escriu un missatge..."
              className="flex-1 bg-transparent text-white placeholder-white/30 font-body text-sm outline-none"
              style={{ minHeight: 36 }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
              style={{
                minWidth: 36, minHeight: 36,
                background: input.trim() && !loading ? 'linear-gradient(135deg, #4d7c0f, #166534)' : 'rgba(255,255,255,0.1)'
              }}
              aria-label="Enviar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="flex flex-col gap-1.5 px-3 pb-3" style={{ background: 'rgba(10,20,5,0.97)' }}>
              {['Com capturo un moment?', 'Com comparteixo una foto?', 'Per que cal activar la ubicacio?'].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50) }}
                  className="text-left text-xs font-body text-green-400/70 hover:text-green-300 px-3 py-1.5 rounded-xl hover:bg-green-900/20 transition-colors border border-white/5"
                  style={{ minHeight: 32 }}
                >{q}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB — avocado gran, fons transparent */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-[82px] right-3 transition-all duration-300 active:scale-90"
        style={{
          zIndex: 30,
          width: 72, height: 72,
          minWidth: 72, minHeight: 72,
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
        aria-label={open ? 'Tancar assistent' : 'Obrir assistent Sultan'}
      >
        {open ? (
          <div className="w-full h-full rounded-full glass-dark flex items-center justify-center border border-white/20">
            <span className="text-white/80 text-2xl">✕</span>
          </div>
        ) : (
          <img
            src="/icons/avocado.png"
            alt="Sultan"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))',
            }}
            className="animate-float"
          />
        )}

        {hasNew && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />
        )}
      </button>
    </>
  )
}
