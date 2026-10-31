import type {
  AlertStyleId,
  BorderWidthId,
  ButtonStyleId,
  ColorModeId,
  ContentWidthId,
  DensityId,
  DialogStyleId,
  FieldStyleId,
  FocusStyleId,
  FontFamilyId,
  FontScaleId,
  HeaderStyleId,
  LabelCaseId,
  LabelPlacementId,
  RadiusId,
  RequiredStyleId,
  ScaleOption,
  ShadowId,
  SidebarCollapseId,
  SidebarStyleId,
  TableDensityId,
  TableRowStyleId,
  ValidationStyleId,
} from './types'

/* ---------------- Density scale ---------------- */
export interface DensityTokens {
  controlH: string
  controlPx: string
  fieldGap: string
  sectionGap: string
}

export const DENSITY_SCALE: Record<DensityId, DensityTokens> = {
  compact: {
    controlH: '34px',
    controlPx: '10px',
    fieldGap: '12px',
    sectionGap: '18px',
  },
  default: {
    controlH: '38px',
    controlPx: '12px',
    fieldGap: '16px',
    sectionGap: '24px',
  },
  comfortable: {
    controlH: '44px',
    controlPx: '16px',
    fieldGap: '20px',
    sectionGap: '28px',
  },
}

export const DENSITY_OPTIONS: ScaleOption<DensityId>[] = [
  { id: 'compact', label: 'Compact', hint: '34px — Dense data entry, high information density' },
  { id: 'default', label: 'Default', hint: '38px — Balanced spacing, standard admin view' },
  { id: 'comfortable', label: 'Comfortable', hint: '44px — Generous touch targets, relaxed view' },
]

/* ---------------- Font scale ---------------- */
export interface FontScaleTokens {
  base: string
  label: string
  heading: string
}

export const FONT_SCALE: Record<FontScaleId, FontScaleTokens> = {
  sm: { base: '13px', label: '11px', heading: '1.125rem' },
  md: { base: '14px', label: '12px', heading: '1.25rem' },
  lg: { base: '15px', label: '13px', heading: '1.375rem' },
  xl: { base: '16px', label: '14px', heading: '1.5rem' },
}

export const FONT_SCALE_OPTIONS: ScaleOption<FontScaleId>[] = [
  { id: 'sm', label: 'Small', hint: '13px base — high density' },
  { id: 'md', label: 'Medium', hint: '14px base — standard' },
  { id: 'lg', label: 'Large', hint: '15px base — enhanced legibility' },
  { id: 'xl', label: 'Extra Large', hint: '16px base — maximum readability' },
]

/* ---------------- Content width ---------------- */
export const CONTENT_WIDTH_SCALE: Record<ContentWidthId, string> = {
  standard: '1280px',
  wide: '1536px',
  full: '100%',
}

export const CONTENT_WIDTH_OPTIONS: ScaleOption<ContentWidthId>[] = [
  { id: 'standard', label: 'Standard', hint: '1280px max width — focused centered layout' },
  { id: 'wide', label: 'Wide', hint: '1536px max width — accommodates multi-column data' },
  { id: 'full', label: 'Full Width', hint: '100% width — edge-to-edge dashboard layout' },
]

/* ---------------- Radius scale ---------------- */
export interface RadiusTokens {
  sm: string
  md: string
  lg: string
}

export const RADIUS_SCALE: Record<RadiusId, RadiusTokens> = {
  none: { sm: '0px', md: '0px', lg: '0px' },
  sm: { sm: '3px', md: '5px', lg: '8px' },
  md: { sm: '6px', md: '10px', lg: '14px' },
  lg: { sm: '8px', md: '14px', lg: '20px' },
  xl: { sm: '12px', md: '20px', lg: '28px' },
}

export const RADIUS_OPTIONS: ScaleOption<RadiusId>[] = [
  { id: 'none', label: 'Sharp', hint: '0px — Crisp geometric corners' },
  { id: 'sm', label: 'Subtle', hint: '5px — Clean technical look' },
  { id: 'md', label: 'Rounded', hint: '10px — Contemporary friendly curves' },
  { id: 'lg', label: 'Pill / Soft', hint: '14px — Organic modern feel' },
  { id: 'xl', label: 'Extra Rounded', hint: '20px — Playful and welcoming' },
]

