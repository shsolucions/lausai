export type MomentType = 'breakfast' | 'lunch' | 'dinner'

export interface RatingData {
  quality: number     // Qualitat del plat
  ambiance: number    // Ambient del lloc
  service: number     // Atenció al client
  taste: number       // Sabor
  value: number       // Relació qualitat-preu
}

export interface GeoLocation {
  lat: number
  lng: number
  placeName?: string
}

export interface Moment {
  id: string
  type: MomentType
  photoDataUrl: string
  rating: RatingData
  note?: string
  location?: GeoLocation
  createdAt: number   // timestamp ms
  averageRating: number
}

export type Screen = 'home' | 'capture' | 'rating' | 'diary' | 'map' | 'detail'

export interface AppState {
  screen: Screen
  moments: Moment[]
  selectedMomentId?: string
  // Capture flow state
  captureType?: MomentType
  capturePhoto?: string
}

export const MOMENT_LABELS: Record<MomentType, { ca: string; emoji: string; color: string }> = {
  breakfast: { ca: 'Esmorzar', emoji: '☀️', color: 'chip-breakfast' },
  lunch:     { ca: 'Dinar',    emoji: '🌤️', color: 'chip-lunch' },
  dinner:    { ca: 'Sopar',    emoji: '🌙', color: 'chip-dinner' },
}

export const RATING_CATEGORIES: Array<{ key: keyof RatingData; label: string; emoji: string }> = [
  { key: 'quality',  label: 'Qualitat',         emoji: '🍽️' },
  { key: 'ambiance', label: 'Ambient',           emoji: '🌿' },
  { key: 'service',  label: 'Atenció',           emoji: '👋' },
  { key: 'taste',    label: 'Sabor',             emoji: '😋' },
  { key: 'value',    label: 'Qualitat-Preu',     emoji: '💶' },
]

export function calcAverage(r: RatingData): number {
  return (r.quality + r.ambiance + r.service + r.taste + r.value) / 5
}

export function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('ca-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })
}
