import React, { useEffect, useState } from 'react'
import {
  contrastRatio,
  deriveAccentRamp,
  gradeContrast,
  isValidHex,
  normalizeHex,
  readableOn,
} from '../../../../theme'
import { useAppearanceTranslation } from '../appearance-language'
import { FiCheck, FiRefreshCw } from 'react-icons/fi'

interface AccentPickerProps {
  effective: string
  override?: string
  onChange: (hex: string | undefined) => void
}

const BRAND_SWATCHES = [
  { hex: '#fe9f43', name: 'Bazaarbound Amber' },
  { hex: '#e68a2c', name: 'Deep Amber' },
  { hex: '#1b2850', name: 'Midnight Navy' },
  { hex: '#be185d', name: 'Rose Boutique' },
  { hex: '#047857', name: 'Emerald Commerce' },
  { hex: '#4338ca', name: 'Indigo Luxe' },
  { hex: '#0f766e', name: 'Teal Modern' },
  { hex: '#c74634', name: 'Warm Terracotta' },
  { hex: '#334155', name: 'Slate Neutral' },
  { hex: '#111827', name: 'Carbon Black' },
]

const ContrastReadout: React.FC<{ accent: string }> = ({ accent }) => {
  const t = useAppearanceTranslation()
  const onAccent = readableOn(accent)
  const checks = [
    { label: t('Button text on accent'), ratio: contrastRatio(accent, onAccent) },
    { label: t('Accent text on white'), ratio: contrastRatio(accent, '#ffffff') },
  ]

  return (
    <div className="mt-3 flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--ui-surface-sunken)] border border-[var(--ui-border)]">
      {checks.map((c) => {
        const grade = gradeContrast(c.ratio)
        const failing = grade === 'Fail'
        return (
          <div key={c.label} className="flex items-center justify-between gap-3 text-[12px]">
            <span className="text-[var(--ui-text-muted)] font-medium">{c.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[var(--ui-text-subtle)]">
                {c.ratio.toFixed(2)}:1
              </span>
              <span
                className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-sm"
                style={{
                  backgroundColor: failing
                    ? 'color-mix(in srgb, var(--ui-danger) 15%, transparent)'
                    : 'color-mix(in srgb, var(--ui-success) 15%, transparent)',
                  color: failing ? 'var(--ui-danger)' : 'var(--ui-success)',
                }}
              >
                {grade}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const AccentPicker: React.FC<AccentPickerProps> = ({ effective, override, onChange }) => {
  const t = useAppearanceTranslation()
  const [draft, setDraft] = useState(effective)

  useEffect(() => {
    setDraft(effective)
  }, [effective])

  const valid = isValidHex(draft)
  const ramp = valid ? deriveAccentRamp(draft) : null

  const commit = (hex: string) => {
    if (isValidHex(hex)) onChange(normalizeHex(hex))
  }

  return (
    <div>
      {override && (
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--ui-border)]/50">
          <span className="text-xs text-[var(--ui-text-muted)]">
            {t('Custom accent override active')}
          </span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-color)] hover:underline cursor-pointer"
          >
            <FiRefreshCw size={11} />
            {t('Reset to theme default')}
          </button>
        </div>
      )}

      {/* Swatches */}
      <div className="flex flex-wrap gap-2">
        {BRAND_SWATCHES.map((swatch) => {
          const selected = normalizeHex(effective) === normalizeHex(swatch.hex)
          return (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => commit(swatch.hex)}
              title={swatch.name}
              className={`relative h-9 w-9 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center shadow-xs ${
                selected ? 'ring-2 ring-offset-2 ring-[var(--primary-color)] scale-105' : ''
              }`}
              style={{ backgroundColor: swatch.hex }}
            >
              {selected && (
                <FiCheck
                  size={16}
                  style={{ color: readableOn(swatch.hex) }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Custom input & Color Picker */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex items-center">
          <input
            type="color"
            value={valid ? normalizeHex(draft) : '#fe9f43'}
            onChange={(e) => {
              setDraft(e.target.value)
              commit(e.target.value)
            }}
            className="h-10 w-12 cursor-pointer border border-[var(--ui-border)] rounded-md p-0.5 bg-transparent"
          />
        </div>

        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <input
            type="text"
            value={draft}
            maxLength={7}
            onChange={(e) => {
              const val = e.target.value
              setDraft(val)
              if (isValidHex(val)) commit(val)
            }}
            placeholder="#fe9f43"
            className="ui-control font-mono uppercase text-sm"
          />
        </div>

        {ramp && (
          <div className="flex items-center gap-1">
            <span
              className="h-7 w-7 rounded-md border border-[var(--ui-border)] shadow-xs"
              style={{ backgroundColor: ramp.accentLight }}
              title="Light tint"
            />
            <span
              className="h-7 w-7 rounded-md border border-[var(--ui-border)] shadow-xs"
              style={{ backgroundColor: ramp.accentMuted }}
              title="Muted tint"
            />
            <span
              className="h-7 w-7 rounded-md border border-[var(--ui-border)] shadow-xs"
              style={{ backgroundColor: ramp.accent }}
              title="Accent"
            />
            <span
              className="h-7 w-7 rounded-md border border-[var(--ui-border)] shadow-xs"
              style={{ backgroundColor: ramp.accentHover }}
              title="Hover"
            />
            <span
              className="h-7 w-7 rounded-md border border-[var(--ui-border)] shadow-xs"
              style={{ backgroundColor: ramp.accentDark }}
              title="Dark shade"
            />
          </div>
        )}
      </div>

      {valid && <ContrastReadout accent={draft} />}
    </div>
  )
}

export default AccentPicker