/* ---------------- Border width scale ---------------- */
export const BORDER_WIDTH_SCALE: Record<BorderWidthId, string> = {
  hairline: '1px',
  standard: '1.5px',
  strong: '2px',
}

export const BORDER_WIDTH_OPTIONS: ScaleOption<BorderWidthId>[] = [
  { id: 'hairline', label: 'Hairline', hint: '1px — Minimal unobtrusive borders' },
  { id: 'standard', label: 'Standard', hint: '1.5px — Distinct UI boundary definition' },
  { id: 'strong', label: 'Strong', hint: '2px — High contrast and pronounced lines' },
]

/* ---------------- Shadow scale ---------------- */
export interface ShadowTokens {
  card: string
  control: string
}

export const SHADOW_SCALE: Record<ShadowId, ShadowTokens> = {
  none: {
    card: 'none',
    control: 'none',
  },
  subtle: {
    card: '0 4px 20px -6px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
    control: '0 1px 3px rgba(15, 23, 42, 0.06)',
  },
  raised: {
    card: '0 12px 36px -10px rgba(15, 23, 42, 0.16), 0 4px 14px -4px rgba(15, 23, 42, 0.08)',
    control: '0 2px 6px rgba(15, 23, 42, 0.12)',
  },
}

export const SHADOW_OPTIONS: ScaleOption<ShadowId>[] = [
  { id: 'none', label: 'Flat', hint: 'No elevation, relies strictly on borders' },
  { id: 'subtle', label: 'Subtle', hint: 'Soft natural depth, clean hierarchy' },
  { id: 'raised', label: 'Raised', hint: 'Prominent elevation and floating feel' },
]

/* ---------------- Table density scale ---------------- */
export interface TableDensityTokens {
  rowH: string
  cellPx: string
  cellPy: string
  pagePadding: string
}

export const TABLE_DENSITY_SCALE: Record<TableDensityId, TableDensityTokens> = {
  compact: {
    rowH: '38px',
    cellPx: '10px',
    cellPy: '6px',
    pagePadding: '16px',
  },
  default: {
    rowH: '46px',
    cellPx: '14px',
    cellPy: '10px',
    pagePadding: '24px',
  },
  comfortable: {
    rowH: '56px',
    cellPx: '18px',
    cellPy: '14px',
    pagePadding: '32px',
  },
}

export const TABLE_DENSITY_OPTIONS: ScaleOption<TableDensityId>[] = [
  { id: 'compact', label: 'Compact', hint: '38px rows — scan dozens of orders at once' },
  { id: 'default', label: 'Default', hint: '46px rows — balanced scanning speed and breathing room' },
  { id: 'comfortable', label: 'Comfortable', hint: '56px rows — generous row spacing with thumbnails' },
]

/* ---------------- Component variant options ---------------- */
export const FIELD_STYLE_OPTIONS: ScaleOption<FieldStyleId>[] = [
  { id: 'outlined', label: 'Outlined', hint: 'Clean border box, standard admin look' },
  { id: 'filled', label: 'Filled', hint: 'Tinted background with subtle border' },
  { id: 'soft', label: 'Soft', hint: 'Off-white background that highlights on focus' },
  { id: 'underlined', label: 'Underlined', hint: 'Minimalist bottom border line only' },
]

export const LABEL_PLACEMENT_OPTIONS: ScaleOption<LabelPlacementId>[] = [
  { id: 'top', label: 'Top', hint: 'Label sits directly above the field' },
  { id: 'left', label: 'Left', hint: 'Label placed horizontally beside the field' },
]

export const LABEL_CASE_OPTIONS: ScaleOption<LabelCaseId>[] = [
  { id: 'normal', label: 'Normal Case', hint: 'Natural title case sentence capitalization' },
  { id: 'upper', label: 'UPPERCASE', hint: 'Tracked small capital letters' },
]

