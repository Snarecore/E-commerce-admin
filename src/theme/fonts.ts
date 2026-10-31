import type { FontFamilyId } from './types'

export type FontCategory = 'sans' | 'system' | 'bengali' | 'serif' | 'mono'
export type FontSource = 'system' | 'google' | 'cdn'

export interface FontDefinition {
  id: FontFamilyId
  label: string
  bestUse: string
  category: FontCategory
  source: FontSource
  stack: string
  href?: string
  note?: string
}

const BN_FALLBACK = `'Nirmala UI', 'Shonar Bangla', 'Noto Sans Bengali'`
const SANS_TAIL = `${BN_FALLBACK}, ui-sans-serif, system-ui, sans-serif`

const google = (query: string) =>
  `https://fonts.googleapis.com/css2?family=${query}&display=swap`

export const FONTS: Record<FontFamilyId, FontDefinition> = {
  /* ---------------- Web Sans (Google) ---------------- */
  nunito: {
    id: 'nunito',
    label: 'Nunito',
    bestUse: 'Main Default — warm & friendly e-commerce feel',
    category: 'sans',
    source: 'google',
    stack: `'Nunito', ${SANS_TAIL}`,
    href: google('Nunito:ital,wght@0,300..900;1,300..900'),
  },
  inter: {
    id: 'inter',
    label: 'Inter',
    bestUse: 'Ultra-clean modern web applications & data grids',
    category: 'sans',
    source: 'google',
    stack: `'Inter', ${SANS_TAIL}`,
    href: google('Inter:wght@300..800'),
  },
  'plus-jakarta': {
    id: 'plus-jakarta',
    label: 'Plus Jakarta Sans',
    bestUse: 'High-end modern dashboards & typography',
    category: 'sans',
    source: 'google',
    stack: `'Plus Jakarta Sans', ${SANS_TAIL}`,
    href: google('Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800'),
  },
  roboto: {
    id: 'roboto',
    label: 'Roboto',
    bestUse: 'Standard admin dashboards & analytical reports',
    category: 'sans',
    source: 'google',
    stack: `'Roboto', ${SANS_TAIL}`,
    href: google('Roboto:wght@300..700'),
  },
  'open-sans': {
    id: 'open-sans',
    label: 'Open Sans',
    bestUse: 'Neutral corporate business portals',
    category: 'sans',
    source: 'google',
    stack: `'Open Sans', ${SANS_TAIL}`,
    href: google('Open+Sans:wght@300..800'),
  },
  lato: {
    id: 'lato',
    label: 'Lato',
    bestUse: 'Retail inventory & customer details',
    category: 'sans',
    source: 'google',
    stack: `'Lato', ${SANS_TAIL}`,
    href: google('Lato:wght@300;400;700;900'),
  },
  'ibm-plex': {
    id: 'ibm-plex',
    label: 'IBM Plex Sans',
    bestUse: 'Technical enterprise accounting & logistics',
    category: 'sans',
    source: 'google',
    stack: `'IBM Plex Sans', ${SANS_TAIL}`,
    href: google('IBM+Plex+Sans:wght@300..700'),
  },
  'source-sans': {
    id: 'source-sans',
    label: 'Source Sans 3',
    bestUse: 'Invoice tables and dense numerical forms',
    category: 'sans',
    source: 'google',
    stack: `'Source Sans 3', ${SANS_TAIL}`,
    href: google('Source+Sans+3:wght@300..700'),
  },
  'nunito-sans': {
    id: 'nunito-sans',
    label: 'Nunito Sans',
    bestUse: 'Geometric structured dashboard layouts',
    category: 'sans',
    source: 'google',
    stack: `'Nunito Sans', ${SANS_TAIL}`,
    href: google('Nunito+Sans:wght@300..800'),
  },
  poppins: {
    id: 'poppins',
    label: 'Poppins',
    bestUse: 'Clothing fashion storefront & marketing headers',
    category: 'sans',
    source: 'google',
    stack: `'Poppins', ${SANS_TAIL}`,
    href: google('Poppins:wght@300;400;500;600;700'),
    note: 'Wide geometric letterforms — slightly wider than standard',
  },
  'noto-sans': {
    id: 'noto-sans',
    label: 'Noto Sans',
    bestUse: 'Multilingual international currency & character support',
    category: 'sans',
    source: 'google',
    stack: `'Noto Sans', ${SANS_TAIL}`,
    href: google('Noto+Sans:wght@300..800'),
  },

  /* ---------------- System Fonts (Zero Network Cost) ---------------- */
  verdana: {
    id: 'verdana',
    label: 'Verdana',
    bestUse: 'ERP, large inventory tables & billing screens',
    category: 'system',
    source: 'system',
    stack: `Verdana, Geneva, ${SANS_TAIL}`,
  },
  arial: {
    id: 'arial',
    label: 'Arial',
    bestUse: 'Universal compatibility across every device',
    category: 'system',
    source: 'system',
    stack: `Arial, Helvetica, ${SANS_TAIL}`,
  },
  'segoe-ui': {
    id: 'segoe-ui',
    label: 'Segoe UI',
    bestUse: 'Windows & Office native desktop aesthetic',
    category: 'system',
    source: 'system',
    stack: `'Segoe UI', 'Segoe UI Variable', ${SANS_TAIL}`,
    note: 'Native on Windows; clean fallback elsewhere',
  },
  tahoma: {
    id: 'tahoma',
    label: 'Tahoma',
    bestUse: 'Very compact and precise data entry',
    category: 'system',
    source: 'system',
    stack: `Tahoma, Verdana, ${SANS_TAIL}`,
  },
  system: {
    id: 'system',
    label: 'System Default',
    bestUse: 'Matches client OS font (SF Pro / Segoe / Roboto)',
    category: 'system',
    source: 'system',
    stack: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ${SANS_TAIL}`,
  },

  /* ---------------- Bengali / বাংলা ---------------- */
  'noto-sans-bengali': {
    id: 'noto-sans-bengali',
    label: 'Noto Sans Bengali',
    bestUse: 'Crisp, modern Bengali text & Bangladeshi Taka (৳)',
    category: 'bengali',
    source: 'google',
    stack: `'Noto Sans Bengali', ${BN_FALLBACK}, ui-sans-serif, sans-serif`,
    href: google('Noto+Sans+Bengali:wght@300..700'),
  },
  'hind-siliguri': {
    id: 'hind-siliguri',
    label: 'Hind Siliguri',
    bestUse: 'Popular Bengali font for modern retail & e-commerce',
    category: 'bengali',
    source: 'google',
    stack: `'Hind Siliguri', ${BN_FALLBACK}, ui-sans-serif, sans-serif`,
    href: google('Hind+Siliguri:wght@300;400;500;600;700'),
    note: 'Beautifully supports both Bengali and English in one typeface',
  },
  'solaiman-lipi': {
    id: 'solaiman-lipi',
    label: 'SolaimanLipi',
    bestUse: 'Standard Bengali business, invoices & newspapers',
    category: 'bengali',
    source: 'cdn',
    stack: `'SolaimanLipi', ${BN_FALLBACK}, ui-sans-serif, sans-serif`,
    href: 'https://fonts.maateen.me/solaiman-lipi/font.css',
    note: 'Loaded via verified high-speed CDN',
  },

  /* ---------------- Serif ---------------- */
  georgia: {
    id: 'georgia',
    label: 'Georgia',
    bestUse: 'Boutique fashion editorial & classic branding',
    category: 'serif',
    source: 'system',
    stack: `Georgia, 'Times New Roman', ${BN_FALLBACK}, serif`,
  },
  'times-new-roman': {
    id: 'times-new-roman',
    label: 'Times New Roman',
    bestUse: 'Formal printed invoices & legal documentation',
    category: 'serif',
    source: 'system',
    stack: `'Times New Roman', Times, ${BN_FALLBACK}, serif`,
  },

  /* ---------------- Monospace ---------------- */
  'courier-new': {
    id: 'courier-new',
    label: 'Courier New',
    bestUse: 'Barcodes, SKU codes, serial numbers & tracking IDs',
    category: 'mono',
    source: 'system',
    stack: `'Courier New', Courier, ui-monospace, monospace, ${BN_FALLBACK}`,
    note: 'Monospace width ensures numbers always align vertically',
  },
}

export const FONT_LIST: FontDefinition[] = Object.values(FONTS)

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  sans: 'Modern Web Sans-Serif',
  system: 'System Fonts (Zero Network Overhead)',
  bengali: 'Bengali / বাংলা Typography',
  serif: 'Editorial & Boutique Serif',
  mono: 'Monospaced / Fixed-Width Data',
}

export const FONT_CATEGORY_ORDER: FontCategory[] = ['sans', 'system', 'bengali', 'serif', 'mono']

/**
 * Injects the `<link>` stylesheet for a web font on demand.
 * System fonts require no network requests. Repeated calls are instant no-ops.
 */
export const ensureFontLoaded = (id: FontFamilyId): void => {
  if (typeof document === 'undefined') return

  const font = FONTS[id]
  if (!font?.href) return

  const attr = 'data-font-id'
  if (document.head.querySelector(`link[${attr}="${id}"]`)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = font.href
  link.setAttribute(attr, id)
  // Resilience: network failure should never disrupt the application layout
  link.onerror = () => link.remove()
  document.head.appendChild(link)
}
