import { darken, deriveAccentRamp, lighten, relativeLuminance } from './color'
import { THEME_PRESETS, DEFAULT_THEME_ID } from './themes'
import type { ThemePalette } from './types'

const HEX_RE = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g

const expand = (hex: string): string => {
  const v = hex.slice(1)
  return v.length === 3
    ? `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`.toLowerCase()
    : `#${v}`.toLowerCase()
}

const rgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})

const saturation = (hex: string): number => {
  const { r, g, b } = rgb(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}

const ROLE_HINTS: { role: 'accent' | 'surface' | 'text' | 'border'; patterns: RegExp[] }[] = [
  {
    role: 'accent',
    patterns: [
      /--(?:bs-)?primary\b/i,
      /--(?:color-)?primary\b/i,
      /--p\b/i,
      /\baccent\b/i,
      /\bbrand\b/i,
      /\btheme-color\b/i,
    ],
  },
  {
    role: 'surface',
    patterns: [/body-bg/i, /--(?:bs-)?white\b/i, /\bbackground\b/i, /\bsurface\b/i, /--b1\b/i],
  },
  {
    role: 'text',
    patterns: [/body-color/i, /\bforeground\b/i, /\btext\b/i, /--bc\b/i, /--(?:bs-)?dark\b/i],
  },
  { role: 'border', patterns: [/border-color/i, /\bborder\b/i, /--b3\b/i] },
]

export interface ExtractResult {
  palette: ThemePalette
  found: string[]
  namedRoles: string[]
  error?: string
}

const DEFAULTS = THEME_PRESETS[DEFAULT_THEME_ID].palette

export const extractPalette = (input: string): ExtractResult => {
  const text = input.trim()
  if (!text) {
    return { palette: { ...DEFAULTS }, found: [], namedRoles: [], error: 'Please enter or paste colors first.' }
  }

  const matches = text.match(HEX_RE) ?? []
  const found = [...new Set(matches.map(expand))]

  if (found.length === 0) {
    return {
      palette: { ...DEFAULTS },
      found: [],
      namedRoles: [],
      error: 'No hex color codes (e.g. #fe9f43) found.',
    }
  }

  const named: Partial<Record<'accent' | 'surface' | 'text' | 'border', string>> = {}
  const namedRoles: string[] = []

  for (const { role, patterns } of ROLE_HINTS) {
    if (named[role]) continue
    for (const pattern of patterns) {
      const lineRe = new RegExp(`^.*${pattern.source}.*$`, 'gim')
      const lineMatch = lineRe.exec(text)
      if (lineMatch) {
        const hex = lineMatch[0].match(HEX_RE)?.[0]
        if (hex) {
          named[role] = expand(hex)
          namedRoles.push(role)
          break
        }
      }
    }
  }

  const remaining = found.filter((h) => !Object.values(named).includes(h))
  const bySat = [...(remaining.length ? remaining : found)].sort(
    (a, b) => saturation(b) - saturation(a)
  )

  const accent = named.accent ?? bySat[0] ?? DEFAULTS.accent
  const ramp = deriveAccentRamp(accent)

  const light = [...found].filter((h) => relativeLuminance(h) > 0.85).sort((a, b) => relativeLuminance(b) - relativeLuminance(a))
  const dark = [...found].filter((h) => relativeLuminance(h) < 0.2).sort((a, b) => relativeLuminance(a) - relativeLuminance(b))

  const surface = named.surface ?? light[0] ?? '#ffffff'
  const textClr = named.text ?? dark[0] ?? '#1b2850'
  const border = named.border ?? (surface === '#ffffff' ? '#e5e7eb' : darken(surface, 0.12))

  return {
    palette: {
      accent,
      accentHover: ramp.accentHover,
      accentLight: ramp.accentLight,
      accentDark: ramp.accentDark,
      accentMuted: ramp.accentMuted,
      surface,
      surfaceMuted: lighten(surface, 0.98),
      surfaceSunken: darken(surface, 0.04),
      border,
      borderStrong: darken(border, 0.12),
      text: textClr,
      textMuted: lighten(textClr, 0.28),
      textSubtle: lighten(textClr, 0.5),
    },
    found,
    namedRoles,
  }
}

const SAMPLE_MAX = 240

export interface ImageExtractResult extends ExtractResult {
  swatches: { hex: string; pct: number }[]
}

const toHexStr = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

export const extractPaletteFromImage = (file: File): Promise<ImageExtractResult> =>
  new Promise((resolve) => {
    const fail = (error: string): ImageExtractResult => ({
      palette: { ...DEFAULTS },
      found: [],
      namedRoles: [],
      swatches: [],
      error,
    })

    if (!file.type.startsWith('image/')) {
      resolve(fail('The selected file is not an image.'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(fail('Could not read image file.'))
    }

    img.onload = () => {
      URL.revokeObjectURL(url)

      const scale = Math.min(1, SAMPLE_MAX / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(fail('HTML5 Canvas is not supported in this browser.'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)

      let pixels: Uint8ClampedArray
      try {
        pixels = ctx.getImageData(0, 0, w, h).data
      } catch {
        resolve(fail('Image sampling failed.'))
        return
      }

      const buckets = new Map<string, { n: number; r: number; g: number; b: number }>()
      for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3]
        if (a < 128) continue
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const key = `${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`
        const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 }
        e.n++
        e.r += r
        e.g += g
        e.b += b
        buckets.set(key, e)
      }

      const total = [...buckets.values()].reduce((s, e) => s + e.n, 0)
      if (!total) {
        resolve(fail('The image has no visible opaque pixels.'))
        return
      }

      const ranked = [...buckets.values()]
        .map((e) => ({
          hex: toHexStr(e.r / e.n, e.g / e.n, e.b / e.n),
          pct: Math.round((e.n / total) * 100),
        }))
        .sort((a, b) => b.pct - a.pct)

      const swatches = ranked.slice(0, 10)
      const found = swatches.map((s) => s.hex)

      // Find best accent (most saturated prominent colour)
      const nonNeutral = [...swatches].filter((s) => {
        const lum = relativeLuminance(s.hex)
        const sat = saturation(s.hex)
        return sat > 0.25 && lum > 0.08 && lum < 0.92
      })

      const bestAccent = nonNeutral[0]?.hex ?? swatches[0]?.hex ?? DEFAULTS.accent
      const secondAccent = nonNeutral[1]?.hex

      const ramp = deriveAccentRamp(bestAccent)

      const palette: ThemePalette = {
        accent: bestAccent,
        accentHover: ramp.accentHover,
        accentLight: ramp.accentLight,
        accentDark: ramp.accentDark,
        accentMuted: ramp.accentMuted,
        accentSecondary: secondAccent,
        surface: '#ffffff',
        surfaceMuted: '#fafbfc',
        surfaceSunken: '#f3f4f6',
        border: '#e5e7eb',
        borderStrong: '#cbd5e1',
        text: '#1b2850',
        textMuted: '#4b5563',
        textSubtle: '#6b7280',
      }

      resolve({
        palette,
        found,
        namedRoles: [],
        swatches,
      })
    }
  })
