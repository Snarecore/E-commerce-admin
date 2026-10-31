import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { AppearanceContext, type AppearanceContextValue } from './AppearanceContext'
import { isCustomThemeId, loadCustomThemes, persistCustomThemes } from './custom-themes'
import { ensureFontLoaded, FONTS } from './fonts'
import { DEFAULT_APPEARANCE, applyAppearance, findTheme, resolveAppearance } from './resolve'
import { THEME_PRESETS } from './themes'
import type { AppearanceOverrides, AppearanceState, ThemePreset, ThemeRef } from './types'

const STORAGE_KEY = 'bazaarbound-appearance'

// Isomorphic layout effect to avoid SSR warnings while guaranteeing pre-paint execution
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const VALID_OVERRIDE_KEYS = new Set<keyof AppearanceOverrides>([
  'density',
  'radius',
  'borderWidth',
  'shadow',
  'tableDensity',
  'fontFamily',
  'fontScale',
  'contentWidth',
  'accent',
  'fieldStyle',
  'labelPlacement',
  'labelCase',
  'requiredStyle',
  'focusStyle',
  'buttonStyle',
  'validationStyle',
  'tableRowStyle',
  'dialogStyle',
  'alertStyle',
  'reduceMotion',
  'colorMode',
  'sidebarStyle',
  'sidebarCollapse',
  'headerStyle',
])

const sanitizeAppearanceOverrides = (value: unknown): AppearanceOverrides => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const result: AppearanceOverrides = {}
  const raw = value as Record<string, unknown>

  for (const key of Object.keys(raw)) {
    if (!VALID_OVERRIDE_KEYS.has(key as keyof AppearanceOverrides)) continue

    const next = raw[key]
    switch (key) {
      case 'density':
        if (next === 'compact' || next === 'default' || next === 'comfortable') {
          result.density = next
        }
        break
      case 'radius':
        if (next === 'none' || next === 'sm' || next === 'md' || next === 'lg' || next === 'xl') {
          result.radius = next
        }
        break
      case 'borderWidth':
        if (next === 'hairline' || next === 'standard' || next === 'strong') {
          result.borderWidth = next
        }
        break
      case 'shadow':
        if (next === 'none' || next === 'subtle' || next === 'raised') {
          result.shadow = next
        }
        break
      case 'tableDensity':
        if (next === 'compact' || next === 'default' || next === 'comfortable') {
          result.tableDensity = next
        }
        break
      case 'fontFamily':
        if (typeof next === 'string' && next in FONTS) {
          result.fontFamily = next as AppearanceOverrides['fontFamily']
        }
        break
      case 'fontScale':
        if (next === 'sm' || next === 'md' || next === 'lg' || next === 'xl') {
          result.fontScale = next
        }
        break
      case 'contentWidth':
        if (next === 'standard' || next === 'wide' || next === 'full') {
          result.contentWidth = next
        }
        break
      case 'accent':
        if (typeof next === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(next)) {
          result.accent = next
        }
        break
      case 'fieldStyle':
        if (next === 'outlined' || next === 'filled' || next === 'underlined' || next === 'soft') {
          result.fieldStyle = next
        }
        break
      case 'labelPlacement':
        if (next === 'top' || next === 'left') {
          result.labelPlacement = next
        }
        break
      case 'labelCase':
        if (next === 'normal' || next === 'upper') {
          result.labelCase = next
        }
        break
      case 'requiredStyle':
        if (next === 'asterisk' || next === 'text' || next === 'none') {
          result.requiredStyle = next
        }
        break
      case 'focusStyle':
        if (next === 'ring' || next === 'border' || next === 'underline' || next === 'glow') {
          result.focusStyle = next
        }
        break
      case 'buttonStyle':
        if (next === 'solid' || next === 'soft' || next === 'outline') {
          result.buttonStyle = next
        }
        break
      case 'validationStyle':
        if (next === 'outlined' || next === 'soft' || next === 'callout') {
          result.validationStyle = next
        }
        break
      case 'tableRowStyle':
        if (next === 'plain' || next === 'striped') {
          result.tableRowStyle = next
        }
        break
      case 'dialogStyle':
        if (next === 'standard' || next === 'outlined' || next === 'accent') {
          result.dialogStyle = next
        }
        break
      case 'alertStyle':
        if (next === 'outlined' || next === 'soft' || next === 'solid') {
          result.alertStyle = next
        }
        break
      case 'reduceMotion':
        if (typeof next === 'boolean') {
          result.reduceMotion = next
        }
        break
      case 'colorMode':
        if (next === 'light' || next === 'dark' || next === 'system') {
          result.colorMode = next
        }
        break
      case 'sidebarStyle':
        if (next === 'match' || next === 'dark' || next === 'accent') {
          result.sidebarStyle = next
        }
        break
      case 'sidebarCollapse':
        if (next === 'expanded' || next === 'collapsed') {
          result.sidebarCollapse = next
        }
        break
      case 'headerStyle':
        if (next === 'sticky' || next === 'static') {
          result.headerStyle = next
        }
        break
    }
  }

  return result
}

