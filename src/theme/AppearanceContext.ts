import { createContext } from 'react'
import type {
  AppearanceOverrides,
  AppearanceState,
  ResolvedAppearance,
  ThemePreset,
  ThemeRef,
} from './types'

export interface AppearanceContextValue {
  /** Persisted user state: selected theme ID + individual overrides. */
  state: AppearanceState
  /** Fully resolved values feeding the rendered interface and CSS variables. */
  resolved: ResolvedAppearance
  /** Currently active theme preset (built-in or custom). */
  activeTheme: ThemePreset
  /** Switch active theme. Any explicit user overrides (e.g. font, density) persist. */
  setTheme: (id: ThemeRef) => void
  /** Apply or remove overrides. Passing undefined for a key clears it. */
  setOverrides: (patch: AppearanceOverrides) => void
  /** Reset all individual overrides back to the active theme's defaults. */
  resetOverrides: () => void
  /** Reset everything back to the shipped flagship default theme. */
  resetAll: () => void
  /** True when at least one user override is active. */
  hasOverrides: boolean

  /* ---- Custom User Themes ---- */
  customThemes: ThemePreset[]
  /** Create or update a custom theme. Returns the stored theme. */
  saveCustomTheme: (theme: ThemePreset) => ThemePreset
  /** Delete a custom theme. If it is currently active, resets back to default. */
  deleteCustomTheme: (id: ThemeRef) => void
  /** Batch replace custom themes (e.g. on JSON import). */
  replaceCustomThemes: (themes: ThemePreset[]) => void
}

export const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined)
