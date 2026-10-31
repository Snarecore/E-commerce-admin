import type { ScaleOption } from '../../../../theme'
import { useAppearanceTranslation } from '../appearance-language'
import { FiCheck } from 'react-icons/fi'

interface OptionCardsProps<T extends string> {
  legend: string
  description?: string
  options: ScaleOption<T>[]
  value: T
  onChange: (value: T) => void
  isInherited?: boolean
  columns?: 2 | 3 | 4
}

export function OptionCards<T extends string>({
  legend,
  description,
  options,
  value,
  onChange,
  isInherited = false,
  columns = 3,
}: OptionCardsProps<T>) {
  const t = useAppearanceTranslation()
  const gridCols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-3'

  return (
    <fieldset className="border-0 p-0 m-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ui-text)]">
          {legend}
          {isInherited && (
            <span className="rounded-full bg-[var(--ui-surface-sunken)] border border-[var(--ui-border)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--ui-text-subtle)]">
              {t('From theme')}
            </span>
          )}
        </legend>
      </div>
      {description && <p className="text-[12px] text-[var(--ui-text-muted)] mb-2.5">{description}</p>}

      <div className={`grid grid-cols-1 gap-2.5 ${gridCols}`}>
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={`cursor-pointer border p-3 rounded-xl text-left transition-all duration-150 relative group ${
                selected
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)] shadow-xs ring-1 ring-[var(--primary-color)]'
                  : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:border-[var(--ui-border-strong)] hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`block text-[13px] font-bold ${
                    selected ? 'text-[var(--primary-color)]' : 'text-[var(--ui-text)]'
                  }`}
                >
                  {t(option.label)}
                </span>
                {selected && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--primary-color)] text-[var(--ui-on-accent)] text-[10px] shrink-0">
                    <FiCheck />
                  </span>
                )}
              </div>
              <span className="mt-1 block text-[11px] leading-relaxed text-[var(--ui-text-subtle)]">
                {t(option.hint)}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default OptionCards
