/*
 * InlineSIPCalculator — the small live calculator that sits on the home
 * page. Three inputs (monthly amount, return %, years) → one big result
 * line in JetBrains Mono with a leader-dotted leader to the rupee value.
 *
 * The "hero" of the page. Updates on every keystroke. No submit button,
 * no scroll. Proves the site works without leaving the surface.
 */
import { type ChangeEvent, useMemo, useState } from 'react'
import { calculateSIP } from '~/lib/finmath'
import { formatINR } from '~/lib/format'

const DEFAULTS = { monthly: 10_000, rate: 12, years: 15 }

export default function InlineSIPCalculator() {
  const [monthly, setMonthly] = useState(DEFAULTS.monthly)
  const [rate, setRate] = useState(DEFAULTS.rate)
  const [years, setYears] = useState(DEFAULTS.years)

  const result = useMemo(() => calculateSIP(monthly, rate, years), [monthly, rate, years])

  const onNumber =
    (set: (n: number) => void, fallback: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      set(Number.isFinite(v) && v >= 0 ? v : fallback)
    }

  return (
    <div className="isip">
      <div className="isip-inputs">
        <label className="isip-field">
          <span className="isip-label mono">Monthly investment (₹)</span>
          <input
            className="num isip-input"
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            value={monthly}
            onChange={onNumber(setMonthly, 0)}
            aria-label="Monthly investment in rupees"
          />
        </label>
        <label className="isip-field">
          <span className="isip-label mono">Expected return (% p.a.)</span>
          <input
            className="num isip-input"
            type="number"
            inputMode="decimal"
            min={0}
            max={40}
            step={0.5}
            value={rate}
            onChange={onNumber(setRate, 0)}
            aria-label="Expected annual return percent"
          />
        </label>
        <label className="isip-field">
          <span className="isip-label mono">Tenure (years)</span>
          <input
            className="num isip-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            value={years}
            onChange={onNumber(setYears, 1)}
            aria-label="Tenure in years"
          />
        </label>
      </div>

      {/*
        The result line is the hero. Mono tabular nums for the digits, the
        rupee glyph stays in Source Sans 3 sized 0.9em so the seam is
        invisible. Leader-dotted line connects label to value — finance's
        signature, mid-sentence.
      */}
      <div className="isip-result">
        <div className="toc-row isip-toc">
          <span className="toc-name isip-name">Final corpus</span>
          <span className="toc-value isip-value">
            <span className="rupee" aria-hidden="true">
              ₹
            </span>
            <span className="num">{formatINR(result.totalValue)}</span>
          </span>
        </div>
        <div className="toc-row isip-toc isip-toc-sub">
          <span className="toc-name isip-name-sub">Invested</span>
          <span className="toc-value isip-value-sub">
            <span className="rupee" aria-hidden="true">
              ₹
            </span>
            <span className="num">{formatINR(result.investedAmount)}</span>
          </span>
        </div>
        <div className="toc-row isip-toc isip-toc-sub">
          <span className="toc-name isip-name-sub">Wealth gained</span>
          <span className="toc-value isip-value-sub">
            <span className="rupee" aria-hidden="true">
              ₹
            </span>
            <span className="num">{formatINR(result.wealthGained)}</span>
          </span>
        </div>
        <p className="isip-caption mono">
          {years} y &middot; {rate.toFixed(1)}% p.a. &middot; monthly compounding
        </p>
        <p className="isip-link">
          <a href="/calculators/sip/">Open the full SIP calculator with year-by-year ledger →</a>
        </p>
      </div>

      <style>{`
        .isip {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 1.5rem;
          background: color-mix(in oklab, var(--paper) 92%, transparent);
          border: 1px solid var(--rule);
        }
        @media (min-width: 760px) {
          .isip {
            grid-template-columns: 1fr 1.4fr;
            gap: 2rem;
          }
        }
        .isip-inputs {
          display: grid;
          gap: 1rem;
          align-content: start;
        }
        .isip-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .isip-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--ink-mute);
        }
        .isip-input {
          height: 44px;
          padding: 0 0.875rem;
          background: var(--paper);
          border: 1px solid var(--rule);
          color: var(--ink);
          font-size: 18px;
          text-align: right;
          font-feature-settings: 'tnum' 1, 'zero' 1, 'calt' 0;
        }
        .isip-input:focus {
          outline: 2px solid var(--accent);
          outline-offset: -1px;
          border-color: var(--accent);
        }

        .isip-result {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .isip-toc {
          font-size: 18px;
          line-height: 1.45;
          align-items: baseline;
        }
        .isip-name {
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--ink);
          font-size: 18px;
        }
        .isip-value {
          color: var(--accent);
          font-size: 32px;
          font-weight: 500;
        }
        @media (min-width: 760px) {
          .isip-value { font-size: 40px; }
        }
        .isip-toc-sub .isip-name-sub {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--ink-mute);
        }
        .isip-toc-sub .isip-value-sub {
          color: var(--ink);
          font-size: 16px;
        }
        .isip-caption {
          margin: 0.75rem 0 0;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }
        .isip-link {
          margin: 0.75rem 0 0;
          font-size: 14px;
        }
        .isip-link a {
          color: var(--accent);
          text-decoration: underline;
          text-decoration-color: color-mix(in oklab, var(--accent) 50%, transparent);
          text-underline-offset: 3px;
        }
        .isip-link a:hover {
          text-decoration-color: var(--accent);
        }
      `}</style>
    </div>
  )
}
