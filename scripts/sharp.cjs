const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const pngToIco = require('png-to-ico')

const svg = fs.readFileSync(path.join(__dirname, 'logo.svg'))

async function main() {
  const sizes = [32, 128]

  for (let size of sizes) {
    const pathName = path.join(__dirname, `../src-tauri/icons/${size}x${size}.png`)
    const item = sharp(svg)
      .resize(size, size)
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toColourspace('srgb')
      .png()
    await item.toFile(pathName)
    if (size === 32) {
      const buffer = await pngToIco(pathName)
      fs.writeFileSync(path.join(__dirname, '../src-tauri/icons/icon.ico'), buffer)
    }
  }
}

main()
