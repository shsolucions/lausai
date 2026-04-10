export interface SunsetPalette {
  sunX: number
  sunSize: number
  sunColor: string
  cloudOpacity: number
  horizonColor: string
  midColor: string
  zenithColor: string
  glowColor: string
  glowColorTransparent: string
  glowColorMid: string
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function seededRand(seed: number, offset: number): number {
  const x = Math.sin(seed * 127.1 + offset * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function generateSunsetPalette(): SunsetPalette {
  const day = dayOfYear()
  const r0 = seededRand(day, 0)
  const r1 = seededRand(day, 1)
  const r2 = seededRand(day, 2)
  const r3 = seededRand(day, 3)
  const r4 = seededRand(day, 4)

  const horizonH = Math.round(5  + r0 * 40)
  const horizonS = Math.round(80 + r1 * 15)
  const horizonL = Math.round(45 + r2 * 15)

  const midH = Math.round(horizonH + 10 + r1 * 15)
  const midS = Math.round(70 + r2 * 10)
  const midL = Math.round(40 + r0 * 10)

  const zenithH = Math.round(220 + r3 * 60)
  const zenithS = Math.round(50  + r4 * 20)
  const zenithL = Math.round(10  + r2 * 10)

  const sunH = Math.round(40 + r0 * 20)
  const sunX = Math.round(15 + r1 * 70)
  const sunSize = Math.round(60 + r2 * 40)

  return {
    sunX,
    sunSize,
    sunColor:            hsl(sunH, 95, 68),
    cloudOpacity:        0.15 + r3 * 0.25,
    horizonColor:        hsl(horizonH, horizonS, horizonL),
    midColor:            hsl(midH, midS, midL),
    zenithColor:         hsl(zenithH, zenithS, zenithL),
    glowColor:           hsl(sunH, 100, 55),
    glowColorTransparent: `hsla(${sunH}, 100%, 55%, 0)`,
    glowColorMid:        `hsla(${sunH}, 100%, 55%, 0.3)`,
  }
}
