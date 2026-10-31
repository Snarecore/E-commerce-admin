import React, { useState } from 'react'
import { useAppearanceLanguage } from '../appearance-language'
import {
  FiCheck,
  FiShoppingBag,
  FiCreditCard,
  FiStar,
  FiSearch,
  FiHeart,
  FiTag,
  FiShield,
  FiRotateCcw,
  FiTruck,
} from 'react-icons/fi'

type PreviewTab = 'storefront' | 'form' | 'table' | 'actions' | 'dialog'

const TABS: { id: PreviewTab; label: string }[] = [
  { id: 'storefront', label: 'Storefront' },
  { id: 'form', label: 'Form' },
  { id: 'table', label: 'Table' },
  { id: 'actions', label: 'Buttons' },
  { id: 'dialog', label: 'Dialog' },
]

const ROWS = [
  ['ORD-8921', 'Anika Rahman', 'Cotton Kurti (M)', 'Paid', '৳ 3,450.00'],
  ['ORD-8922', 'Tanvir Hossain', 'Denim Jacket (XL)', 'Due', '৳ 5,800.00'],
  ['ORD-8923', 'Farhana Islam', 'Silk Saree (Red)', 'Partial', '৳ 14,200.00'],
]

export const LivePreview: React.FC = () => {
  const { t } = useAppearanceLanguage()
  const [tab, setTab] = useState<PreviewTab>('storefront')
  const [text, setText] = useState('Anika Rahman')
  const [amount, setAmount] = useState('3,450.00')

  return (
    <div className="ui-card p-5 sm:p-6 shadow-sm border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--ui-border)]/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[var(--primary-color-light)] text-[var(--primary-color)]">
            <FiShoppingBag size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--ui-text)]">{t('Live preview')}</h3>
            <p className="text-[11px] text-[var(--ui-text-subtle)]">
              {tab === 'storefront'
                ? t('Real-time customer storefront preview')
                : 'Real-time reactive components'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div
        className="mt-4 flex gap-1 p-1 bg-[var(--ui-surface-sunken)] border border-[var(--ui-border)]/80 rounded-xl"
        role="tablist"
      >
        {TABS.map((tabOption) => (
          <button
            key={tabOption.id}
            type="button"
            role="tab"
            aria-selected={tab === tabOption.id}
            onClick={() => setTab(tabOption.id)}
            className={`flex-1 cursor-pointer py-1.5 text-xs font-bold transition-all text-center rounded-lg ${
              tab === tabOption.id
                ? 'bg-[var(--primary-color)] text-[var(--ui-on-accent)] shadow-xs'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-surface)]/60'
            }`}
          >
            {t(tabOption.label)}
          </button>
        ))}
      </div>

      {/* ---------------- Storefront preview ---------------- */}
      {tab === 'storefront' && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 shadow-xs">
          {/* Top Announcement Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--primary-color-light)] text-[var(--primary-color)] text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 truncate">
              <FiTag size={12} className="shrink-0" />
              <span className="truncate">{t('Special Eid Collection 2026 - Flat 20% Off | Code: EID26')}</span>
            </div>
            <span className="shrink-0 text-[10px] font-bold underline cursor-pointer ml-1">
              Shop
            </span>
          </div>

          {/* Storefront Mini Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--ui-border)]/60">
            <div className="flex items-center gap-1.5">
              <span className="h-6 w-6 rounded-md bg-[var(--primary-color)] text-[var(--ui-on-accent)] flex items-center justify-center font-black text-xs shadow-xs">
                FT
              </span>
              <span className="font-extrabold text-xs tracking-tight text-[var(--ui-text)]">
                Fashion<span className="text-[var(--primary-color)]">Time</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--ui-surface-sunken)] border border-[var(--ui-border)]/60 text-[10px] text-[var(--ui-text-muted)]">
                <FiSearch size={10} />
                <span>{t('Search sarees, panjabis...')}</span>
              </div>
              <div className="relative p-1.5 rounded-md hover:bg-[var(--ui-surface-sunken)] cursor-pointer text-[var(--ui-text)]">
                <FiShoppingBag size={14} />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[var(--primary-color)] text-[var(--ui-on-accent)] text-[9px] font-black flex items-center justify-center">
                  2
                </span>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['All', 'Panjabi', 'Kurti', 'Saree', 'Kids'].map((cat, i) => (
              <span
                key={cat}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors shrink-0 ${
                  i === 0
                    ? 'bg-[var(--primary-color)] text-[var(--ui-on-accent)] shadow-2xs'
                    : 'bg-[var(--ui-surface-sunken)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
                }`}
              >
                {t(cat)}
              </span>
            ))}
          </div>

          {/* Storefront Products Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Product Card 1 */}
            <div className="group rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2 transition-all hover:shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative h-24 sm:h-28 rounded-lg bg-gradient-to-br from-[var(--primary-color-light)] via-[var(--ui-surface-sunken)] to-[var(--ui-surface)] flex items-center justify-center overflow-hidden border border-[var(--ui-border)]/40">
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[var(--primary-color)] text-[var(--ui-on-accent)]">
                    {t('BESTSELLER')}
                  </span>
                  <button
                    type="button"
                    aria-label="Wishlist"
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[var(--ui-surface)]/80 text-[var(--ui-text-muted)] hover:text-rose-500 shadow-2xs transition-colors"
                  >
                    <FiHeart size={11} />
                  </button>
                  <div className="text-center p-2">
                    <span className="text-2xl">🥻</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                    <FiStar size={10} className="fill-current" />
                    <span className="font-bold text-[var(--ui-text)]">4.9</span>
                    <span className="text-[9px] text-[var(--ui-text-muted)]">(128)</span>
                  </div>
                  <h4 className="mt-0.5 text-[11px] font-bold text-[var(--ui-text)] line-clamp-1">
                    {t('Embroidered Georgette Saree')}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-[var(--primary-color)]">৳ 4,250</span>
                    <span className="text-[10px] text-[var(--ui-text-muted)] line-through">৳ 5,500</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--primary-color)] text-[var(--ui-on-accent)] text-[10px] font-bold shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                <FiShoppingBag size={11} />
                <span>{t('Add to Bag')}</span>
              </button>
            </div>

            {/* Product Card 2 */}
            <div className="group rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2 transition-all hover:shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative h-24 sm:h-28 rounded-lg bg-gradient-to-br from-[var(--primary-color-light)] via-[var(--ui-surface-sunken)] to-[var(--ui-surface)] flex items-center justify-center overflow-hidden border border-[var(--ui-border)]/40">
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-rose-500 text-white">
                    {t('-20% OFF')}
                  </span>
                  <button
                    type="button"
                    aria-label="Wishlist"
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[var(--ui-surface)]/80 text-[var(--ui-text-muted)] hover:text-rose-500 shadow-2xs transition-colors"
                  >
                    <FiHeart size={11} />
                  </button>
                  <div className="text-center p-2">
                    <span className="text-2xl">👔</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                    <FiStar size={10} className="fill-current" />
                    <span className="font-bold text-[var(--ui-text)]">4.8</span>
                    <span className="text-[9px] text-[var(--ui-text-muted)]">(94)</span>
                  </div>
                  <h4 className="mt-0.5 text-[11px] font-bold text-[var(--ui-text)] line-clamp-1">
                    {t('Royal Semi-Silk Panjabi')}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-[var(--primary-color)]">৳ 2,900</span>
                    <span className="text-[10px] text-[var(--ui-text-muted)] line-through">৳ 3,600</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--primary-color)] text-[var(--ui-on-accent)] text-[10px] font-bold shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                <FiShoppingBag size={11} />
                <span>{t('Add to Bag')}</span>
              </button>
            </div>
          </div>

          {/* Storefront Trust Badges */}
          <div className="mt-1 pt-2 border-t border-[var(--ui-border)]/60 grid grid-cols-3 gap-1 text-center text-[9px] text-[var(--ui-text-muted)] font-medium">
            <div className="flex flex-col items-center gap-0.5">
              <FiTruck size={12} className="text-[var(--primary-color)]" />
              <span className="leading-tight">{t('Free Delivery ৳ 1,500+')}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <FiRotateCcw size={12} className="text-[var(--primary-color)]" />
              <span className="leading-tight">{t('7 Days Return')}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <FiShield size={12} className="text-[var(--primary-color)]" />
              <span className="leading-tight">{t('100% Original')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Form preview ---------------- */}
      {tab === 'form' && (
        <div className="mt-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="ui-field">
              <label htmlFor="pv-name" className="ui-label">
                {t('Customer name')}
              </label>
              <input
                id="pv-name"
                className="ui-control"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="ui-field">
              <label htmlFor="pv-amount" className="ui-label ui-label-required">
                {t('Invoice amount')}
              </label>
              <input
                id="pv-amount"
                className="ui-control text-right font-medium"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="ui-field">
              <label htmlFor="pv-type" className="ui-label">
                {t('Payment method')}
              </label>
              <select id="pv-type" className="ui-control ui-select" defaultValue="mobile">
                <option value="cash">{t('Cash')}</option>
                <option value="bank">{t('Bank transfer')}</option>
                <option value="mobile">{t('Mobile banking')}</option>
              </select>
            </div>

            <div className="ui-field">
              <label htmlFor="pv-disabled" className="ui-label">
                {t('Reference (read-only)')}
              </label>
              <input id="pv-disabled" className="ui-control" defaultValue="SKU-8921-COTTON" readOnly />
            </div>
          </div>

          <div className="ui-field">
            <label htmlFor="pv-error" className="ui-label ui-label-required">
              {t('Discount')}
            </label>
            <input id="pv-error" className="ui-control is-invalid" defaultValue="-100" />
            <p className="ui-error mt-0.5">{t('Discount cannot be negative')}</p>
          </div>

          <div className="ui-field">
            <label htmlFor="pv-note" className="ui-label">
              {t('Note')}
            </label>
            <textarea
              id="pv-note"
              className="ui-control ui-control-multiline text-xs"
              rows={2}
              placeholder={t('Order details...')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2.5 mt-2 border-t border-[var(--ui-border)]/60">
            <button
              type="button"
              className="ui-btn ui-btn-secondary px-3.5 py-1.5 text-xs rounded-lg"
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-lg shadow-xs"
            >
              <FiCheck size={13} />
              <span>{t('Save')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Table preview ---------------- */}
      {tab === 'table' && (
        <div className="mt-4 overflow-hidden border border-[var(--ui-border)] rounded-xl bg-[var(--ui-surface)]">
          <table className="ui-table w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2.5 px-3">{t('Invoice')}</th>
                <th className="py-2.5 px-3">{t('Customer')}</th>
                <th className="py-2.5 px-3">{t('Status')}</th>
                <th className="py-2.5 px-3 text-right">{t('Amount')}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([inv, cust, , status, amt]) => (
                <tr key={inv} className="border-b border-[var(--ui-border)] last:border-b-0">
                  <td className="font-mono text-xs font-semibold text-[var(--primary-color)] py-2.5 px-3">
                    {inv}
                  </td>
                  <td className="font-medium text-[var(--ui-text)] text-xs py-2.5 px-3">{cust}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full inline-block"
                      style={{
                        backgroundColor:
                          status === 'Paid'
                            ? 'var(--ui-success-light)'
                            : status === 'Due'
                              ? 'var(--ui-danger-light)'
                              : 'var(--ui-warning-light)',
                        color:
                          status === 'Paid'
                            ? 'var(--ui-success)'
                            : status === 'Due'
                              ? 'var(--ui-danger)'
                              : 'var(--ui-warning)',
                      }}
                    >
                      {t(status)}
                    </span>
                  </td>
                  <td className="text-right font-semibold text-[var(--ui-text)] text-xs py-2.5 px-3">
                    {amt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- Actions preview ---------------- */}
      {tab === 'actions' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-lg w-full">
            {t('Primary Button')}
          </button>
          <button type="button" className="ui-btn ui-btn-secondary px-3.5 py-1.5 text-xs rounded-lg w-full">
            {t('Secondary Button')}
          </button>
          <button type="button" className="ui-btn ui-btn-subtle px-3.5 py-1.5 text-xs rounded-lg w-full">
            {t('Subtle Button')}
          </button>
          <button type="button" className="ui-btn ui-btn-ghost px-3.5 py-1.5 text-xs rounded-lg w-full">
            {t('Ghost Button')}
          </button>
          <button type="button" className="ui-btn ui-btn-danger px-3.5 py-1.5 text-xs rounded-lg w-full col-span-2">
            {t('Danger Button')}
          </button>
        </div>
      )}

      {/* ---------------- Dialog preview ---------------- */}
      {tab === 'dialog' && (
        <div className="mt-4 ui-modal-panel p-4 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-xl shadow-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--ui-border)]">
            <div className="flex items-center gap-2">
              <FiCreditCard className="text-[var(--primary-color)]" />
              <h4 className="text-sm font-bold text-[var(--ui-text)]">
                {t('Confirm order #FT-9042?')}
              </h4>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-[var(--ui-text-muted)]">
            {t(
              'This order will be moved to the packing and dispatch queue. Customer will be notified via SMS.'
            )}
          </p>
          <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-[var(--ui-border)]/50">
            <button type="button" className="ui-btn ui-btn-ghost px-3.5 py-1.5 text-xs rounded-lg">
              {t('Cancel order')}
            </button>
            <button type="button" className="ui-btn ui-btn-primary px-3.5 py-1.5 text-xs rounded-lg">
              {t('Confirm and Dispatch')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LivePreview
