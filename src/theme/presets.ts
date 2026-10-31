import type { AppearanceState } from './types'

export interface SavedPreset {
  id: string
  name: string
  createdAt: string
  state: AppearanceState
}

const STORAGE_KEY = 'bazaarbound-appearance-presets'

export const createPreset = (name: string, state: AppearanceState): SavedPreset => ({
  id: `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  name,
  createdAt: new Date().toISOString(),
  state: JSON.parse(JSON.stringify(state)),
})

export const loadPresets = (): SavedPreset[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const persistPresets = (presets: SavedPreset[]): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch {
    // Graceful fallback
  }
}

export const exportPresets = (presets: SavedPreset[]): string =>
  JSON.stringify(presets, null, 2)

export interface ImportResult {
  presets: SavedPreset[]
  error?: string
}

export const parseImport = (json: string): ImportResult => {
  try {
    const parsed = JSON.parse(json)
    const list = Array.isArray(parsed) ? parsed : [parsed]
    const valid = list.filter(
      (p): p is SavedPreset =>
        Boolean(p) &&
        typeof p === 'object' &&
        typeof p.name === 'string' &&
        Boolean(p.state) &&
        typeof p.state === 'object' &&
        typeof p.state.themeId === 'string'
    )

    if (valid.length === 0) {
      return { presets: [], error: 'No valid preset configuration found in the file.' }
    }
    return { presets: valid }
  } catch {
    return { presets: [], error: 'Invalid JSON file. Please check file format.' }
  }
}

export const downloadPresets = (presets: SavedPreset[]): void => {
  if (typeof document === 'undefined') return
  const blob = new Blob([exportPresets(presets)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bazaarbound-presets-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
