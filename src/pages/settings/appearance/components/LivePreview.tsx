import React, { useState } from 'react'
import { useAppearanceLanguage } from '../appearance-language'
import { FiCheck, FiShoppingBag, FiCreditCard } from 'react-icons/fi'

type PreviewTab = 'form' | 'table' | 'actions' | 'dialog'

const TABS: { id: PreviewTab; label: string }[] = [
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
  const [tab, setTab] = useState<PreviewTab>('form')
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
            <p className="text-[11px] text-[var(--ui-text-subtle)]">Real-time reactive components</p>
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
                {t('Confirm order #BB-9042?')}
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
