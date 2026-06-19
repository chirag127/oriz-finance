/*
 * Indian numeric formatters — non-negotiable per the brief.
 *
 * `Intl.NumberFormat('en-IN')` gives lakhs/crores grouping
 *   1234567   →  "12,34,567"      (not "1,234,567")
 *   123456789 →  "12,34,56,789"
 *
 * We never call these on the SERVER (`new Intl` differs in formatting on
 * older Node / environments) — they're invoked from React islands client-
 * side and from Astro pages at build time, which is the same V8.
 */

export function formatINR(n: number, opts: { withRupee?: boolean } = {}): string {
  const fixed = Number.isFinite(n) ? n : 0
  const out = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(fixed))
  return opts.withRupee ? `₹${out}` : out
}

/** Render a JSX-friendly tuple {rupee, digits} so the rupee glyph can be
 *  set 0.1em smaller in Source Sans 3 while the digits stay JetBrains Mono. */
export function splitINR(n: number): { rupee: string; digits: string } {
  return { rupee: '₹', digits: formatINR(n) }
}

/** Plain Indian-style number, no rupee glyph. */
export function formatIndianNumber(n: number, frac = 0): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: frac,
    minimumFractionDigits: frac,
  }).format(Number.isFinite(n) ? n : 0)
}

/** Compact Indian-style notation — "12.34 L", "1.23 Cr" — for display only. */
export function formatINRCompact(n: number): string {
  const v = Math.abs(n)
  if (v >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)} Cr`
  if (v >= 1_00_000) return `${(n / 1_00_000).toFixed(2)} L`
  if (v >= 1_000) return `${(n / 1_000).toFixed(1)} K`
  return formatIndianNumber(n)
}
