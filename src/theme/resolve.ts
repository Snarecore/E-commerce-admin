import { darken, deriveAccentRamp, isValidHex, lighten, readableOn } from './color'
import {
  BORDER_WIDTH_SCALE,
  CONTENT_WIDTH_SCALE,
  DENSITY_SCALE,
  FONT_FAMILY_SCALE,
  FONT_SCALE,
  RADIUS_SCALE,
  SHADOW_SCALE,
  TABLE_DENSITY_SCALE,
} from './scales'
import { DEFAULT_THEME_ID, THEME_PRESETS } from './themes'
import type {
  AppearanceState,
  ResolvedAppearance,
  ThemeId,
  ThemePreset,
  ThemeRef,
} from './types'

export const DEFAULT_FONT_FAMILY = 'nunito' as const
export const DEFAULT_FONT_SCALE = 'md' as const

export const DEFAULT_APPEARANCE: AppearanceState = {
  themeId: DEFAULT_THEME_ID,
  overrides: {},
}

/**
 * Finds a theme by id across built-ins and custom themes,
 * safely falling back to the flagship default theme if unknown or deleted.
 */
export const findTheme = (id: ThemeRef, customThemes: ThemePreset[] = []): ThemePreset =>
  THEME_PRESETS[id as ThemeId] ??
  customThemes.find((t) => t.id === id) ??
  THEME_PRESETS[DEFAULT_THEME_ID]

/** Merges defaults, preset, and overrides into a complete ResolvedAppearance. */
export const resolveAppearance = (
  state: AppearanceState,
  customThemes: ThemePreset[] = []
): ResolvedAppearance => {
  const preset = findTheme(state.themeId, customThemes)
  const o = state.overrides

  const palette = { ...preset.palette }
  if (o.accent && isValidHex(o.accent)) {
    Object.assign(palette, deriveAccentRamp(o.accent))
  }

  return {
    themeId: preset.id,
    density: o.density ?? preset.defaults.density,
    radius: o.radius ?? preset.defaults.radius,
    borderWidth: o.borderWidth ?? preset.defaults.borderWidth,
    shadow: o.shadow ?? preset.defaults.shadow,
    tableDensity: o.tableDensity ?? preset.defaults.tableDensity,
    fontFamily: o.fontFamily ?? DEFAULT_FONT_FAMILY,
    fontScale: o.fontScale ?? DEFAULT_FONT_SCALE,
    contentWidth: o.contentWidth ?? 'wide',
    fieldStyle: o.fieldStyle ?? preset.defaults.fieldStyle,
    labelPlacement: o.labelPlacement ?? 'top',
    labelCase: o.labelCase ?? 'normal',
    requiredStyle: o.requiredStyle ?? 'asterisk',
    focusStyle: o.focusStyle ?? 'ring',
    buttonStyle: o.buttonStyle ?? 'solid',
    validationStyle: o.validationStyle ?? 'outlined',
    tableRowStyle: o.tableRowStyle ?? 'plain',
    dialogStyle: o.dialogStyle ?? 'standard',
    alertStyle: o.alertStyle ?? 'outlined',
    reduceMotion: o.reduceMotion ?? false,
    palette,
  }
}

/**
 * Transforms resolved settings into CSS custom properties consumed by stylesheets and Tailwind @theme.
 */
