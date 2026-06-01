import fs from 'fs'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#3B82F6"/>
    <text x="50%" y="50%" font-size="${size/2}" fill="white" text-anchor="middle" dy=".3em" font-family="Arial" font-weight="bold">R</text>
  </svg>`
  
  // Simpan ke public
  fs.writeFileSync(`public/icon-${size}.svg`, svg)
  
  // Simpan juga ke dist
  fs.writeFileSync(`dist/icon-${size}.svg`, svg)
  
  console.log(`✅ Created icon-${size}.svg`)
})

// Buat favicon
const faviconSvg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" fill="#3B82F6"/>
  <text x="50%" y="50%" font-size="10" fill="white" text-anchor="middle" dy=".3em" font-family="Arial" font-weight="bold">R</text>
</svg>`
fs.writeFileSync('public/favicon.svg', faviconSvg)
fs.writeFileSync('dist/favicon.svg', faviconSvg)

console.log('✅ Created favicon.svg')
console.log('🎉 Icons created successfully!')
