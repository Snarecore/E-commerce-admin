import React, { useRef, useState } from 'react'
import {
  createPreset,
  downloadPresets,
  loadPresets,
  parseImport,
  persistPresets,
  useAppearance,
  type SavedPreset,
} from '../../../../theme'
import { showErrorToast, showSuccessToast } from '../../../../utils/toast-utils'
import { useAppearanceLanguage } from '../appearance-language'
import { FiDownload, FiPlay, FiTrash2, FiUpload } from 'react-icons/fi'

export const PresetManager: React.FC = () => {
  const { language, t } = useAppearanceLanguage()
  const { state, setTheme, setOverrides, resetOverrides } = useAppearance()
  const [presets, setPresets] = useState<SavedPreset[]>(() => loadPresets())
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const commit = (next: SavedPreset[]) => {
    setPresets(next)
    persistPresets(next)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      showErrorToast(language === 'bn' ? 'আগে কনফিগারেশনের একটি নাম লিখুন।' : 'Enter a preset name first.')
      return
    }
    if (presets.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      showErrorToast(
        language === 'bn'
          ? 'এই নামে কনফিগারেশন আগে থেকেই সংরক্ষিত আছে।'
          : 'A preset with that name already exists.'
      )
      return
    }
    commit([createPreset(trimmed, state), ...presets])
    setName('')
    showSuccessToast(
      language === 'bn' ? `"${trimmed}" কনফিগারেশন সংরক্ষিত হয়েছে।` : `Saved "${trimmed}"`
    )
  }

  const handleApply = (preset: SavedPreset) => {
    resetOverrides()
    setTheme(preset.state.themeId)
    setOverrides(preset.state.overrides)
    showSuccessToast(
      language === 'bn' ? `"${preset.name}" কনফিগারেশন চালু হয়েছে।` : `Applied "${preset.name}"`
    )
  }

  const handleDelete = (preset: SavedPreset) => {
    commit(presets.filter((p) => p.id !== preset.id))
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    const { presets: imported, error } = parseImport(text)
    if (error) {
      showErrorToast(error)
      return
    }
    const existing = new Set(presets.map((p) => p.name.toLowerCase()))
    const deduped = imported.map((p) =>
      existing.has(p.name.toLowerCase()) ? { ...p, name: `${p.name} (imported)` } : p
    )
    commit([...deduped, ...presets])
    showSuccessToast(
      language === 'bn'
        ? `${deduped.length}টি কনফিগারেশন ইমপোর্ট সম্পন্ন হয়েছে।`
        : `Imported ${deduped.length} preset${deduped.length === 1 ? '' : 's'}`
    )
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleImport(f)
          e.target.value = ''
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-[var(--ui-surface-sunken)]/60 border border-[var(--ui-border)]/60">
        <p className="text-xs text-[var(--ui-text-muted)] leading-relaxed max-w-lg">
          {t(
            'Store the current setup under a name, or move it to another browser as a file. Saved here, not on the server.'
          )}
        </p>
        <div className="flex items-center gap-2 shrink-0">
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
            disabled={presets.length === 0}
            onClick={() => downloadPresets(presets)}
          >
            <FiDownload size={14} />
            <span>{t('Export all')}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-3.5 flex flex-wrap items-end gap-2">
        <div className="ui-field min-w-[14rem] flex-1">
          <label htmlFor="preset-name" className="ui-label">
            {t('Preset name')}
          </label>
          <input
            id="preset-name"
            className="ui-control text-xs"
            value={name}
            maxLength={60}
            placeholder={t('e.g. Accounts desk — compact')}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-lg">
          {t('Save current')}
        </button>
      </form>

      {presets.length > 0 && (
        <div className="mt-3.5 divide-y divide-[var(--ui-border)] rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)]">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 transition hover:bg-[var(--ui-surface-muted)]"
            >
              <div>
                <span className="block text-sm font-semibold text-[var(--ui-text)]">
                  {preset.name}
                </span>
                <span className="text-[11px] text-[var(--ui-text-subtle)]">
                  {new Date(preset.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApply(preset)}
                  className="ui-btn ui-btn-subtle px-3.5 py-1.5 text-xs rounded-lg"
                  title="Apply Preset"
                >
                  <FiPlay size={12} />
                  <span>Apply</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(preset)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Preset"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PresetManager
