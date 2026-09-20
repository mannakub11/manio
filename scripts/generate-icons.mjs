/**
 * Rasterises scripts/icon.svg into the PNGs the manifest and iOS ask for.
 * Run with: npm run icons
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const svg = await readFile(resolve(here, 'icon.svg'))
const outDir = resolve(here, '..', 'public')
await mkdir(outDir, { recursive: true })

const render = (size) => sharp(svg, { density: 512 }).resize(size, size).png()

// A maskable icon is cropped to a circle by some launchers, so the mark has to
// sit inside the middle 80%.
const maskable = async (size) => {
  const inner = Math.round(size * 0.8)
  const pad = Math.round((size - inner) / 2)
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#1E3932',
    },
  })
    .composite([{ input: await render(inner).toBuffer(), top: pad, left: pad }])
    .png()
}

const jobs = [
  ['pwa-192x192.png', render(192)],
  ['pwa-512x512.png', render(512)],
  ['apple-touch-icon.png', render(180)],
  ['maskable-512x512.png', await maskable(512)],
]

for (const [name, pipeline] of jobs) {
  await writeFile(resolve(outDir, name), await pipeline.toBuffer())
  console.log(`wrote public/${name}`)
}

await writeFile(resolve(outDir, 'favicon.svg'), svg)
console.log('wrote public/favicon.svg')
