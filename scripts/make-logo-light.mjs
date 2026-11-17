import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'public', 'logo.png')

async function makeLightVariant() {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha === 0) continue

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    const isGold = r > 130 && g > 100 && b < 120 && r > g && g > b

    if (isGold) {
      data[i] = Math.min(255, r + 20)
      data[i + 1] = Math.min(255, g + 15)
      data[i + 2] = Math.min(255, b + 10)
      continue
    }

    if (luminance < 170) {
      const amount = (170 - luminance) / 170
      data[i] = Math.round(r + (253 - r) * amount * 0.92)
      data[i + 1] = Math.round(g + (251 - g) * amount * 0.92)
      data[i + 2] = Math.round(b + (247 - b) * amount * 0.92)
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, 'public', 'logo-light.png'))

  console.log('Wrote logo-light.png')
}

await makeLightVariant()
