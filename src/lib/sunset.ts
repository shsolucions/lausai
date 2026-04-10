/**
 * LauSai Sunset System
 * Genera una posta de sol única cada dia basada en la data local.
 * Cap imatge externa necessària: tot és CSS/SVG algorítmic.
 */

export interface SunsetPalette {
  gradient: string
  sunX: number       // percentatge 0-100
  sunSize: number    // px
  sunColor: string
  cloudOpacity: number
  horizonColor: string
  midColor: string
  zenithColor: string
  glowColor: string
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Pseudo-random number seeded by day
function seededRand(seed: number, offset: number = 0): number {
  const x = Math.sin(seed * 127.1 + offset * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function generateSunsetPalette(dateOverride?: Date): SunsetPalette {
  const day = dateOverride
    ? ((): number => {
        const start = new Date(dateOverride.getFullYear(), 0, 0)
        return Math.floor((dateOverride.getTime() - start.getTime()) / 86400000)
      })()
    : dayOfYear()

  const r0 = seededRand(day, 0)
  const r1 = seededRand(day, 1)
  const r2 = seededRand(day, 2)
  const r3 = seededRand(day, 3)
  const r4 = seededRand(day, 4)

  // Horizon: warm reds/oranges/ambers (5–45 hue)
  const horizonH = 5 + r0 * 40
  const horizonS = 80 + r1 * 15
  const horizonL = 45 + r2 * 15
  const horizonColor = hsl(horizonH, horizonS, horizonL)

  // Mid: warm transition (15–50 hue, medium saturation)
  const midH = horizonH + 10 + r1 * 15
  const midColor = hsl(midH, 70 + r2 * 10, 40 + r0 * 10)

  // Zenith: deep blue-purples-navies (220–280 hue)
  const zenithH = 220 + r3 * 60
  const zenithColor = hsl(zenithH, 50 + r4 * 20, 10 + r2 * 10)

  // Sun
  const sunX = 15 + r1 * 70   // 15% to 85%
  const sunSize = 60 + r2 * 40
  const sunH = 40 + r0 * 20
  const sunColor = hsl(sunH, 95, 68)
  const glowColor = hsl(sunH, 100, 55)

  // Clouds
  const cloudOpacity = 0.15 + r3 * 0.25

  // Build CSS gradient
  const gradient = `
    linear-gradient(
      to top,
      ${horizonColor} 0%,
      ${hsl(horizonH + 5, horizonS - 5, horizonL + 5)} 15%,
      ${midColor} 35%,
      ${hsl(zenithH - 20, 55, 18)} 65%,
      ${zenithColor} 100%
    )
  `.trim()

  return {
    gradient,
    sunX,
    sunSize,
    sunColor,
    cloudOpacity,
    horizonColor,
    midColor,
    zenithColor,
    glowColor,
  }
}

// CSS variables string to inject into :root
export function sunsetToCSSVars(p: SunsetPalette): Record<string, string> {
  return {
    '--sunset-gradient': p.gradient,
    '--sun-x': `${p.sunX}%`,
    '--sun-size': `${p.sunSize}px`,
    '--sun-color': p.sunColor,
    '--sun-glow': p.glowColor,
    '--cloud-opacity': String(p.cloudOpacity),
    '--horizon-color': p.horizonColor,
  }
}
