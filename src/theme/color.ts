/**
 * Pure colour utilities for the appearance engine.
 *
 * Provides WCAG 2.1 relative luminance and contrast ratio calculations,
 * deterministic tonal ramp derivation, and contrast accessibility grading.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export const isValidHex = (val: unknown): val is string =>
  typeof val === 'string' && HEX_RE.test(val.trim())

/** Normalise any valid hex string into `#rrggbb` lowercase. */
export const normalizeHex = (hex: string): string => {
  const clean = hex.trim().replace(/^#/, '').toLowerCase()
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`
  }
  if (clean.length >= 6) {
    return `#${clean.slice(0, 6)}`
  }
  return '#000000'
}

export const hexToRgb = (hex: string): Rgb => {
  const n = normalizeHex(hex).slice(1)
  const int = parseInt(n, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

export const rgbToHex = (rgb: Rgb): string => {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

/** WCAG 2.1 relative luminance for an sRGB component. */
const channelLuminance = (c: number): number => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/**
 * Calculate WCAG 2.1 relative luminance of an sRGB colour in [0, 1].
 * 0 is pure black, 1 is pure white.
 */
export const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex)
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  )
}

/**
 * WCAG 2.1 contrast ratio between two colours. Returns a value from 1 to 21.
 * Ratio = (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter colour.
 */
export const contrastRatio = (hexA: string, hexB: string): number => {
  const l1 = relativeLuminance(hexA)
  const l2 = relativeLuminance(hexB)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastGrade = 'AAA' | 'AA' | 'AA Large' | 'Fail'

export const gradeContrast = (ratio: number): ContrastGrade => {
  if (ratio >= 7.0) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3.0) return 'AA Large'
  return 'Fail'
}

/** Mix colour with black by factor [0, 1]. */
export const darken = (hex: string, factor: number): string => {
  const { r, g, b } = hexToRgb(hex)
  const f = Math.max(0, Math.min(1, 1 - factor))
  return rgbToHex({ r: r * f, g: g * f, b: b * f })
}

/** Mix colour with white by factor [0, 1]. */
export const lighten = (hex: string, factor: number): string => {
  const { r, g, b } = hexToRgb(hex)
  const f = Math.max(0, Math.min(1, factor))
  return rgbToHex({
    r: r + (255 - r) * f,
    g: g + (255 - g) * f,
    b: b + (255 - b) * f,
  })
}

/**
 * Return '#ffffff' or '#0f172a' depending on which gives higher contrast
 * against the provided background colour.
 */
export const readableOn = (bgHex: string): string => {
  const onWhite = contrastRatio(bgHex, '#ffffff')
  const onDark = contrastRatio(bgHex, '#0f172a')
  return onWhite >= onDark ? '#ffffff' : '#0f172a'
}

/**
 * Derive hover, light tint, dark shade and muted tone from a single accent hex.
 * Produces a full harmonious brand ramp.
 */
export const deriveAccentRamp = (
  accentHex: string
): {
  accent: string
  accentHover: string
  accentLight: string
  accentDark: string
  accentMuted: string
} => {
  const norm = normalizeHex(accentHex)
  const lum = relativeLuminance(norm)

  return {
    accent: norm,
    // Darken if already light, or slightly darken for hover
    accentHover: lum > 0.6 ? darken(norm, 0.15) : darken(norm, 0.12),
    accentLight: lighten(norm, 0.94),
    accentDark: lum < 0.1 ? norm : darken(norm, 0.35),
    accentMuted: lighten(norm, 0.85),
  }
}