export const appearanceToCssVars = (r: ResolvedAppearance): Record<string, string> => {
  const density = DENSITY_SCALE[r.density]
  const font = FONT_SCALE[r.fontScale]
  const contentWidth = CONTENT_WIDTH_SCALE[r.contentWidth]
  const family = FONT_FAMILY_SCALE[r.fontFamily]
  const radius = RADIUS_SCALE[r.radius]
  const shadow = SHADOW_SCALE[r.shadow]
  const table = TABLE_DENSITY_SCALE[r.tableDensity]
  const border = BORDER_WIDTH_SCALE[r.borderWidth]
  const p = r.palette

  const secAccent = p.accentSecondary ?? p.accent

  return {
    // --- Brand tokens ---
    '--primary-color': p.accent,
    '--primary-color-hover': p.accentHover,
    '--primary-color-light': p.accentLight,
    '--primary-color-dark': p.accentDark,
    '--primary-color-muted': p.accentMuted,
    '--primary-hover-color': p.accentHover,
    '--color-primary': p.accent,
    '--color-primary-hover': p.accentHover,
    '--color-primary-light': p.accentLight,
    '--color-orange-500': p.accent,
    '--color-orange-600': p.accentHover,
    '--color-orange-400': lighten(p.accent, 0.2),
    '--color-orange-300': lighten(p.accent, 0.4),
    '--color-orange-200': lighten(p.accent, 0.6),
    '--color-orange-100': p.accentMuted,
    '--color-orange-50': p.accentLight,

    '--secondary-color': secAccent,
    '--secondary-color-hover': darken(secAccent, 0.16),
    '--secondary-color-light': lighten(secAccent, 0.92),
    '--color-secondary': secAccent,
    '--ui-accent-2': secAccent,
    '--ui-on-accent-2': readableOn(secAccent),

    '--ui-on-accent': readableOn(p.accent),
    '--table-header-bg': p.accent,
    '--table-header-text': readableOn(p.accent),

    // --- Chrome & Surfaces ---
    '--ui-surface': p.surface,
    '--ui-surface-muted': p.surfaceMuted,
    '--ui-surface-sunken': p.surfaceSunken,
    '--ui-border': p.border,
    '--ui-border-strong': p.borderStrong,
    '--ui-text': p.text,
    '--ui-text-muted': p.textMuted,
    '--ui-text-subtle': p.textSubtle,

    // Status colors
    '--ui-danger': '#dc2626',
    '--ui-danger-light': '#fef2f2',
    '--ui-danger-border': '#fecaca',
    '--ui-success': '#16a34a',
    '--ui-success-light': '#f0fdf4',
    '--ui-success-border': '#bbf7d0',
    '--ui-warning': '#d97706',
    '--ui-warning-light': '#fffbeb',
    '--ui-warning-border': '#fde68a',

    // --- Density ---
    '--ui-control-h': density.controlH,
    '--ui-control-h-sm': `calc(${density.controlH} * 0.9)`,
    '--ui-control-h-xs': `calc(${density.controlH} * 0.76)`,
    '--ui-control-px': density.controlPx,
    '--ui-field-gap': density.fieldGap,
    '--ui-section-gap': density.sectionGap,

    // --- Typography ---
    '--ui-font-family': family.stack,
    '--ui-font-size': font.base,
    '--ui-font-size-sm': `calc(${font.base} - 1px)`,
    '--ui-font-size-xs': `calc(${font.base} - 3px)`,
    '--ui-label-size': font.label,
    '--ui-heading-size': font.heading,
    '--ui-content-max-width': contentWidth,

    // --- Shape & Borders ---
    '--ui-radius-sm': radius.sm,
    '--ui-radius': radius.md,
    '--ui-radius-lg': radius.lg,
    '--ui-border-width': border,

    // --- Elevation ---
    '--ui-shadow-card': shadow.card,
    '--ui-shadow-control': shadow.control,
    '--ui-shadow-popover':
      '0 16px 36px -12px rgba(15, 23, 42, 0.28), 0 4px 12px -6px rgba(15, 23, 42, 0.14)',

    // --- Table & Page Chrome ---
    '--ui-table-row-h': table.rowH,
    '--ui-table-cell-px': table.cellPx,
    '--ui-table-cell-py': table.cellPy,
    '--ui-page-padding': table.pagePadding,

    // --- Derived focus ring ---
    '--ui-focus-ring': `color-mix(in srgb, ${p.accent} 22%, transparent)`,
  }
}

// Micro-cache to eliminate redundant DOM writes
let lastAppliedVars: Record<string, string> = {}

/** Writes the calculated tokens onto the document root. */
export const applyAppearance = (
  resolved: ResolvedAppearance,
  target: HTMLElement = document.documentElement
): void => {
  if (typeof document === 'undefined' || !target) return

  const vars = appearanceToCssVars(resolved)
  for (const [key, value] of Object.entries(vars)) {
    if (lastAppliedVars[key] !== value) {
      target.style.setProperty(key, value)
      lastAppliedVars[key] = value
    }
  }

  // Set data attributes for variant selector rules
  target.dataset.theme = resolved.themeId
  target.dataset.density = resolved.density
  target.dataset.fieldStyle = resolved.fieldStyle
  target.dataset.labelPlacement = resolved.labelPlacement
  target.dataset.labelCase = resolved.labelCase
  target.dataset.requiredStyle = resolved.requiredStyle
  target.dataset.focusStyle = resolved.focusStyle
  target.dataset.buttonStyle = resolved.buttonStyle
  target.dataset.validationStyle = resolved.validationStyle
  target.dataset.tableRowStyle = resolved.tableRowStyle
  target.dataset.dialogStyle = resolved.dialogStyle
  target.dataset.alertStyle = resolved.alertStyle
  target.dataset.reduceMotion = String(resolved.reduceMotion)
}
