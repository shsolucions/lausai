import { useEffect, useRef } from 'react'
import { generateSunsetPalette } from '../lib/sunset'

export function SunsetBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const palette = generateSunsetPalette()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width = window.innerWidth
      const H = canvas.height = window.innerHeight

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, H, 0, 0)
      skyGrad.addColorStop(0, palette.horizonColor)
      skyGrad.addColorStop(0.15, palette.midColor)
      skyGrad.addColorStop(0.55, palette.zenithColor)
      skyGrad.addColorStop(1, palette.zenithColor)
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, H)

      // Sun glow (big soft circle)
      const sunX = (palette.sunX / 100) * W
      const sunY = H * 0.38
      const glowR = palette.sunSize * 3.5
      const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR)
      glowGrad.addColorStop(0, palette.glowColor + 'cc')
      glowGrad.addColorStop(0.3, palette.glowColor + '55')
      glowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(sunX, sunY, glowR, 0, Math.PI * 2)
      ctx.fill()

      // Sun disc
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, palette.sunSize / 2)
      sunGrad.addColorStop(0, '#fff9e6')
      sunGrad.addColorStop(0.4, palette.sunColor)
      sunGrad.addColorStop(1, palette.glowColor)
      ctx.fillStyle = sunGrad
      ctx.beginPath()
      ctx.arc(sunX, sunY, palette.sunSize / 2, 0, Math.PI * 2)
      ctx.fill()

      // Horizon shimmer line
      const shimmer = ctx.createLinearGradient(0, 0, W, 0)
      shimmer.addColorStop(0, 'transparent')
      shimmer.addColorStop(0.3, 'rgba(255,200,100,0.15)')
      shimmer.addColorStop(0.5, 'rgba(255,220,120,0.3)')
      shimmer.addColorStop(0.7, 'rgba(255,200,100,0.15)')
      shimmer.addColorStop(1, 'transparent')
      ctx.fillStyle = shimmer
      ctx.fillRect(0, H * 0.35, W, H * 0.03)

      // Soft clouds (ellipses)
      drawClouds(ctx, W, H, palette.cloudOpacity, palette.sunX)

      // Reflection shimmer at bottom
      const reflGrad = ctx.createLinearGradient(0, H * 0.75, 0, H)
      reflGrad.addColorStop(0, 'transparent')
      reflGrad.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = reflGrad
      ctx.fillRect(0, H * 0.75, W, H * 0.25)
    }

    function drawClouds(ctx: CanvasRenderingContext2D, W: number, H: number, opacity: number, sunX: number) {
      const seed = sunX
      const clouds = [
        { x: 0.15, y: 0.28, rx: 0.12, ry: 0.025 },
        { x: 0.55, y: 0.22, rx: 0.18, ry: 0.03 },
        { x: 0.78, y: 0.32, rx: 0.10, ry: 0.02 },
        { x: 0.35, y: 0.18, rx: 0.14, ry: 0.022 },
      ]
      clouds.forEach((c, i) => {
        const cx = ((c.x + (seed / 500) * (i % 2 === 0 ? 1 : -1)) % 1) * W
        const cy = c.y * H
        ctx.save()
        ctx.globalAlpha = opacity * (0.6 + (i % 3) * 0.2)
        ctx.fillStyle = `rgba(255, 220, 180, 0.6)`
        ctx.beginPath()
        ctx.ellipse(cx, cy, c.rx * W, c.ry * H, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
    }

    draw()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [palette])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      {/* Subtle noise texture for depth */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
    </>
  )
}