export const REQUIRED_STYLE_OPTIONS: ScaleOption<RequiredStyleId>[] = [
  { id: 'asterisk', label: 'Asterisk (*)', hint: 'Red asterisk after the label text' },
  { id: 'text', label: 'Text tag', hint: 'Subtle "(required)" indicator' },
  { id: 'none', label: 'None', hint: 'No explicit required badge' },
]

export const FOCUS_STYLE_OPTIONS: ScaleOption<FocusStyleId>[] = [
  { id: 'ring', label: 'Accent Ring', hint: 'Modern 3px glowing brand focus ring' },
  { id: 'border', label: 'Crisp Border', hint: 'Solid colored high-contrast border' },
  { id: 'underline', label: 'Bottom Bar', hint: 'Accented underline on active input' },
  { id: 'glow', label: 'Soft Glow', hint: 'Diffused outer brand glow' },
]

export const BUTTON_STYLE_OPTIONS: ScaleOption<ButtonStyleId>[] = [
  { id: 'solid', label: 'Solid Fill', hint: 'Rich primary colour fill with drop shadow' },
  { id: 'soft', label: 'Soft Tint', hint: 'Muted brand background with dark accent text' },
  { id: 'outline', label: 'Outlined', hint: 'Crisp border with transparent fill' },
]

export const VALIDATION_STYLE_OPTIONS: ScaleOption<ValidationStyleId>[] = [
  { id: 'outlined', label: 'Red Border', hint: 'Clean danger outline on input' },
  { id: 'soft', label: 'Tinted Fill', hint: 'Soft red field background and alert border' },
  { id: 'callout', label: 'Callout Box', hint: 'Distinct rounded message banner' },
]

export const TABLE_ROW_STYLE_OPTIONS: ScaleOption<TableRowStyleId>[] = [
  { id: 'plain', label: 'Plain Rows', hint: 'Clean white rows with hover highlight' },
  { id: 'striped', label: 'Zebra Striped', hint: 'Alternating tinted rows for easier tracking' },
]

export const DIALOG_STYLE_OPTIONS: ScaleOption<DialogStyleId>[] = [
  { id: 'standard', label: 'Standard', hint: 'Clean border with shadow elevation' },
  { id: 'outlined', label: 'Outlined', hint: 'Prominent structural border' },
  { id: 'accent', label: 'Brand Header Strip', hint: 'Top brand accent bar on modal header' },
]

export const ALERT_STYLE_OPTIONS: ScaleOption<AlertStyleId>[] = [
  { id: 'outlined', label: 'Outlined', hint: 'Clean border with soft colored background' },
  { id: 'soft', label: 'Soft', hint: 'Light solid tone without border' },
  { id: 'solid', label: 'Solid Accent', hint: 'Vibrant filled badge' },
]

/* ---------------- Font family stacks ---------------- */
export interface FontFamilyToken {
  name: string
  stack: string
}

const BN_FALLBACK = `'Nirmala UI', 'Shonar Bangla', 'Noto Sans Bengali'`
const SANS_TAIL = `${BN_FALLBACK}, ui-sans-serif, system-ui, -apple-system, sans-serif`