/** Read persisted settings with resilient fallback. */
const readStoredState = (): AppearanceState => {
  if (typeof window === 'undefined') return DEFAULT_APPEARANCE

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_APPEARANCE

    const parsed = JSON.parse(raw) as Partial<AppearanceState>
    const themeId =
      typeof parsed.themeId === 'string' &&
      (parsed.themeId in THEME_PRESETS || isCustomThemeId(parsed.themeId))
        ? parsed.themeId
        : DEFAULT_APPEARANCE.themeId

    return {
      themeId,
      overrides: sanitizeAppearanceOverrides(parsed.overrides),
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppearanceState>(readStoredState)
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>(() =>
    typeof window === 'undefined' ? [] : loadCustomThemes()
  )
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Watch OS dark mode preference changes live
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolved = useMemo(
    () => resolveAppearance(state, customThemes, systemDark),
    [state, customThemes, systemDark]
  )
  const activeTheme = useMemo(
    () => findTheme(state.themeId, customThemes),
    [state.themeId, customThemes]
  )

  // Synchronously write CSS variables to <html> before paint to eliminate FOUC
  useIsomorphicLayoutEffect(() => {
    ensureFontLoaded(resolved.fontFamily)
    applyAppearance(resolved)
  }, [resolved])

  // Persist asynchronously to avoid blocking the main thread
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [state])

  const setTheme = useCallback((id: ThemeRef) => {
    setState((prev) => ({ ...prev, themeId: id }))
  }, [])

  const setOverrides = useCallback((patch: AppearanceOverrides) => {
    setState((prev) => {
      const next: AppearanceOverrides = { ...prev.overrides, ...patch }
      for (const key of Object.keys(patch) as (keyof AppearanceOverrides)[]) {
        if (patch[key] === undefined) delete next[key]
      }
      return { ...prev, overrides: next }
    })
  }, [])

  const resetOverrides = useCallback(() => {
    setState((prev) => ({ ...prev, overrides: {} }))
  }, [])

  const resetAll = useCallback(() => setState(DEFAULT_APPEARANCE), [])

  const commitThemes = useCallback((next: ThemePreset[]) => {
    setCustomThemes(next)
    persistCustomThemes(next)
  }, [])

  const saveCustomTheme = useCallback(
    (theme: ThemePreset) => {
      setCustomThemes((prev) => {
        const exists = prev.some((t) => t.id === theme.id)
        const next = exists ? prev.map((t) => (t.id === theme.id ? theme : t)) : [...prev, theme]
        persistCustomThemes(next)
        return next
      })
      return theme
    },
    []
  )

  const deleteCustomTheme = useCallback(
    (id: ThemeRef) => {
      setCustomThemes((prev) => {
        const next = prev.filter((t) => t.id !== id)
        persistCustomThemes(next)
        return next
      })
      setState((prev) =>
        prev.themeId === id ? { ...prev, themeId: DEFAULT_APPEARANCE.themeId } : prev
      )
    },
    []
  )

  const value = useMemo<AppearanceContextValue>(
    () => ({
      state,
      resolved,
      activeTheme,
      setTheme,
      setOverrides,
      resetOverrides,
      resetAll,
      hasOverrides: Object.keys(state.overrides).length > 0,
      customThemes,
      saveCustomTheme,
      deleteCustomTheme,
      replaceCustomThemes: commitThemes,
    }),
    [
      state,
      resolved,
      activeTheme,
      setTheme,
      setOverrides,
      resetOverrides,
      resetAll,
      customThemes,
      saveCustomTheme,
      deleteCustomTheme,
      commitThemes,
    ]
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}
