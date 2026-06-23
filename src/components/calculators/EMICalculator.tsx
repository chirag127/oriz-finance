/*
 * EMI Calculator — /calculators/home-loan-emi/ /calculators/car-loan/ /calculators/personal-loan/
 * Principal + rate + tenure → EMI + amortization table (first 12 rows shown, expandable)
 */
import { type ChangeEvent, useMemo, useState } from 'react'
import { calculateEMIFull } from '~/lib/finmath'
import { formatINR, formatINRCompact } from '~/lib/format'

const KEY = 'oriz:finance:emi'
const DEFAULTS = { principal: 2_000_000, rate: 8.5, years: 20, label: 'Home loan EMI' }

export default function EMICalculator({ label = DEFAULTS.label }: { label?: string }) {
  const [principal, setPrincipal] = useState(DEFAULTS.principal)
  const [rate, setRate] = useState(DEFAULTS.rate)
  const [years, setYears] = useState(DEFAULTS.years)
  const [showAll, setShowAll] = useState(false)

  const result = useMemo(() => calculateEMIFull(principal, rate, years), [principal, rate, years])

  // Build pie chart: principal vs interest
  const total = result.totalPayment
  const principalAngle = total > 0 ? (principal / total) * 360 : 0
  const interestAngle = 360 - principalAngle

  function arc(startAngle: number, angle: number, r = 80, cx = 100, cy = 100) {
    const start = ((startAngle - 90) * Math.PI) / 180
    const end = ((startAngle + angle - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    const largeArc = angle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  const rows = showAll ? result.amortization : result.amortization.slice(0, 12)

  return (
    <div className="emifull">
      <div className="emifull-slab">
        {/* Inputs */}
        <section className="emifull-col" aria-label="Inputs">
          <h2 className="emifull-h mono">Inputs</h2>
          <Field label="Principal (₹)" value={principal} min={0} max={100_000_000} step={10000}
            onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
            onSlide={setPrincipal} sliderMin={100_000} sliderMax={10_000_000} />
          <Field label="Annual interest rate (%)" value={rate} min={0} max={36} step={0.1}
            onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
            onSlide={setRate} sliderMin={5} sliderMax={24} />
          <Field label="Tenure (years)" value={years} min={1} max={30} step={1}
            onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
            onSlide={setYears} sliderMin={1} sliderMax={30} />
        </section>

        {/* Result */}
        <section className="emifull-col" aria-label="Result">
          <h2 className="emifull-h mono">Monthly EMI</h2>
          <div className="emifull-hero">
            <span className="rupee">₹</span>
            <span className="num emifull-hero-num">{formatINR(result.emi)}</span>
          </div>
          <p className="emifull-caption mono">{years}y · {rate}% · {formatINRCompact(principal)} principal</p>
          <div className="emifull-trio mono">
            <div><span className="trio-label">Principal</span><span className="num">₹{formatINR(principal)}</span></div>
            <div><span className="trio-label">Total interest</span><span className="num accent">₹{formatINR(result.totalInterest)}</span></div>
            <div><span className="trio-label">Total payment</span><span className="num">₹{formatINR(result.totalPayment)}</span></div>
          </div>
          {/* Pie chart */}
          <div className="emifull-pie">
            <svg viewBox="0 0 200 200" aria-label="Principal vs Interest pie chart">
              <path d={arc(0, principalAngle)} fill="var(--accent)" opacity="0.85" />
              <path d={arc(principalAngle, interestAngle)} fill="var(--ink-mute)" opacity="0.4" />
            </svg>
            <div className="pie-legend mono">
              <span className="pie-dot" style={{ background: 'var(--accent)' }} /> Principal
              <span className="pie-dot" style={{ background: 'var(--ink-mute)', opacity: 0.5 }} /> Interest
            </div>
          </div>
        </section>

        {/* Formula */}
        <section className="emifull-col" aria-label="Formula">
          <h2 className="emifull-h mono">Formula</h2>
          <pre className="emifull-pre mono">EMI = P × r × (1+r)^n / ((1+r)^n − 1)</pre>
          <h3 className="emifull-sub mono">Where</h3>
          <ul className="emifull-asm">
            <li><span className="num">P</span> = principal loan amount</li>
            <li><span className="num">r</span> = monthly rate = annual rate ÷ 12 ÷ 100</li>
            <li><span className="num">n</span> = tenure in months</li>
          </ul>
        </section>
      </div>

      {/* Amortization table */}
      <section aria-label="Amortization schedule">
        <h2 className="emifull-h mono emifull-h-table">Amortization schedule</h2>
        <div className="emifull-table-scroll">
          <table className="emifull-table">
            <thead><tr><th>Month</th><th>Opening</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Closing</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month}>
                  <td className="num">{row.month}</td>
                  <td className="num">{formatINR(row.opening)}</td>
                  <td className="num">{formatINR(row.emi)}</td>
                  <td className="num">{formatINR(row.principal)}</td>
                  <td className="num">{formatINR(row.interest)}</td>
                  <td className="num">{formatINR(row.closing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.amortization.length > 12 && (
          <button className="show-more mono" onClick={() => setShowAll((v) => !v)}>
            {showAll ? '▲ show less' : `▼ show all ${result.amortization.length} months`}
          </button>
        )}
      </section>

      <style>{`
        .emifull { display: grid; gap: 2.5rem; }
        .emifull-slab { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        @media (min-width: 960px) { .emifull-slab { grid-template-columns: repeat(3, 1fr); gap: 2.5rem; } }
        .emifull-col { padding-bottom: 1.5rem; border-bottom: 1px solid var(--rule); }
        @media (min-width: 960px) { .emifull-col { border-bottom: 0; } .emifull-col + .emifull-col { border-left: 1px solid var(--rule); padding-left: 2rem; } }
        .emifull-h { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-mute); font-weight: 500; margin: 0 0 1rem; }
        .emifull-sub { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-mute); font-weight: 500; margin: 1.5rem 0 0.5rem; }
        .emifull-hero { display: flex; align-items: baseline; color: var(--accent); }
        .emifull-hero-num { font-size: clamp(36px,6vw,56px); font-weight: 500; letter-spacing: -0.01em; }
        .emifull-hero .rupee { font-size: clamp(28px,5vw,48px); }
        .emifull-caption { margin: 0.75rem 0 1rem; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-mute); font-family: var(--font-mono); }
        .emifull-trio { display: flex; flex-direction: column; gap: 0.5rem; font-size: 13px; }
        .emifull-trio > div { display: flex; justify-content: space-between; border-bottom: 1px dotted var(--rule); padding: 0.25rem 0; }
        .trio-label { color: var(--ink-mute); }
        .accent { color: var(--accent); }
        .emifull-pie { display: flex; flex-direction: column; align-items: center; margin-top: 1.25rem; }
        .emifull-pie svg { width: 120px; height: 120px; }
        .pie-legend { display: flex; gap: 1rem; font-size: 11px; margin-top: 0.5rem; color: var(--ink-mute); align-items: center; text-transform: uppercase; letter-spacing: 0.1em; }
        .pie-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
        .emifull-pre { margin: 0; padding: 0.875rem 1rem; background: color-mix(in oklab, var(--rule) 25%, transparent); border: 1px solid var(--rule); font-size: 13px; color: var(--ink); white-space: pre-wrap; }
        .emifull-asm { list-style: none; padding: 0; margin: 0; color: var(--ink-mute); font-size: 13px; line-height: 1.55; display: flex; flex-direction: column; gap: 0.5rem; }
        .emifull-asm li { padding-left: 1rem; position: relative; }
        .emifull-asm li::before { content: '·'; position: absolute; left: 0.25rem; color: var(--rule); }
        .emifull-h-table { margin-bottom: 0.75rem; }
        .emifull-table-scroll { overflow-x: auto; }
        .emifull-table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: var(--font-mono); font-feature-settings: 'tnum' 1,'zero' 1,'calt' 0; }
        .emifull-table thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-mute); font-weight: 500; padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--rule); text-align: right; }
        .emifull-table thead th:first-child { text-align: left; }
        .emifull-table tbody td { padding: 0.5rem 0.75rem; text-align: right; color: var(--ink); }
        .emifull-table tbody td:first-child { text-align: left; color: var(--ink-mute); }
        .emifull-table tbody tr:nth-child(odd) td { background: color-mix(in oklab, var(--rule) 8%, transparent); }
        .show-more { margin-top: 0.75rem; background: transparent; border: 1px solid var(--rule); padding: 0.375rem 0.875rem; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: lowercase; color: var(--ink-mute); cursor: pointer; }
        .show-more:hover { color: var(--accent); border-color: var(--accent); }
      `}</style>
    </div>
  )
}

interface FieldProps {
  label: string; value: number; min: number; max: number; step: number
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSlide: (v: number) => void; sliderMin: number; sliderMax: number
}
function Field({ label, value, min, max, step, onChange, onSlide, sliderMin, sliderMax }: FieldProps) {
  return (
    <label className="sipf-field">
      <span className="sipf-label mono">{label}</span>
      <input className="num sipf-input" type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={onChange} />
      <input className="sipf-slider" type="range" min={sliderMin} max={sliderMax} step={step} value={value} onChange={(e) => onSlide(Number(e.target.value))} aria-label={`${label} slider`} />
      <style>{`.sipf-field{display:flex;flex-direction:column;gap:.375rem;margin-bottom:1.25rem}.sipf-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute);font-family:var(--font-mono)}.sipf-input{height:44px;padding:0 .875rem;background:var(--paper);border:1px solid var(--rule);color:var(--ink);font-size:18px;text-align:right;font-family:var(--font-mono);font-feature-settings:'tnum' 1,'zero' 1,'calt' 0}.sipf-input:focus{outline:2px solid var(--accent);outline-offset:-1px;border-color:var(--accent)}.sipf-slider{accent-color:var(--accent);width:100%}`}</style>
    </label>
  )
}