export const FONT_FAMILY_SCALE: Record<FontFamilyId, FontFamilyToken> = {
  nunito: {
    name: 'Nunito',
    stack: `'Nunito', ${SANS_TAIL}`,
  },
  inter: {
    name: 'Inter',
    stack: `'Inter', ${SANS_TAIL}`,
  },
  'plus-jakarta': {
    name: 'Plus Jakarta Sans',
    stack: `'Plus Jakarta Sans', ${SANS_TAIL}`,
  },
  roboto: {
    name: 'Roboto',
    stack: `'Roboto', ${SANS_TAIL}`,
  },
  'open-sans': {
    name: 'Open Sans',
    stack: `'Open Sans', ${SANS_TAIL}`,
  },
  lato: {
    name: 'Lato',
    stack: `'Lato', ${SANS_TAIL}`,
  },
  'ibm-plex': {
    name: 'IBM Plex Sans',
    stack: `'IBM Plex Sans', ${SANS_TAIL}`,
  },
  'source-sans': {
    name: 'Source Sans 3',
    stack: `'Source Sans 3', ${SANS_TAIL}`,
  },
  'nunito-sans': {
    name: 'Nunito Sans',
    stack: `'Nunito Sans', ${SANS_TAIL}`,
  },
  poppins: {
    name: 'Poppins',
    stack: `'Poppins', ${SANS_TAIL}`,
  },
  'noto-sans': {
    name: 'Noto Sans',
    stack: `'Noto Sans', ${SANS_TAIL}`,
  },
  verdana: {
    name: 'Verdana',
    stack: `Verdana, Geneva, ${SANS_TAIL}`,
  },
  arial: {
    name: 'Arial',
    stack: `Arial, Helvetica, ${SANS_TAIL}`,
  },
  'segoe-ui': {
    name: 'Segoe UI',
    stack: `'Segoe UI', 'Segoe UI Variable', ${SANS_TAIL}`,
  },
  tahoma: {
    name: 'Tahoma',
    stack: `Tahoma, Verdana, ${SANS_TAIL}`,
  },
  system: {
    name: 'System Default',
    stack: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, ${SANS_TAIL}`,
  },
  'noto-sans-bengali': {
    name: 'Noto Sans Bengali',
    stack: `'Noto Sans Bengali', ${BN_FALLBACK}, ui-sans-serif, sans-serif`,
  },
  'hind-siliguri': {
    name: 'Hind Siliguri',
    stack: `'Hind Siliguri', ${BN_FALLBACK}, ui-sans-serif, sans-serif`,
  },
  'solaiman-lipi': {
    name: 'SolaimanLipi',
    stack: `'SolaimanLipi', ${BN_FALLBACK}, ui-sans-serif, sans-serif`,
  },
  georgia: {
    name: 'Georgia',
    stack: `Georgia, 'Times New Roman', ${BN_FALLBACK}, serif`,
  },
  'times-new-roman': {
    name: 'Times New Roman',
    stack: `'Times New Roman', Times, ${BN_FALLBACK}, serif`,
  },
  'courier-new': {
    name: 'Courier New',
    stack: `'Courier New', Courier, ui-monospace, monospace, ${BN_FALLBACK}`,
  },
}

/* ---------------- Theme Mode scale ---------------- */
export const COLOR_MODE_OPTIONS: ScaleOption<ColorModeId>[] = [
  { id: 'light', label: 'Light mode', hint: 'Crisp daylight surfaces with high legibility' },
  { id: 'dark', label: 'Dark mode', hint: 'Low-glare charcoal surfaces for late-night workflows' },
  { id: 'system', label: 'System (Auto)', hint: 'Synchronize automatically with your device OS settings' },
]

/* ---------------- Navigation & Sidebar options ---------------- */
export const SIDEBAR_STYLE_OPTIONS: ScaleOption<SidebarStyleId>[] = [
  { id: 'match', label: 'Matching surface', hint: 'Clean unified background matching active theme' },
  { id: 'dark', label: 'Contrast dark', hint: 'Classic authoritative deep navy/slate sidebar' },
  { id: 'accent', label: 'Brand tinted', hint: 'Distinguished brand-accent tinted sidebar' },
]

export const SIDEBAR_COLLAPSE_OPTIONS: ScaleOption<SidebarCollapseId>[] = [
  { id: 'expanded', label: 'Full width (252px)', hint: 'Standard complete labels and section headers' },
  { id: 'collapsed', label: 'Compact mini (68px)', hint: 'Icon-only view maximizing dashboard canvas' },
]

export const HEADER_STYLE_OPTIONS: ScaleOption<HeaderStyleId>[] = [
  { id: 'sticky', label: 'Sticky fixed', hint: 'Header remains pinned to top while scrolling' },
  { id: 'static', label: 'Scroll with page', hint: 'Header moves naturally with page content' },
]
