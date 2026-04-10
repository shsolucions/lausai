import { useMemo } from 'react'
import { generateSunsetPalette } from '../lib/sunset'

export function SunsetBackground() {
  const p = useMemo(() => generateSunsetPalette(), [])

  return (
    <>
      {/* Sky gradient */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `linear-gradient(to top, ${p.horizonColor} 0%, ${p.midColor} 35%, ${p.zenithColor} 100%)`,
      }} />

      {/* Sun glow */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 1, pointerEvents: 'none',
        left: `calc(${p.sunX}% - ${p.sunSize * 3}px)`,
        top: `calc(35% - ${p.sunSize * 3}px)`,
        width: p.sunSize * 6,
        height: p.sunSize * 6,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${p.glowColorMid} 0%, ${p.glowColorTransparent} 70%)`,
      }} />

      {/* Sun disc */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 2, pointerEvents: 'none',
        left: `calc(${p.sunX}% - ${p.sunSize / 2}px)`,
        top: `calc(35% - ${p.sunSize / 2}px)`,
        width: p.sunSize,
        height: p.sunSize,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 40%, #fff9e6, ${p.sunColor} 60%, ${p.glowColor})`,
        boxShadow: `0 0 ${p.sunSize}px ${p.glowColorMid}`,
      }} />

      {/* Horizon shimmer */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 3, pointerEvents: 'none',
        left: 0, right: 0, top: '37%', height: '3%',
        background: 'linear-gradient(to right, transparent, rgba(255,210,100,0.25) 50%, transparent)',
      }} />

      {/* Cloud 1 */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 3, pointerEvents: 'none',
        left: '8%', top: '22%', width: '22%', height: 16,
        borderRadius: '50%', filter: 'blur(14px)',
        background: 'rgba(255,210,160,0.6)',
        opacity: p.cloudOpacity,
      }} />
      {/* Cloud 2 */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 3, pointerEvents: 'none',
        left: '38%', top: '17%', width: '28%', height: 18,
        borderRadius: '50%', filter: 'blur(16px)',
        background: 'rgba(255,200,150,0.6)',
        opacity: p.cloudOpacity * 0.9,
      }} />
      {/* Cloud 3 */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 3, pointerEvents: 'none',
        left: '68%', top: '28%', width: '20%', height: 14,
        borderRadius: '50%', filter: 'blur(12px)',
        background: 'rgba(255,220,180,0.5)',
        opacity: p.cloudOpacity * 0.7,
      }} />

      {/* Bottom dark vignette */}
      <div aria-hidden="true" style={{
        position: 'fixed', zIndex: 4, pointerEvents: 'none',
        left: 0, right: 0, bottom: 0, height: '30%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
      }} />
    </>
  )
}
