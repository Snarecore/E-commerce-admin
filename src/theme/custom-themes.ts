import { isValidHex, normalizeHex } from './color'
import type { ThemePalette, ThemePaletteKey, ThemePreset, ThemeRef } from './types'

export const CUSTOM_PREFIX = 'custom:'
const STORAGE_KEY = 'bazaarbound-custom-themes'

export const PALETTE_KEYS: ThemePaletteKey[] = [
  'accent',
  'accentHover',
  'accentLight',
  'accentDark',
  'accentMuted',
  'accentSecondary',
  'surface',
  'surfaceMuted',
  'surfaceSunken',
  'border',
  'borderStrong',
  'text',
  'textMuted',
  'textSubtle',
]

export const PALETTE_LABELS: Record<ThemePaletteKey, string> = {
  accent: 'Primary Accent',
  accentHover: 'Accent Hover',
  accentLight: 'Accent Tint / Light',
  accentDark: 'Accent Shade / Dark',
  accentMuted: 'Accent Muted',
  accentSecondary: 'Secondary Accent',
  surface: 'Card / Surface',
  surfaceMuted: 'Muted Chrome',
  surfaceSunken: 'Page Background',
  border: 'Default Border',
  borderStrong: 'Emphasised Border',
  text: 'Main Body Text',
  textMuted: 'Muted Text',
  textSubtle: 'Subtle / Placeholder Text',
}

export const isCustomThemeId = (id: ThemeRef): boolean => id.startsWith(CUSTOM_PREFIX)

export const createCustomThemeId = (): ThemeRef =>
  `${CUSTOM_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/** Produces a balanced starter palette for a new theme. */
export const blankTheme = (name = 'Custom Theme'): ThemePreset => ({
  id: createCustomThemeId(),
  name,
  description: 'Handcrafted custom theme.',
  palette: {
    accent: '#fe9f43',
    accentHover: '#e68a2c',
    accentLight: '#fff8f2',
    accentDark: '#b86014',
    accentMuted: '#fde6d2',
    accentSecondary: '#1b2850',
    surface: '#ffffff',
    surfaceMuted: '#fafbfc',
    surfaceSunken: '#f3f4f6',
    border: '#e5e7eb',
    borderStrong: '#cbd5e1',
    text: '#1b2850',
    textMuted: '#4b5563',
    textSubtle: '#6b7280',
  },
  defaults: {
    density: 'default',
    radius: 'md',
    borderWidth: 'hairline',
    shadow: 'subtle',
    tableDensity: 'default',
    fieldStyle: 'outlined',
  },
})

export const sanitizeTheme = (raw: unknown): ThemePreset | null => {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as Partial<ThemePreset>

  if (typeof t.name !== 'string' || !t.name.trim()) return null
  if (!t.palette || typeof t.palette !== 'object') return null

  const p = t.palette as unknown as Record<string, unknown>
  const palette: Record<string, string> = {}

  for (const k of PALETTE_KEYS) {
    if (k === 'accentSecondary' && !p[k]) continue
    if (!isValidHex(p[k])) return null
    palette[k] = normalizeHex(String(p[k]))
  }

  const d = (t.defaults && typeof t.defaults === 'object' ? t.defaults : {}) as Record<
    string,
    unknown
  >

  const id: ThemeRef =
    typeof t.id === 'string' && isCustomThemeId(t.id) ? t.id : createCustomThemeId()

  return {
    id,
    name: t.name.trim().slice(0, 50),
    description: typeof t.description === 'string' ? t.description.slice(0, 160) : '',
    palette: palette as unknown as ThemePalette,
    defaults: {
      density: d.density === 'compact' || d.density === 'comfortable' ? d.density : 'default',
      radius:
        d.radius === 'none' || d.radius === 'sm' || d.radius === 'lg' || d.radius === 'xl'
          ? d.radius
          : 'md',
      borderWidth:
        d.borderWidth === 'standard' || d.borderWidth === 'strong' ? d.borderWidth : 'hairline',
      shadow: d.shadow === 'none' || d.shadow === 'raised' ? d.shadow : 'subtle',
      tableDensity:
        d.tableDensity === 'compact' || d.tableDensity === 'comfortable'
          ? d.tableDensity
          : 'default',
      fieldStyle:
        d.fieldStyle === 'filled' || d.fieldStyle === 'underlined' || d.fieldStyle === 'soft'
          ? d.fieldStyle
          : 'outlined',
    },
  }
}

export const loadCustomThemes = (): ThemePreset[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitizeTheme).filter((t): t is ThemePreset => t !== null)
  } catch {
    return []
  }
}

export const persistCustomThemes = (themes: ThemePreset[]): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
  } catch {
    // Graceful fallback if storage quota exceeded
  }
}

export interface ThemeImportResult {
  themes: ThemePreset[]
  error?: string
}

export const parseThemeImport = (json: string): ThemeImportResult => {
  try {
    const parsed = JSON.parse(json)
    const list = Array.isArray(parsed) ? parsed : [parsed]
    const themes = list.map(sanitizeTheme).filter((t): t is ThemePreset => t !== null)

    if (themes.length === 0) {
      return { themes: [], error: 'No valid themes found in the uploaded file.' }
    }
    return { themes }
  } catch {
    return { themes: [], error: 'Invalid JSON file. Please check file contents.' }
  }
}

export const exportThemes = (themes: ThemePreset[]): string =>
  JSON.stringify(themes, null, 2)

export const downloadThemes = (themes: ThemePreset[]): void => {
  if (typeof document === 'undefined') return
  const blob = new Blob([exportThemes(themes)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bazaarbound-themes-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
