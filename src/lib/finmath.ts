/**
 * Pure SIP math — extracted from the legacy FinSuite engine and trimmed to
 * what the new island actually uses. No DOM dependencies, safe to test in
 * isolation. The formula is the standard SIP future-value formula:
 *
 *     FV = P * ((1 + r)^n - 1) / r * (1 + r)
 *
 * where P = monthly investment, r = monthly rate (annualRate / 12 / 100),
 * n = months. This treats SIPs as paid at the START of each month (annuity-due).
 */

export interface SIPYear {
  year: number
  invested: number
  value: number
  gains: number
}

export interface SIPResult {
  investedAmount: number
  totalValue: number
  wealthGained: number
  yearlyBreakdown: SIPYear[]
}

export function calculateSIP(
  monthlyInvestment: number,
  annualRate: number,
  years: number,
): SIPResult {
  const monthlyRate = annualRate / 12 / 100
  const months = years * 12

  const fv = (n: number) =>
    monthlyRate === 0
      ? monthlyInvestment * n
      : monthlyInvestment * (((1 + monthlyRate) ** n - 1) / monthlyRate) * (1 + monthlyRate)

  const yearlyBreakdown: SIPYear[] = []
  for (let year = 1; year <= years; year++) {
    const n = year * 12
    const invested = monthlyInvestment * n
    const value = fv(n)
    yearlyBreakdown.push({
      year,
      invested: Math.round(invested),
      value: Math.round(value),
      gains: Math.round(value - invested),
    })
  }

  const investedAmount = monthlyInvestment * months
  const totalValue = fv(months)
  return {
    investedAmount: Math.round(investedAmount),
    totalValue: Math.round(totalValue),
    wealthGained: Math.round(totalValue - investedAmount),
    yearlyBreakdown,
  }
}

/**
 * Standard amortizing-loan EMI:  EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * P = principal, r = monthly rate, n = months.
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  years: number,
): {
  emi: number
  totalInterest: number
  totalPayment: number
} {
  const r = annualRate / 12 / 100
  const n = years * 12
  if (r === 0) {
    const emi = principal / n
    return { emi, totalInterest: 0, totalPayment: principal }
  }
  const pow = (1 + r) ** n
  const emi = (principal * r * pow) / (pow - 1)
  const totalPayment = emi * n
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalPayment - principal),
    totalPayment: Math.round(totalPayment),
  }
}

/** Indian-style currency formatter (lakhs/crores) — emits "₹12,34,567".
 *  For separated-glyph rendering (rupee in Source Sans 3, digits in JetBrains
 *  Mono) use `splitINR` from `~/lib/format` instead. */
export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)
}
