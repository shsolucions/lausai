import { useEffect, useRef, useState } from 'react'
import type { Moment } from '../types'
import { MOMENT_LABELS, formatDate } from '../types'
import { getAllMoments } from '../lib/db'

interface Props {
  onSelectMoment: (id: string) => void
  refreshKey: number
}

export function MapScreen({ onSelectMoment, refreshKey }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [moments, setMoments] = useState<Moment[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const leafletMapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    getAllMoments().then(m => {
      const withLocation = m.filter(
        mom => mom.location && (mom.location.lat !== 0 || mom.location.lng !== 0)
      )
      setMoments(withLocation)
    })
  }, [refreshKey])

  useEffect(() => {
    if (!mapRef.current) return
    // Dynamic import Leaflet
    import('leaflet').then(L => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
      }

      const map = L.map(mapRef.current!, {
        center: [41.98, 2.82], // Catalunya
        zoom: 8,
        zoomControl: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      // Zoom controls (repositioned)
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      leafletMapRef.current = map
      setMapLoaded(true)
    })

    return () => {
      leafletMapRef.current?.remove()
      leafletMapRef.current = null
    }
  }, [])

  // Add markers when moments or map change
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current) return
    import('leaflet').then(L => {
      const map = leafletMapRef.current!
      // Clear existing markers
      map.eachLayer(layer => {
        if ((layer as L.Marker).getLatLng) map.removeLayer(layer)
      })

      moments.forEach(moment => {
        if (!moment.location || (moment.location.lat === 0 && moment.location.lng === 0)) return
        const info = MOMENT_LABELS[moment.type]

        // Custom icon
        const iconHtml = `
          <div style="
            width: 48px; height: 48px; border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: linear-gradient(135deg, #f97316, #ea580c);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 16px rgba(249,115,22,0.5);
            border: 2px solid rgba(255,255,255,0.3);
          ">
            <span style="transform: rotate(45deg); font-size: 20px;">${info.emoji}</span>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -52],
        })

        const marker = L.marker([moment.location!.lat, moment.location!.lng], { icon })

        const popupHtml = `
          <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
            <img src="${moment.photoDataUrl}" style="width:100%; height:80px; object-fit:cover; border-radius:8px; margin-bottom:8px;" />
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="font-size:14px;">${info.emoji}</span>
              <strong style="color:white; font-size:13px;">${info.ca}</strong>
              <span style="margin-left:auto; color:#fb923c; font-size:13px;">⭐ ${moment.averageRating.toFixed(1)}</span>
            </div>
            <p style="color:rgba(255,255,255,0.5); font-size:11px; margin:0 0 6px 0;">${formatDate(moment.createdAt)}</p>
            ${moment.location?.placeName ? `<p style="color:rgba(255,255,255,0.7); font-size:12px; margin:0 0 6px 0;">📍 ${moment.location.placeName}</p>` : ''}
            <button
              onclick="window.__lausaiSelectMoment('${moment.id}')"
              style="
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white; border: none; border-radius: 10px;
                padding: 8px 16px; width: 100%; cursor: pointer;
                font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
              "
            >
              Veure detall →
            </button>
          </div>
        `

        marker.bindPopup(L.popup({ maxWidth: 220 }).setContent(popupHtml))
        marker.addTo(map)
      })

      // Fit bounds if markers exist
      if (moments.length > 0) {
        const validMoments = moments.filter(m => m.location && (m.location.lat !== 0 || m.location.lng !== 0))
        if (validMoments.length > 0) {
          const bounds = L.latLngBounds(validMoments.map(m => [m.location!.lat, m.location!.lng]))
          map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
        }
      }
    })
  }, [moments, mapLoaded])

  // Global callback for popup buttons
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__lausaiSelectMoment = (id: string) => onSelectMoment(id)
    return () => { delete (window as unknown as Record<string, unknown>).__lausaiSelectMoment }
  }, [onSelectMoment])

  const momentCount = moments.length

  return (
    <div className="flex flex-col h-full" style={{ zIndex: 10 }}>
      {/* Header */}
      <div className="glass-dark px-5 pt-14 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white text-overlay">
            Mapa de moments 🗺️
          </h2>
          <div className="glass rounded-2xl px-3 py-1.5 text-center">
            <p className="font-body text-sunset-300 font-bold text-sm">{momentCount}</p>
            <p className="font-body text-white/40 text-xs">llocs</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {momentCount === 0 && mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="glass-dark rounded-3xl p-8 text-center mx-6">
              <div className="text-5xl mb-3 animate-float">📍</div>
              <p className="font-display text-white/80 text-lg font-medium">
                Sense moments al mapa
              </p>
              <p className="font-body text-white/40 text-sm mt-1">
                Activa la ubicació quan capturis el teu proper moment
              </p>
            </div>
          </div>
        )}

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-sunset-night">
            <div className="w-8 h-8 border-2 border-sunset-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
