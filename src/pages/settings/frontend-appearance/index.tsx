import React, { useState, useEffect } from 'react'
import {
  FiCheck,
  FiShoppingBag,
  FiSmartphone,
  FiMonitor,
  FiStar,
  FiHeart,
  FiTag,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiSearch,
  FiType,
  FiSun,
  FiMoon,
  FiDatabase,
} from 'react-icons/fi'
import { MdStorefront, MdOutlinePalette } from 'react-icons/md'
import { useAPI } from '../../../hooks/useApi'
import apiConfig from '../../../config/api.json'
import { showSuccessToast, showErrorToast } from '../../../utils/toast-utils'
import { getAccessibleTextColor } from '../../../utils/color-contrast'

export interface StorefrontThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundTone: string
  fontFamily: string
  borderRadius: 'sharp' | 'soft' | 'rounded' | 'pill'
  bannerEnabled: boolean
  bannerText: string
  bannerStyle: 'tint' | 'solid' | 'dark'
  customerDarkMode: boolean
  defaultMode: 'light' | 'dark'
}

const DEFAULT_CONFIG: StorefrontThemeConfig = {
  primaryColor: '#218DAE',
  secondaryColor: '#1D7693',
  backgroundTone: '#FBF9F5',
  fontFamily: 'Inter',
  borderRadius: 'rounded',
  bannerEnabled: true,
  bannerText: '✨ Special Eid Collection 2026 - Flat 20% Off | Use Code: EID26',
  bannerStyle: 'tint',
  customerDarkMode: true,
  defaultMode: 'light',
}

const PRIMARY_PRESETS = [
  { name: 'Fashion Cyan', color: '#218DAE', secondary: '#1D7693' },
  { name: 'Emerald Green', color: '#10B981', secondary: '#059669' },
  { name: 'Royal Indigo', color: '#6366F1', secondary: '#4F46E5' },
  { name: 'Regal Purple', color: '#8B5CF6', secondary: '#7C3AED' },
  { name: 'Crimson Rose', color: '#E11D48', secondary: '#BE123C' },
  { name: 'Warm Amber', color: '#FE9F43', secondary: '#F7861B' },
  { name: 'Sunset Orange', color: '#F97316', secondary: '#EA580C' },
  { name: 'Midnight Slate', color: '#1E293B', secondary: '#0F172A' },
]

const BG_TONES = [
  { id: '#FBF9F5', name: 'Warm Ivory (Default)', preview: '#FBF9F5' },
  { id: '#FFFFFF', name: 'Pure White', preview: '#FFFFFF' },
  { id: '#FAF7F2', name: 'Vintage Linen', preview: '#FAF7F2' },
  { id: '#F8FAFC', name: 'Cool Slate', preview: '#F8FAFC' },
]

const FONTS = [
  { id: 'Inter', name: 'Inter (Clean & Modern)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Geometric)' },
  { id: 'Outfit', name: 'Outfit (Fashion Display)' },
  { id: 'Hind Siliguri', name: 'Hind Siliguri (Bengali & English)' },
]

const RADIUS_MAP: Record<StorefrontThemeConfig['borderRadius'], string> = {
  sharp: '0px',
  soft: '6px',
  rounded: '12px',
  pill: '9999px',
}

