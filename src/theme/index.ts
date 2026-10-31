export { AppearanceProvider } from './AppearanceProvider'
export { AppearanceContext } from './AppearanceContext'
export type { AppearanceContextValue } from './AppearanceContext'
export { useAppearance } from './useAppearance'
export { THEME_PRESETS, THEME_LIST, DEFAULT_THEME_ID } from './themes'
export {
  DEFAULT_APPEARANCE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SCALE,
  resolveAppearance,
  appearanceToCssVars,
  applyAppearance,
  findTheme,
} from './resolve'
export * from './scales'
export * from './types'
export {
  isValidHex,
  normalizeHex,
  hexToRgb,
  rgbToHex,
  relativeLuminance,
  contrastRatio,
  gradeContrast,
  darken,
  lighten,
  readableOn,
  deriveAccentRamp,
} from './color'
export type { ContrastGrade } from './color'
export {
  loadPresets,
  persistPresets,
  createPreset,
  exportPresets,
  parseImport,
  downloadPresets,
} from './presets'
export type { SavedPreset, ImportResult } from './presets'
export {
  FONTS,
  FONT_LIST,
  FONT_CATEGORY_LABELS,
  FONT_CATEGORY_ORDER,
  ensureFontLoaded,
} from './fonts'
export type { FontDefinition, FontCategory, FontSource } from './fonts'
export {
  CUSTOM_PREFIX,
  PALETTE_KEYS,
  PALETTE_LABELS,
  isCustomThemeId,
  blankTheme,
  sanitizeTheme,
  loadCustomThemes,
  persistCustomThemes,
  exportThemes,
  parseThemeImport,
  downloadThemes,
} from './custom-themes'
export type { ThemeImportResult } from './custom-themes'
export { extractPalette, extractPaletteFromImage } from './extract'
export type { ExtractResult, ImageExtractResult } from './extract'
