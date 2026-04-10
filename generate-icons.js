#!/usr/bin/env node
// Run: node generate-icons.js
// Requires: npm install -g sharp (or run from project root after npm install)
// This creates placeholder PNG icons - replace with real ones before launch

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, size, 0, 0)
  grad.addColorStop(0, '#f97316')
  grad.addColorStop(1, '#7e22ce')

  // Rounded rect
  const r = size * 0.22
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  // Sun circle
  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.5, size * 0.22, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'
  ctx.fill()

  // Text
  ctx.fillStyle = '#92400e'
  ctx.font = `bold ${size * 0.18}px Georgia`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('LS', size * 0.5, size * 0.5)

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync('public/icons/icon-192.png', generateIcon(192))
  writeFileSync('public/icons/icon-512.png', generateIcon(512))
  console.log('Icons generated!')
} catch {
  console.log('Canvas not available - create icons manually or use an online tool')
}