const FrontendAppearance: React.FC = () => {
  const { fetchData, postMutation } = useAPI()
  const [isSaving, setIsSaving] = useState(false)
  const [, setIsLoading] = useState(true)

  const [config, setConfig] = useState<StorefrontThemeConfig>(DEFAULT_CONFIG)

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [publishedToast, setPublishedToast] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'theme' | 'banner' | 'typography'>('theme')

  const fgColor = getAccessibleTextColor(config.primaryColor)

  // 1. Fetch saved theme from database on mount
  useEffect(() => {
    let isMounted = true
    const loadThemeFromDatabase = async () => {
      try {
        setIsLoading(true)
        const response = await fetchData({ apiUrl: apiConfig.setting.storefrontTheme })
        const data = response?.data || response
        if (data && isMounted) {
          if (data.themeConfig) {
            setConfig((prev) => ({
              ...prev,
              ...data.themeConfig,
              primaryColor: data.primaryColor || data.themeConfig.primaryColor || prev.primaryColor,
              secondaryColor: data.secondaryColor || data.themeConfig.secondaryColor || prev.secondaryColor,
            }))
          } else if (data.primaryColor) {
            setConfig((prev) => ({
              ...prev,
              primaryColor: data.primaryColor,
              secondaryColor: data.secondaryColor || prev.secondaryColor,
            }))
          }
        }
      } catch (err) {
        // Keep defaults if database call fails
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadThemeFromDatabase()
    return () => {
      isMounted = false
    }
  }, [])

  const updateConfig = (patch: Partial<StorefrontThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }

  // 2. Save directly into TiDB Database
  const handlePublish = async () => {
    setIsSaving(true)
    try {
      await postMutation.mutateAsync({
        url: apiConfig.setting.storefrontTheme,
        body: {
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          themeConfig: config,
        },
      })

      showSuccessToast('Storefront theme saved to database & published to all customers!')
      setPublishedToast(true)
      setTimeout(() => setPublishedToast(false), 3500)
    } catch (err) {
      showErrorToast('Failed to save storefront theme to database. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
  }

  return (
    <div className="ui-page mx-auto w-full pb-16 space-y-6">
      {/* ---------------- Master Top Header ---------------- */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--ui-surface)] border border-[var(--ui-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[var(--primary-color-light)] text-[var(--primary-color)]">
              <MdStorefront size={18} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-color)]">
              Customer Website Customizer
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to TiDB Database
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--ui-text)]">
            Frontend Appearance
          </h1>
          <p className="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-[var(--ui-text-muted)]">
            Customize the storefront branding, theme colors, top announcement banner, and visual styling for customer-facing web store. Changes are saved directly in the database and applied globally to all customer devices.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="ui-btn ui-btn-secondary px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <FiRotateCcw size={12} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublish}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              publishedToast
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--primary-color)] text-[var(--ui-on-accent)] hover:brightness-105 active:scale-95 disabled:opacity-75'
            }`}
          >
            {isSaving ? (
              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : publishedToast ? (
              <FiCheck size={14} />
            ) : (
              <FiDatabase size={14} />
            )}
            <span>
              {isSaving
                ? 'Saving to Database...'
                : publishedToast
                  ? 'Saved to DB & Published!'
                  : 'Save & Publish to Storefront (DB)'}
            </span>
          </button>
        </div>
      </header>

      {/* ---------------- Main Grid Layout ---------------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Left Column: Storefront Controls */}
        <div className="flex flex-col gap-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 p-1 bg-[var(--ui-surface-sunken)] rounded-xl border border-[var(--ui-border)]/70">
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'theme'
                  ? 'bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-xs border border-[var(--ui-border)]/60'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <MdOutlinePalette size={15} />
              <span>Brand Colors & Palette</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banner')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'banner'
                  ? 'bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-xs border border-[var(--ui-border)]/60'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiTag size={14} />
              <span>Offer Banner & Promos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('typography')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'typography'
                  ? 'bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-xs border border-[var(--ui-border)]/60'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
              }`}
            >
              <FiType size={14} />
              <span>Typography & Shape</span>
            </button>
          </div>

          {/* TAB 1: Brand Colors */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Primary Color Card */}
              <section className="ui-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--ui-border)]/60">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ui-text)]">
                      Storefront Primary Brand Color
                    </h3>
                    <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
                      Powers all buttons, badges, links, active category tabs, and checkout highlights on the customer website.
                    </p>
                  </div>
                  <div
                    className="h-8 w-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                </div>

                {/* Preset Swatches */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRIMARY_PRESETS.map((preset) => {
                    const isSelected = config.primaryColor.toLowerCase() === preset.color.toLowerCase()
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => updateConfig({ primaryColor: preset.color, secondaryColor: preset.secondary })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] ring-2 ring-[var(--primary-color)]/20 shadow-xs'
                            : 'border-[var(--ui-border)] bg-[var(--ui-surface-sunken)]/60 hover:border-[var(--ui-border-strong)]'
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full shrink-0 shadow-2xs border border-black/10 flex items-center justify-center text-white"
                          style={{ backgroundColor: preset.color }}
                        >
                          {isSelected && <FiCheck size={11} />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[var(--ui-text)] truncate">{preset.name}</p>
                          <p className="text-[10px] font-mono text-[var(--ui-text-muted)] uppercase">{preset.color}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Hex Input */}
                <div className="mt-4 pt-3.5 border-t border-[var(--ui-border)]/60 flex items-center gap-3">
                  <label htmlFor="custom-primary" className="text-xs font-semibold text-[var(--ui-text)] shrink-0">
                    Custom HEX Code:
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      id="custom-primary"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                      className="h-8 w-10 p-0 rounded border border-[var(--ui-border)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                      placeholder="#218DAE"
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] text-xs font-mono font-semibold text-[var(--ui-text)] w-28 uppercase"
                    />
                  </div>
                </div>
              </section>

              {/* Background Tone */}
              <section className="ui-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xs">
                <div className="pb-3 mb-4 border-b border-[var(--ui-border)]/60">
                  <h3 className="text-sm font-bold text-[var(--ui-text)]">
                    Storefront Background Canvas Tone
                  </h3>
                  <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
                    Sets the atmospheric background color of the customer storefront.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BG_TONES.map((tone) => {
                    const isSelected = config.backgroundTone === tone.id
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => updateConfig({ backgroundTone: tone.id })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20 shadow-xs'
                            : 'border-[var(--ui-border)] hover:border-[var(--ui-border-strong)]'
                        }`}
                        style={{ backgroundColor: tone.preview }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">{tone.name}</span>
                          {isSelected && <FiCheck size={12} className="text-[var(--primary-color)]" />}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">{tone.id}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Customer Dark Mode Policy */}
              <section className="ui-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xs">
                <div className="pb-3 mb-4 border-b border-[var(--ui-border)]/60">
                  <h3 className="text-sm font-bold text-[var(--ui-text)]">
                    Customer Dark Mode Behavior
                  </h3>
                  <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
                    Allow storefront visitors to switch between dark and light themes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateConfig({ customerDarkMode: !config.customerDarkMode })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        config.customerDarkMode ? 'bg-[var(--primary-color)]' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.customerDarkMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-[var(--ui-text)]">
                        Enable Customer Theme Toggle
                      </p>
                      <p className="text-[11px] text-[var(--ui-text-muted)]">
                        Shows sun/moon switch in storefront navbar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--ui-surface-sunken)] border border-[var(--ui-border)] text-xs">
                    <button
                      type="button"
                      onClick={() => updateConfig({ defaultMode: 'light' })}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        config.defaultMode === 'light'
                          ? 'bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-xs'
                          : 'text-[var(--ui-text-muted)]'
                      }`}
                    >
                      <FiSun size={12} />
                      <span>Default Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfig({ defaultMode: 'dark' })}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        config.defaultMode === 'dark'
                          ? 'bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-xs'
                          : 'text-[var(--ui-text-muted)]'
                      }`}
                    >
                      <FiMoon size={12} />
                      <span>Default Dark</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: Offer Banner */}
          {activeTab === 'banner' && (
            <div className="space-y-6">
              <section className="ui-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--ui-border)]/60">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ui-text)]">
                      Top Announcement Bar
                    </h3>
                    <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
                      Pinned at the very top of your storefront to announce festive discounts and flash deals.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ bannerEnabled: !config.bannerEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.bannerEnabled ? 'bg-[var(--primary-color)]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.bannerEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {config.bannerEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="banner-text" className="block text-xs font-bold text-[var(--ui-text)] mb-1.5">
                        Banner Announcement Message
                      </label>
                      <input
                        id="banner-text"
                        type="text"
                        value={config.bannerText}
                        onChange={(e) => updateConfig({ bannerText: e.target.value })}
                        placeholder="e.g. Free shipping on all orders over ৳ 1,500!"
                        className="w-full px-3.5 py-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-xs text-[var(--ui-text)] shadow-2xs focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--ui-text)] mb-2">
                        Banner Style & Color Treatment
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'tint', label: 'Primary Tint', desc: 'Soft pastel primary tone' },
                          { id: 'solid', label: 'Solid Primary', desc: 'Vibrant filled color' },
                          { id: 'dark', label: 'Elegant Dark', desc: 'Deep obsidian tone' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateConfig({ bannerStyle: opt.id as any })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              config.bannerStyle === opt.id
                                ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] ring-2 ring-[var(--primary-color)]/20 shadow-xs'
                                : 'border-[var(--ui-border)] bg-[var(--ui-surface-sunken)]/60 hover:border-[var(--ui-border-strong)]'
                            }`}
                          >
                            <p className="text-xs font-bold text-[var(--ui-text)]">{opt.label}</p>
                            <p className="text-[10px] text-[var(--ui-text-muted)] mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3: Typography & Shape */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {/* Font Family */}
              <section className="ui-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xs">
                <div className="pb-3 mb-4 border-b border-[var(--ui-border)]/60">
                  <h3 className="text-sm font-bold text-[var(--ui-text)]">
                    Storefront Font Family
                  </h3>
                  <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
                    Select typography that matches your brand persona.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => updateConfig({ fontFamily: font.id })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        config.fontFamily === font.id
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] ring-2 ring-[var(--primary-color)]/20 shadow-xs'
                          : 'border-[var(--ui-border)] bg-[var(--ui-surface-sunken)]/60 hover:border-[var(--ui-border-strong)]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-[var(--ui-text)]">{font.name}</p>
                        <p className="text-[11px] text-[var(--ui-text-muted)] mt-0.5">The quick brown fox jumps</p>
                      </div>
                      {config.fontFamily === font.id && (
                        <FiCheck size={14} className="text-[var(--primary-color)] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Corner Radius */}
              <section className="ui-card p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-xs">
                <div className="pb-3 mb-4 border-b border-[var(--ui-border)]/60">
                  <h3 className="text-sm font-bold text-[var(--ui-text)]">
                    Product Cards & Buttons Corner Radius
                  </h3>
                  <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
                    Determines the curvature of storefront product tiles, image containers, and action buttons.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {(['sharp', 'soft', 'rounded', 'pill'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateConfig({ borderRadius: r })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer capitalize ${
                        config.borderRadius === r
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] ring-2 ring-[var(--primary-color)]/20 shadow-xs font-bold text-[var(--primary-color)]'
                          : 'border-[var(--ui-border)] bg-[var(--ui-surface-sunken)]/60 text-[var(--ui-text)]'
                      }`}
                    >
                      <div
                        className="h-7 w-full border border-current mb-2 mx-auto"
                        style={{ borderRadius: RADIUS_MAP[r] }}
                      />
                      <span className="text-xs">{r}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Storefront Preview */}
        <div className="xl:sticky xl:top-24 xl:self-start flex flex-col gap-4">
          <div className="ui-card p-4 sm:p-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-sm">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--ui-border)]/70">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[var(--primary-color-light)] text-[var(--primary-color)]">
                  <FiShoppingBag size={15} />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--ui-text)]">Storefront Preview</h4>
                  <p className="text-[10px] text-[var(--ui-text-muted)]">Live customer view</p>
                </div>
              </div>

              {/* Device Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--ui-surface-sunken)] border border-[var(--ui-border)]/80">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-[var(--primary-color)] text-[var(--ui-on-accent)] shadow-2xs'
                      : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
                  }`}
                  title="Desktop Preview"
                >
                  <FiMonitor size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-[var(--primary-color)] text-[var(--ui-on-accent)] shadow-2xs'
                      : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
                  }`}
                  title="Mobile Preview"
                >
                  <FiSmartphone size={13} />
                </button>
              </div>
            </div>

            {/* Mockup Container */}
            <div
              className={`mt-4 rounded-xl border border-[var(--ui-border)] overflow-hidden transition-all duration-300 mx-auto ${
                previewDevice === 'mobile' ? 'max-w-[320px] shadow-lg' : 'w-full shadow-xs'
              }`}
              style={{
                backgroundColor: config.backgroundTone,
                fontFamily: config.fontFamily,
              }}
            >
              {/* Optional Announcement Banner */}
              {config.bannerEnabled && (
                <div
                  className="px-3 py-1.5 text-[10px] font-semibold flex items-center justify-between transition-colors"
                  style={{
                    backgroundColor:
                      config.bannerStyle === 'solid'
                        ? config.primaryColor
                        : config.bannerStyle === 'dark'
                          ? '#0F172A'
                          : `${config.primaryColor}18`,
                    color:
                      config.bannerStyle === 'solid' || config.bannerStyle === 'dark'
                        ? '#FFFFFF'
                        : config.primaryColor,
                  }}
                >
                  <span className="truncate">{config.bannerText}</span>
                  <span className="underline cursor-pointer shrink-0 ml-1 text-[9px] font-bold">Shop</span>
                </div>
              )}

              {/* Storefront Header */}
              <div className="px-3 py-2.5 border-b border-gray-200/80 bg-white/90 backdrop-blur-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-6 w-6 rounded-md flex items-center justify-center font-black text-xs text-white shadow-xs"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    FT
                  </span>
                  <span className="font-extrabold text-xs tracking-tight text-gray-900">
                    Fashion<span style={{ color: config.primaryColor }}>Time</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-[10px] text-gray-500">
                    <FiSearch size={10} />
                    <span>Search sarees...</span>
                  </div>
                  <div className="relative p-1.5 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800">
                    <FiShoppingBag size={14} />
                    <span
                      className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: config.primaryColor, color: fgColor }}
                    >
                      2
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="p-3 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All', 'Panjabi', 'Kurti', 'Saree', 'Kids'].map((cat) => {
                  const isActive = activeCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all shrink-0"
                      style={{
                        backgroundColor: isActive ? config.primaryColor : '#E5E7EB',
                        color: isActive ? fgColor : '#4B5563',
                        borderRadius: RADIUS_MAP[config.borderRadius],
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>

              {/* Product Cards Grid */}
              <div className="p-3 grid grid-cols-2 gap-2.5">
                {/* Product 1 */}
                <div
                  className="bg-white border border-gray-200/90 p-2 shadow-2xs flex flex-col justify-between"
                  style={{ borderRadius: RADIUS_MAP[config.borderRadius] }}
                >
                  <div>
                    <div
                      className="relative h-24 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: `${config.primaryColor}12`,
                        borderRadius: RADIUS_MAP[config.borderRadius],
                      }}
                    >
                      <span
                        className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-black uppercase text-white tracking-wider rounded"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        BESTSELLER
                      </span>
                      <button
                        type="button"
                        aria-label="Wishlist"
                        className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-gray-400 hover:text-rose-500 shadow-2xs"
                      >
                        <FiHeart size={10} />
                      </button>
                      <span className="text-2xl">🥻</span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                        <FiStar size={9} className="fill-current" />
                        <span className="font-bold text-gray-800">4.9</span>
                        <span className="text-gray-400">(128)</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-gray-900 mt-0.5 line-clamp-1">
                        Embroidered Georgette Saree
                      </h5>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xs font-black" style={{ color: config.primaryColor }}>
                          ৳ 4,250
                        </span>
                        <span className="text-[9px] text-gray-400 line-through">৳ 5,500</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: config.primaryColor,
                      color: fgColor,
                      borderRadius: RADIUS_MAP[config.borderRadius],
                    }}
                  >
                    <FiShoppingBag size={11} />
                    <span>Add to Bag</span>
                  </button>
                </div>

                {/* Product 2 */}
                <div
                  className="bg-white border border-gray-200/90 p-2 shadow-2xs flex flex-col justify-between"
                  style={{ borderRadius: RADIUS_MAP[config.borderRadius] }}
                >
                  <div>
                    <div
                      className="relative h-24 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: `${config.primaryColor}12`,
                        borderRadius: RADIUS_MAP[config.borderRadius],
                      }}
                    >
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-black uppercase text-white tracking-wider rounded bg-rose-500">
                        -20% OFF
                      </span>
                      <button
                        type="button"
                        aria-label="Wishlist"
                        className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-gray-400 hover:text-rose-500 shadow-2xs"
                      >
                        <FiHeart size={10} />
                      </button>
                      <span className="text-2xl">👔</span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                        <FiStar size={9} className="fill-current" />
                        <span className="font-bold text-gray-800">4.8</span>
                        <span className="text-gray-400">(94)</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-gray-900 mt-0.5 line-clamp-1">
                        Royal Semi-Silk Panjabi
                      </h5>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xs font-black" style={{ color: config.primaryColor }}>
                          ৳ 2,900
                        </span>
                        <span className="text-[9px] text-gray-400 line-through">৳ 3,600</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: config.primaryColor,
                      color: fgColor,
                      borderRadius: RADIUS_MAP[config.borderRadius],
                    }}
                  >
                    <FiShoppingBag size={11} />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>

              {/* Trust Badges Footer */}
              <div className="p-2.5 border-t border-gray-200/80 bg-white/70 grid grid-cols-3 gap-1 text-center text-[9px] text-gray-500 font-medium">
                <div className="flex flex-col items-center gap-0.5">
                  <FiTruck size={12} style={{ color: config.primaryColor }} />
                  <span className="leading-tight">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <FiRotateCcw size={12} style={{ color: config.primaryColor }} />
                  <span className="leading-tight">7 Days Return</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <FiShield size={12} style={{ color: config.primaryColor }} />
                  <span className="leading-tight">100% Original</span>
                </div>
              </div>
            </div>

            {/* Quick Publish CTA Card */}
            <div className="mt-4 pt-3 border-t border-[var(--ui-border)]/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--ui-text-muted)]">
                Active Color: <span className="font-mono font-bold text-[var(--ui-text)] uppercase">{config.primaryColor}</span>
              </span>
              <button
                type="button"
                disabled={isSaving}
                onClick={handlePublish}
                className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-xl shadow-xs font-bold cursor-pointer disabled:opacity-75 flex items-center gap-1.5"
              >
                {isSaving && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{isSaving ? 'Saving...' : publishedToast ? 'Published!' : 'Save & Publish (DB)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FrontendAppearance
