import { createCanvas } from 'canvas'
import fs from 'fs'

// Install canvas jika belum
try {
  await import('canvas')
} catch {
  console.log('Installing canvas...')
  execSync('npm install canvas', { stdio: 'inherit' })
}

import { execSync } from 'child_process'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

sizes.forEach(size => {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Background
  ctx.fillStyle = '#3B82F6'
  ctx.fillRect(0, 0, size, size)
  
  // Text
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${size/2}px "Arial"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('R', size/2, size/2)
  
  // Save to buffer
  const buffer = canvas.toBuffer('image/png')
  
  // Save to public
  fs.writeFileSync(`public/icon-${size}.png`, buffer)
  
  // Save to dist (if exists)
  if (fs.existsSync('dist')) {
    fs.writeFileSync(`dist/icon-${size}.png`, buffer)
  }
  
  console.log(`✅ Created icon-${size}.png`)
})

console.log('🎉 All icons created!')
