/**
 * Appearance system types.
 *
 * Designed with a strict dual architecture:
 *  - `ThemePreset` : a named design preset (colour palette + shape & density defaults)
 *  - `AppearanceOverrides` : individual per-setting user tweaks that win over the preset
 *
 * Effective value = override ?? preset default ?? global default.
 * Resetting overrides restores the active preset cleanly as originally designed.
 */

export type ThemeId =
  | 'bazaarbound-amber'
  | 'corporate-navy'
  | 'emerald-shop'
  | 'rose-boutique'
  | 'indigo-luxe'
  | 'slate-neutral'
  | 'redwood-warm'
  | 'teal-modern'
  | 'graphite-dark'
  | 'contrast-mono'
  | 'sandstone'

export type DensityId = 'compact' | 'default' | 'comfortable'
export type FontScaleId = 'sm' | 'md' | 'lg' | 'xl'
export type ContentWidthId = 'standard' | 'wide' | 'full'
export type RadiusId = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type BorderWidthId = 'hairline' | 'standard' | 'strong'
export type TableDensityId = 'compact' | 'default' | 'comfortable'
export type ShadowId = 'none' | 'subtle' | 'raised'
export type FieldStyleId = 'outlined' | 'filled' | 'underlined' | 'soft'
export type LabelPlacementId = 'top' | 'left'
export type LabelCaseId = 'normal' | 'upper'
export type RequiredStyleId = 'asterisk' | 'text' | 'none'
export type FocusStyleId = 'ring' | 'border' | 'underline' | 'glow'
export type ButtonStyleId = 'solid' | 'soft' | 'outline'
export type ValidationStyleId = 'outlined' | 'soft' | 'callout'
export type TableRowStyleId = 'plain' | 'striped'
export type DialogStyleId = 'standard' | 'outlined' | 'accent'
export type AlertStyleId = 'outlined' | 'soft' | 'solid'

export type FontFamilyId =
  // Default project font & Web sans-serif
  | 'nunito'
  | 'inter'
  | 'plus-jakarta'
  | 'roboto'
  | 'open-sans'
  | 'lato'
  | 'ibm-plex'
  | 'source-sans'
  | 'nunito-sans'
  | 'poppins'
  | 'noto-sans'
  // System (zero download)
  | 'verdana'
  | 'arial'
  | 'segoe-ui'
  | 'tahoma'
  | 'system'
  // Bengali fonts
  | 'noto-sans-bengali'
  | 'hind-siliguri'
  | 'solaiman-lipi'
  // Serif
  | 'georgia'
  | 'times-new-roman'
  // Monospace
  | 'courier-new'

export type ThemePaletteKey =
  | 'accent'
  | 'accentHover'
  | 'accentLight'
  | 'accentDark'
  | 'accentMuted'
  | 'accentSecondary'
  | 'surface'
  | 'surfaceMuted'
  | 'surfaceSunken'
  | 'border'
  | 'borderStrong'
  | 'text'
  | 'textMuted'
  | 'textSubtle'

/** Colour ramp for a theme. All values are valid CSS colour strings. */
export interface ThemePalette {
  /** Brand action colour. Informs --primary-color and bg-primary utilities. */
  accent: string
  accentHover: string
  accentLight: string
  accentDark: string
  accentMuted: string
  /** Optional secondary brand colour. Informs --secondary-color. */
  accentSecondary?: string
  /** Background & chrome */
  surface: string
  surfaceMuted: string
  surfaceSunken: string
  border: string
  borderStrong: string
  text: string
  textMuted: string
  textSubtle: string
  /** Dark mode flag hint */
  isDark?: boolean
}

/**
 * A built-in ThemeId or a user-created `custom:<uuid>` id.
 * The `(string & {})` preserves intellisense while permitting custom strings.
 */
export type ThemeRef = ThemeId | (string & {})

export interface ThemePreset {
  id: ThemeRef
  name: string
  description: string
  palette: ThemePalette
  /** Shape and density defaults tailored for this preset. */
  defaults: {
    density: DensityId
    radius: RadiusId
    borderWidth: BorderWidthId
    shadow: ShadowId
    tableDensity: TableDensityId
    fieldStyle: FieldStyleId
  }
}

/** User tweaks. Any undefined field inherits from the active preset. */
export interface AppearanceOverrides {
  density?: DensityId
  radius?: RadiusId
  borderWidth?: BorderWidthId
  shadow?: ShadowId
  tableDensity?: TableDensityId
  fontFamily?: FontFamilyId
  fontScale?: FontScaleId
  contentWidth?: ContentWidthId
  accent?: string
  fieldStyle?: FieldStyleId
  labelPlacement?: LabelPlacementId
  labelCase?: LabelCaseId
  requiredStyle?: RequiredStyleId
  focusStyle?: FocusStyleId
  buttonStyle?: ButtonStyleId
  validationStyle?: ValidationStyleId
  tableRowStyle?: TableRowStyleId
  dialogStyle?: DialogStyleId
  alertStyle?: AlertStyleId
  reduceMotion?: boolean
}

export interface AppearanceState {
  themeId: ThemeRef
  overrides: AppearanceOverrides
}

/** Fully resolved settings with every fallback applied. */
export interface ResolvedAppearance {
  themeId: ThemeRef
  density: DensityId
  radius: RadiusId
  borderWidth: BorderWidthId
  shadow: ShadowId
  tableDensity: TableDensityId
  fontFamily: FontFamilyId
  fontScale: FontScaleId
  contentWidth: ContentWidthId
  fieldStyle: FieldStyleId
  labelPlacement: LabelPlacementId
  labelCase: LabelCaseId
  requiredStyle: RequiredStyleId
  focusStyle: FocusStyleId
  buttonStyle: ButtonStyleId
  validationStyle: ValidationStyleId
  tableRowStyle: TableRowStyleId
  dialogStyle: DialogStyleId
  alertStyle: AlertStyleId
  reduceMotion: boolean
  palette: ThemePalette
}

export interface ScaleOption<T extends string> {
  id: T
  label: string
  hint: string
}
