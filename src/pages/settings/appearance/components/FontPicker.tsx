import React, { useEffect, useMemo, useState } from 'react'
import {
  FONT_CATEGORY_LABELS,
  FONT_CATEGORY_ORDER,
  FONT_LIST,
  ensureFontLoaded,
  type FontCategory,
  type FontDefinition,
  type FontFamilyId,
} from '../../../../theme'
import { useAppearanceLanguage } from '../appearance-language'
import { FiCheck, FiSearch } from 'react-icons/fi'

interface FontPickerProps {
  value: FontFamilyId
  onChange: (id: FontFamilyId) => void
}

const LATIN_SAMPLE = 'Fashion Time Admin — ৳ 12,500.00'
const BENGALI_SAMPLE = 'পোশাক সম্ভার — চালান ১২,৫০০.০০ ৳'

const SOURCE_BADGE: Record<FontDefinition['source'], { label: string; tone: string }> = {
  system: { label: 'System (Instant)', tone: 'var(--ui-success)' },
  google: { label: 'Google Font', tone: 'var(--ui-text-subtle)' },
  cdn: { label: 'Web CDN', tone: 'var(--ui-warning)' },
}

export const FontPicker: React.FC<FontPickerProps> = ({ value, onChange }) => {
  const { t } = useAppearanceLanguage()
  const [query, setQuery] = useState('')
  const [showBengali, setShowBengali] = useState(false)

  // Ensure all web fonts are loaded so cards preview in their real face
  useEffect(() => {
    FONT_LIST.forEach((f) => ensureFontLoaded(f.id))
  }, [])

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = FONT_LIST.filter(
      (f) => !q || f.label.toLowerCase().includes(q) || f.bestUse.toLowerCase().includes(q)
    )
    return FONT_CATEGORY_ORDER.map((category) => ({
      category,
      fonts: matches.filter((f) => f.category === category),
    })).filter((g) => g.fonts.length > 0)
  }, [query])

  const sample = showBengali ? BENGALI_SAMPLE : LATIN_SAMPLE

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ui-text-subtle)]" size={14} />
          <input
            id="font-search"
            className="ui-control pl-9! text-xs h-8"
            placeholder={t('Search by name or use — e.g. tables, Bengali, reports')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 shrink-0">
          <input
            type="checkbox"
            checked={showBengali}
            onChange={(e) => setShowBengali(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer accent-[var(--primary-color)]"
          />
          <span className="text-xs font-semibold text-[var(--ui-text-muted)]">
            {t('Bengali sample')}
          </span>
        </label>
      </div>

      {grouped.length === 0 && (
        <p className="mt-4 text-[13px] text-[var(--ui-text-subtle)]">
          {t('No font matches')} “{query}”.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-6">
        {grouped.map(({ category, fonts }) => (
          <fieldset key={category} className="border-0 p-0 m-0">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-[var(--ui-text-subtle)] mb-2">
              {t(FONT_CATEGORY_LABELS[category as FontCategory])}
            </legend>

            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {fonts.map((font) => {
                const selected = font.id === value
                const badge = SOURCE_BADGE[font.source]
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => onChange(font.id)}
                    className={`cursor-pointer border p-3.5 text-left transition-all ${
                      selected
                        ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] shadow-xs'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:border-[var(--ui-border-strong)]'
                    }`}
                    style={{ borderRadius: 'var(--ui-radius)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            selected ? 'text-[var(--primary-color)]' : 'text-[var(--ui-text)]'
                          }`}
                        >
                          {font.label}
                        </span>
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-sm border"
                          style={{
                            borderColor: 'color-mix(in srgb, currentColor 30%, transparent)',
                            color: badge.tone,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {selected && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary-color)] text-[var(--ui-on-accent)] text-xs">
                          <FiCheck />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-[var(--ui-text-subtle)] line-clamp-1">
                      {font.bestUse}
                    </p>

                    <div
                      className="mt-2.5 truncate rounded-md bg-[var(--ui-surface-sunken)] px-3 py-2 text-sm text-[var(--ui-text)] border border-[var(--ui-border)]"
                      style={{ fontFamily: font.stack }}
                    >
                      {sample}
                    </div>
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  )
}

export default FontPicker
