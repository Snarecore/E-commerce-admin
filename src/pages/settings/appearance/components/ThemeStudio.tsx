import React, { useRef, useState } from 'react'
import {
  PALETTE_KEYS,
  PALETTE_LABELS,
  blankTheme,
  contrastRatio,
  downloadThemes,
  extractPalette,
  extractPaletteFromImage,
  isValidHex,
  normalizeHex,
  parseThemeImport,
  useAppearance,
  type ThemePalette,
  type ThemePreset,
} from '../../../../theme'
import { showErrorToast, showSuccessToast } from '../../../../utils/toast-utils'
import { useAppearanceLanguage } from '../appearance-language'
import { FiCheck, FiDownload, FiImage, FiPlus, FiUpload, FiX } from 'react-icons/fi'

interface ThemeStudioProps {
  editing: ThemePreset | null
  onEditingChange: (theme: ThemePreset | null) => void
}

export const ThemeStudio: React.FC<ThemeStudioProps> = ({ editing, onEditingChange }) => {
  const { language, t } = useAppearanceLanguage()
  const { customThemes, saveCustomTheme, setTheme, replaceCustomThemes } = useAppearance()
  const [draft, setDraft] = useState<ThemePreset | null>(editing)
  const [paste, setPaste] = useState('')
  const [pasteInfo, setPasteInfo] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const [swatches, setSwatches] = useState<{ hex: string; pct: number }[]>([])

  const [lastEditing, setLastEditing] = useState<ThemePreset | null>(editing)
  if (editing !== lastEditing) {
    setLastEditing(editing)
    setDraft(editing)
  }

  const start = (base?: ThemePreset) => {
    const next = base
      ? { ...base, palette: { ...base.palette } }
      : blankTheme(language === 'bn' ? 'আমার কাস্টম থিম' : 'My Custom Theme')
    setDraft(next)
    onEditingChange(null)
  }

  const close = () => {
    setDraft(null)
    onEditingChange(null)
  }

  const patchPalette = (key: keyof ThemePalette, hex: string) => {
    setDraft((d) => (d ? { ...d, palette: { ...d.palette, [key]: hex } } : d))
  }

  const handleExtract = () => {
    const { palette, found, namedRoles, error } = extractPalette(paste)
    if (error) {
      setPasteInfo(null)
      showErrorToast(error)
      return
    }
    setDraft((d) => {
      const base = d ?? blankTheme(language === 'bn' ? 'ইমপোর্ট করা থিম' : 'Imported Theme')
      return { ...base, palette }
    })
    setPasteInfo(
      language === 'bn'
        ? `${found.length}টি রং পাওয়া গেছে${namedRoles.length ? ` · নাম অনুসারে সনাক্ত: ${namedRoles.join(', ')}` : ' · স্বয়ংক্রিয় কালার রুল প্রস্তুত'}`
        : `Found ${found.length} colour${found.length === 1 ? '' : 's'}` +
          (namedRoles.length ? ` · matched by name: ${namedRoles.join(', ')}` : ' · roles inferred')
    )
  }

  const handleLogo = async (file: File) => {
    const r = await extractPaletteFromImage(file)
    if (r.error) {
      showErrorToast(r.error)
      return
    }
    setSwatches(r.swatches)
    setDraft((d) => {
      const base = d ?? blankTheme(file.name.replace(/\.\w+$/, '') || 'Logo Theme')
      return { ...base, palette: r.palette }
    })
    setPasteInfo(
      language === 'bn'
        ? `${r.swatches.length}টি প্রধান রং নেওয়া হয়েছে${r.palette.accentSecondary ? ' · ব্র্যান্ডের সেকেন্ডারি রং পাওয়া গেছে' : ''}`
        : `Sampled ${r.swatches.length} dominant colors` +
          (r.palette.accentSecondary ? ' · secondary brand tone detected' : '')
    )
  }

  const handleSave = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      showErrorToast(language === 'bn' ? 'থিমের একটি নাম দিন।' : 'Give the theme a name.')
      return
    }
    const invalid = PALETTE_KEYS.filter((k) => !isValidHex(draft.palette[k]))
    if (invalid.length) {
      showErrorToast(
        language === 'bn'
          ? `রঙের হেক্স কোড সঠিক নয়: ${invalid.map((k) => PALETTE_LABELS[k]).join(', ')}`
          : `Invalid hex code for: ${invalid.map((k) => PALETTE_LABELS[k]).join(', ')}`
      )
      return
    }
    const saved = saveCustomTheme({
      ...draft,
      name: draft.name.trim(),
      palette: PALETTE_KEYS.reduce((acc, k) => {
        const val = draft.palette[k]
        acc[k] = typeof val === 'string' ? normalizeHex(val) : '#000000'
        return acc
      }, {} as ThemePalette),
    })
    setTheme(saved.id)
    showSuccessToast(
      language === 'bn'
        ? `"${saved.name}" থিমটি সংরক্ষিত ও সক্রিয় হয়েছে।`
        : `Saved and applied "${saved.name}"`
    )
    close()
  }

  const handleImportFile = async (file: File) => {
    const { themes, error } = parseThemeImport(await file.text())
    if (error) {
      showErrorToast(error)
      return
    }
    const existing = new Set(customThemes.map((t) => t.id))
    const merged = [...customThemes, ...themes.filter((t) => !existing.has(t.id))]
    replaceCustomThemes(merged)
    showSuccessToast(
      language === 'bn'
        ? `${themes.length}টি থিম ইমপোর্ট সম্পন্ন হয়েছে।`
        : `Imported ${themes.length} theme${themes.length === 1 ? '' : 's'}`
    )
  }

  const accentRatio = draft ? contrastRatio(draft.palette.accent, draft.palette.surface) : 0
  const textRatio = draft ? contrastRatio(draft.palette.text, draft.palette.surface) : 0

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleImportFile(f)
          e.target.value = ''
        }}
      />

      {!draft ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-[var(--ui-surface-sunken)]/60 border border-[var(--ui-border)]/60">
          <p className="text-xs text-[var(--ui-text-muted)] leading-relaxed max-w-lg">
            {t(
              'Build your own theme, or paste the colours from a theme you own to convert it. Only colour values are read — no CSS or assets are copied.'
            )}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-lg"
              onClick={() => start()}
            >
              <FiPlus size={14} />
              <span>{t('New theme')}</span>
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary px-3.5 py-1.5 text-xs rounded-lg"
              onClick={() => fileRef.current?.click()}
            >
              <FiUpload size={14} />
              <span>{t('Import')}</span>
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-secondary px-3.5 py-1.5 text-xs rounded-lg"
              disabled={!customThemes.length}
              onClick={() => downloadThemes(customThemes)}
            >
              <FiDownload size={14} />
              <span>{t('Export all')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--primary-color)] p-4 sm:p-5 bg-[var(--ui-surface)] shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--ui-border)]">
            <h3 className="text-sm font-bold text-[var(--primary-color)]">
              {editing ? t('Edit Custom Theme') : t('Theme Builder')}
            </h3>
            <button
              type="button"
              onClick={close}
              className="p-1 rounded-md text-[var(--ui-text-subtle)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)] transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="ui-field">
              <label className="ui-label">Theme Name</label>
              <input
                type="text"
                value={draft.name}
                maxLength={40}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="ui-control"
                placeholder="e.g. Modern Autumn"
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Short Description</label>
              <input
                type="text"
                value={draft.description}
                maxLength={100}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="ui-control"
                placeholder="e.g. Warm amber tones with rounded corners"
              />
            </div>
          </div>

          {/* Quick Extract Section (Text or Logo) */}
          <div className="mt-5 rounded-lg border border-dashed border-[var(--ui-border-strong)] p-3.5 bg-[var(--ui-surface-sunken)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ui-text-muted)]">
                Auto-Generate from Logo / CSS
              </span>
              <button
                type="button"
                className="ui-btn ui-btn-subtle ui-btn-xs"
                onClick={() => logoRef.current?.click()}
              >
                <FiImage size={13} />
                <span>Upload Logo Image</span>
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleLogo(f)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder="Or paste hex codes / CSS variables (e.g. #fe9f43 #1b2850)"
                className="ui-control text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleExtract}
                className="ui-btn ui-btn-secondary px-3.5 py-1.5 text-xs rounded-lg"
              >
                Extract
              </button>
            </div>
            {pasteInfo && <p className="mt-1.5 text-xs text-[var(--primary-color)]">{pasteInfo}</p>}
            {swatches.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-[var(--ui-text-subtle)]">Extracted Swatches:</span>
                {swatches.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => patchPalette('accent', s.hex)}
                    className="inline-block h-5 w-5 rounded-full border border-[var(--ui-border)] shadow-xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: s.hex }}
                    title={`Click to set accent: ${s.hex} (${s.pct}%)`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Palette editing grid */}
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ui-text-subtle)] mb-3">
              Theme Palette Colors
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PALETTE_KEYS.map((key) => {
                const rawVal = draft.palette[key]
                const val = typeof rawVal === 'string' ? rawVal : '#ffffff'
                const valid = isValidHex(val)
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-md border border-[var(--ui-border)] bg-[var(--ui-surface)]"
                  >
                    <input
                      type="color"
                      value={valid ? normalizeHex(val) : '#ffffff'}
                      onChange={(e) => patchPalette(key, e.target.value)}
                      className="h-8 w-8 rounded-sm border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-semibold text-[var(--ui-text)] truncate">
                        {PALETTE_LABELS[key]}
                      </span>
                      <input
                        type="text"
                        value={val}
                        maxLength={7}
                        onChange={(e) => patchPalette(key, e.target.value)}
                        className="w-full text-xs font-mono bg-transparent border-0 outline-none p-0 text-[var(--ui-text-muted)]"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--ui-border)]">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-[var(--ui-text-subtle)]">
                Accent Contrast: <strong className="font-mono">{accentRatio.toFixed(2)}:1</strong>
              </span>
              <span className="text-[var(--ui-text-subtle)]">
                Text Contrast: <strong className="font-mono">{textRatio.toFixed(2)}:1</strong>
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="ui-btn ui-btn-ghost px-3.5 py-1.5 text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-lg shadow-xs"
              >
                <FiCheck size={13} />
                <span>Save & Apply Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeStudio
