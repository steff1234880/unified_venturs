import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(
  root,
  'public',
  'logo.png',
)
const output = path.join(root, 'public', 'logo.png')

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const saturation = max === 0 ? 0 : (max - min) / max

  const isNearWhite = r >= 235 && g >= 235 && b >= 235
  const isLowSaturationLight = max >= 220 && saturation <= 0.12

  if (isNearWhite || isLowSaturationLight) {
    data[i + 3] = 0
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
  .toFile(output)

console.log(`Wrote transparent logo to ${output}`)
