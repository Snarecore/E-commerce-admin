import React from 'react'
import { THEME_LIST, type ThemePreset, type ThemeRef } from '../../../../theme'
import { useAppearanceTranslation } from '../appearance-language'
import { FiCheck, FiEdit2, FiTrash2, FiLayers } from 'react-icons/fi'

interface ThemeGalleryProps {
  value: ThemeRef
  onChange: (id: ThemeRef) => void
  customThemes?: ThemePreset[]
  onEdit?: (theme: ThemePreset) => void
  onDelete?: (theme: ThemePreset) => void
}

const RADIUS_PX: Record<string, string> = {
  none: '0px',
  sm: '3px',
  md: '6px',
  lg: '10px',
  xl: '14px',
}

const ThemeSwatch: React.FC<{ theme: ThemePreset }> = ({ theme }) => {
  const p = theme.palette
  const radius = RADIUS_PX[theme.defaults.radius] ?? '6px'
  const isDark = p.isDark || theme.id === 'graphite-dark'

  return (
    <div
      className="p-3 transition-colors rounded-t-xl"
      style={{ backgroundColor: p.surfaceSunken }}
    >
      {/* Mini App Window */}
      <div
        className="rounded-lg border shadow-xs overflow-hidden"
        style={{
          backgroundColor: p.surface,
          borderColor: p.border,
        }}
      >
        {/* Top Window Bar */}
        <div
          className="flex items-center justify-between px-2.5 py-1.5 border-b"
          style={{ borderColor: p.border, backgroundColor: p.surfaceMuted }}
        >
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 opacity-80" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 opacity-80" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-80" />
          </div>
          <div
            className="h-1.5 w-12 rounded-full opacity-40"
            style={{ backgroundColor: p.textSubtle }}
          />
          <div className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.accent }}
            />
            {p.accentSecondary && (
              <span
                className="h-2 w-2 rounded-full opacity-80"
                style={{ backgroundColor: p.accentSecondary }}
              />
            )}
          </div>
        </div>

        {/* Mini Layout Body */}
        <div className="flex h-16">
          {/* Mini Left Sidebar */}
          <div
            className="w-1/4 border-r p-1.5 flex flex-col justify-between"
            style={{ borderColor: p.border, backgroundColor: p.surfaceMuted }}
          >
            <div className="flex flex-col gap-1">
              <div
                className="h-2 w-full rounded-xs shadow-2xs"
                style={{ backgroundColor: p.accent }}
              />
              <div
                className="h-1.5 w-4/5 rounded-xs opacity-50"
                style={{ backgroundColor: p.textSubtle }}
              />
              <div
                className="h-1.5 w-3/4 rounded-xs opacity-40"
                style={{ backgroundColor: p.textSubtle }}
              />
            </div>
            <div
              className="h-1.5 w-1/2 rounded-xs opacity-30"
              style={{ backgroundColor: p.textSubtle }}
            />
          </div>

          {/* Mini Content Area */}
          <div className="flex-1 p-2 flex flex-col justify-between">
            {/* Top Stat Card */}
            <div
              className="p-1 rounded-sm border flex items-center justify-between shadow-2xs"
              style={{ borderColor: p.border, backgroundColor: p.surfaceSunken }}
            >
              <div className="flex flex-col gap-0.5">
                <div
                  className="h-1.5 w-10 rounded-xs"
                  style={{ backgroundColor: p.textMuted }}
                />
                <div
                  className="h-2 w-14 rounded-xs font-bold"
                  style={{ backgroundColor: p.accent }}
                />
              </div>
              <div
                className="h-3 w-3 rounded-full opacity-80"
                style={{ backgroundColor: p.accentSecondary ?? p.accentLight }}
              />
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 px-2 rounded-xs flex items-center justify-center text-[7px] font-bold shadow-2xs"
                style={{
                  backgroundColor: p.accent,
                  color: isDark ? '#000000' : '#ffffff',
                  borderRadius: radius,
                }}
              >
                Buy
              </div>
              <div
                className="h-4 flex-1 border rounded-xs px-1 flex items-center"
                style={{
                  borderColor: p.borderStrong,
                  backgroundColor: p.surface,
                  borderRadius: radius,
                }}
              >
                <span
                  className="h-1 w-8 rounded-full opacity-40"
                  style={{ backgroundColor: p.textSubtle }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ThemeCard: React.FC<{
  theme: ThemePreset
  selected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}> = ({ theme, selected, onSelect, onEdit, onDelete }) => {
  const t = useAppearanceTranslation()

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-[var(--ui-surface)] transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-[var(--primary-color)] shadow-md ring-2 ring-[var(--ui-focus-ring)]'
          : 'border-[var(--ui-border)] hover:border-[var(--ui-border-strong)] hover:shadow-xs'
      }`}
      onClick={onSelect}
    >
      <ThemeSwatch theme={theme} />

      <div className="p-3 bg-[var(--ui-surface)] border-t border-[var(--ui-border)]/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: theme.palette.accent }}
            />
            <span
              className={`text-[13px] font-bold tracking-tight truncate ${
                selected ? 'text-[var(--primary-color)]' : 'text-[var(--ui-text)]'
              }`}
            >
              {t(theme.name)}
            </span>
          </div>
          {selected && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--primary-color)] text-[var(--ui-on-accent)] text-[10px] shadow-xs shrink-0">
              <FiCheck />
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-4 text-[var(--ui-text-subtle)] line-clamp-2">
          {t(theme.description)}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              title="Edit Theme"
              className="p-1.5 text-gray-700 hover:text-[var(--primary-color)] rounded-md hover:bg-gray-100 transition-colors"
            >
              <FiEdit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              title="Delete Theme"
              className="p-1.5 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
            >
              <FiTrash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const ThemeGallery: React.FC<ThemeGalleryProps> = ({
  value,
  onChange,
  customThemes = [],
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {customThemes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiLayers className="text-[var(--primary-color)]" size={14} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ui-text-muted)]">
              Custom Themes ({customThemes.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {customThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={theme.id === value}
                onSelect={() => onChange(theme.id)}
                onEdit={onEdit ? () => onEdit(theme) : undefined}
                onDelete={onDelete ? () => onDelete(theme) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ui-text-muted)]">
            Designed Presets ({THEME_LIST.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_LIST.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={theme.id === value}
              onSelect={() => onChange(theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ThemeGallery
