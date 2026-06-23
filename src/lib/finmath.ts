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

// ─── EMI amortization table ────────────────────────────────────────────────

export interface EMIRow {
  month: number
  opening: number
  emi: number
  principal: number
  interest: number
  closing: number
}

export interface EMIResult {
  emi: number
  totalInterest: number
  totalPayment: number
  amortization: EMIRow[]
}

export function calculateEMIFull(
  principal: number,
  annualRate: number,
  years: number,
): EMIResult {
  const r = annualRate / 12 / 100
  const n = years * 12
  if (r === 0) {
    const emi = principal / n
    const amortization: EMIRow[] = Array.from({ length: n }, (_, i) => ({
      month: i + 1,
      opening: Math.round(principal - emi * i),
      emi: Math.round(emi),
      principal: Math.round(emi),
      interest: 0,
      closing: Math.round(principal - emi * (i + 1)),
    }))
    return { emi: Math.round(emi), totalInterest: 0, totalPayment: Math.round(principal), amortization }
  }
  const pow = (1 + r) ** n
  const emi = (principal * r * pow) / (pow - 1)
  let balance = principal
  const amortization: EMIRow[] = []
  for (let i = 1; i <= n; i++) {
    const interest = balance * r
    const principalPart = emi - interest
    const opening = balance
    balance = balance - principalPart
    amortization.push({
      month: i,
      opening: Math.round(opening),
      emi: Math.round(emi),
      principal: Math.round(principalPart),
      interest: Math.round(interest),
      closing: Math.max(0, Math.round(balance)),
    })
  }
  const totalPayment = emi * n
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalPayment - principal),
    totalPayment: Math.round(totalPayment),
    amortization,
  }
}

// ─── FIRE calculator ────────────────────────────────────────────────────────

export interface FIREResult {
  yearsToFire: number
  corpusNeeded: number
  projectedCorpus: number
  currentAge: number
  fireAge: number
  yearlyData: { year: number; corpus: number; needed: number }[]
}

export function calculateFIRE(
  currentSavings: number,
  monthlySavings: number,
  annualExpenses: number,
  withdrawalRate: number, // % e.g. 4
  expectedReturn: number, // % p.a.
  currentAge: number,
): FIREResult {
  const r = expectedReturn / 100
  const corpusNeeded = (annualExpenses / (withdrawalRate / 100))
  const monthlyRate = r / 12
  const yearlyData: { year: number; corpus: number; needed: number }[] = []

  let corpus = currentSavings
  let yearsToFire = 0
  for (let y = 1; y <= 50; y++) {
    // grow existing corpus + SIP for the year
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyRate) + monthlySavings
    }
    yearlyData.push({ year: y, corpus: Math.round(corpus), needed: Math.round(corpusNeeded) })
    if (corpus >= corpusNeeded && yearsToFire === 0) {
      yearsToFire = y
    }
  }

  return {
    yearsToFire: yearsToFire || 50,
    corpusNeeded: Math.round(corpusNeeded),
    projectedCorpus: Math.round(corpus),
    currentAge,
    fireAge: currentAge + (yearsToFire || 50),
    yearlyData,
  }
}

// ─── Lumpsum calculator ─────────────────────────────────────────────────────

export interface LumpsumResult {
  maturityValue: number
  wealthGained: number
  yearlyData: { year: number; value: number }[]
}

export function calculateLumpsum(
  principal: number,
  annualRate: number,
  years: number,
): LumpsumResult {
  const r = annualRate / 100
  const yearlyData: { year: number; value: number }[] = []
  for (let y = 1; y <= years; y++) {
    yearlyData.push({ year: y, value: Math.round(principal * (1 + r) ** y) })
  }
  const maturityValue = Math.round(principal * (1 + r) ** years)
  return { maturityValue, wealthGained: Math.round(maturityValue - principal), yearlyData }
}

// ─── PPF calculator ─────────────────────────────────────────────────────────

export interface PPFResult {
  maturityValue: number
  totalDeposited: number
  totalInterest: number
  yearlyData: { year: number; balance: number; interest: number }[]
}

export function calculatePPF(
  annualDeposit: number,
  years: number,
  rate = 7.1, // current PPF rate %
): PPFResult {
  const r = rate / 100
  let balance = 0
  const yearlyData: { year: number; balance: number; interest: number }[] = []
  for (let y = 1; y <= years; y++) {
    balance += annualDeposit
    const interest = Math.round(balance * r)
    balance += interest
    yearlyData.push({ year: y, balance: Math.round(balance), interest })
  }
  const totalDeposited = annualDeposit * years
  return {
    maturityValue: Math.round(balance),
    totalDeposited,
    totalInterest: Math.round(balance - totalDeposited),
    yearlyData,
  }
}

// ─── NPS calculator ─────────────────────────────────────────────────────────

export interface NPSResult {
  totalCorpus: number
  lumpSumOnMaturity: number   // 60% — tax free
  annuityCorpus: number       // 40% — used for annuity
  monthlyPension: number      // estimated at 6% annuity rate
  totalInvested: number
  totalGains: number
  yearlyData: { year: number; corpus: number }[]
}

export function calculateNPS(
  monthlyContribution: number,
  currentAge: number,
  retirementAge: number,
  expectedReturn: number, // % p.a.
  annuityRate = 6,         // % p.a.
): NPSResult {
  const years = retirementAge - currentAge
  const r = expectedReturn / 12 / 100
  const n = years * 12
  const fv =
    r === 0
      ? monthlyContribution * n
      : monthlyContribution * (((1 + r) ** n - 1) / r) * (1 + r)

  const totalInvested = monthlyContribution * n
  const lumpSumOnMaturity = Math.round(fv * 0.6)
  const annuityCorpus = Math.round(fv * 0.4)
  const monthlyPension = Math.round((annuityCorpus * annuityRate) / 100 / 12)

  const yearlyData: { year: number; corpus: number }[] = []
  for (let y = 1; y <= years; y++) {
    const months = y * 12
    const v = r === 0 ? monthlyContribution * months : monthlyContribution * (((1 + r) ** months - 1) / r) * (1 + r)
    yearlyData.push({ year: y, corpus: Math.round(v) })
  }

  return {
    totalCorpus: Math.round(fv),
    lumpSumOnMaturity,
    annuityCorpus,
    monthlyPension,
    totalInvested: Math.round(totalInvested),
    totalGains: Math.round(fv - totalInvested),
    yearlyData,
  }
}

// ─── Income Tax FY 2025-26 ─────────────────────────────────────────────────

export interface TaxResult {
  oldRegimeTax: number
  newRegimeTax: number
  oldRegimeEffectiveRate: number
  newRegimeEffectiveRate: number
  recommendation: 'old' | 'new'
  savings: number
  oldRegimeBreakdown: { slab: string; tax: number }[]
  newRegimeBreakdown: { slab: string; tax: number }[]
}

function applySlabs(income: number, slabs: { upto: number; rate: number }[]): { total: number; breakdown: { slab: string; tax: number }[] } {
  let remaining = income
  let total = 0
  const breakdown: { slab: string; tax: number }[] = []
  let prev = 0
  for (const slab of slabs) {
    if (remaining <= 0) break
    const taxable = Math.min(remaining, slab.upto - prev)
    const tax = taxable * slab.rate
    if (slab.rate > 0 && taxable > 0) {
      breakdown.push({ slab: `${formatINR(prev + 1)} – ${slab.upto === Infinity ? '∞' : formatINR(slab.upto)} @ ${slab.rate * 100}%`, tax: Math.round(tax) })
    }
    total += tax
    remaining -= taxable
    prev = slab.upto
    if (slab.upto === Infinity) break
  }
  return { total, breakdown }
}

export function calculateIncomeTax(
  grossIncome: number,
  deductions80C = 0,
  hra = 0,
  otherDeductions = 0,
): TaxResult {
  const stdDeductionOld = 50_000
  const stdDeductionNew = 75_000

  // Old regime taxable income
  const oldTaxable = Math.max(0, grossIncome - stdDeductionOld - Math.min(deductions80C, 150_000) - hra - otherDeductions)

  // New regime taxable income
  const newTaxable = Math.max(0, grossIncome - stdDeductionNew)

  // Old regime slabs (FY 2025-26)
  const oldSlabs = [
    { upto: 250_000, rate: 0 },
    { upto: 500_000, rate: 0.05 },
    { upto: 1_000_000, rate: 0.20 },
    { upto: Infinity, rate: 0.30 },
  ]

  // New regime slabs (FY 2025-26)
  const newSlabs = [
    { upto: 400_000, rate: 0 },
    { upto: 800_000, rate: 0.05 },
    { upto: 1_200_000, rate: 0.10 },
    { upto: 1_600_000, rate: 0.15 },
    { upto: 2_000_000, rate: 0.20 },
    { upto: 2_400_000, rate: 0.25 },
    { upto: Infinity, rate: 0.30 },
  ]

  const oldResult = applySlabs(oldTaxable, oldSlabs)
  const newResult = applySlabs(newTaxable, newSlabs)

  // Rebate u/s 87A: old regime ≤ 5L → full rebate; new regime ≤ 12L → full rebate (FY 2025-26)
  let oldTax = oldResult.total
  let newTax = newResult.total
  if (oldTaxable <= 500_000) oldTax = 0
  if (newTaxable <= 1_200_000) newTax = 0

  // Add 4% cess
  oldTax = Math.round(oldTax * 1.04)
  newTax = Math.round(newTax * 1.04)

  const oldRate = grossIncome > 0 ? (oldTax / grossIncome) * 100 : 0
  const newRate = grossIncome > 0 ? (newTax / grossIncome) * 100 : 0

  return {
    oldRegimeTax: Math.round(oldTax),
    newRegimeTax: Math.round(newTax),
    oldRegimeEffectiveRate: Math.round(oldRate * 100) / 100,
    newRegimeEffectiveRate: Math.round(newRate * 100) / 100,
    recommendation: newTax <= oldTax ? 'new' : 'old',
    savings: Math.abs(Math.round(oldTax - newTax)),
    oldRegimeBreakdown: oldResult.breakdown,
    newRegimeBreakdown: newResult.breakdown,
  }
}

// ─── Compound interest calculator ──────────────────────────────────────────

export type CompoundFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily'

export interface CompoundResult {
  maturityValue: number
  totalInterest: number
  yearlyData: { year: number; value: number }[]
}

export function calculateCompound(
  principal: number,
  annualRate: number,
  years: number,
  frequency: CompoundFrequency,
): CompoundResult {
  const freqMap: Record<CompoundFrequency, number> = {
    annually: 1,
    'semi-annually': 2,
    quarterly: 4,
    monthly: 12,
    daily: 365,
  }
  const n = freqMap[frequency]
  const r = annualRate / 100
  const yearlyData: { year: number; value: number }[] = []
  for (let y = 1; y <= years; y++) {
    yearlyData.push({ year: y, value: Math.round(principal * (1 + r / n) ** (n * y)) })
  }
  const maturityValue = Math.round(principal * (1 + r / n) ** (n * years))
  return {
    maturityValue,
    totalInterest: Math.round(maturityValue - principal),
    yearlyData,
  }
}

// ─── Gold loan eligibility ─────────────────────────────────────────────────

export interface GoldLoanResult {
  marketValue: number
  maxLoan: number
  ltvPercent: number
}

// Gold purity conversion: 24K = 99.9% pure; 22K ≈ 91.6%; 18K ≈ 75%
const GOLD_PURITY: Record<string, number> = {
  '24K': 0.999,
  '22K': 0.916,
  '18K': 0.750,
  '14K': 0.585,
}

export function calculateGoldLoan(
  grams: number,
  purity: string,
  goldPricePerGram: number, // current market price per gram (24K)
  ltvPercent: number,       // LTV % e.g. 75
): GoldLoanResult {
  const purityFactor = GOLD_PURITY[purity] ?? 0.916
  const marketValue = Math.round(grams * purityFactor * goldPricePerGram)
  const maxLoan = Math.round(marketValue * (ltvPercent / 100))
  return { marketValue, maxLoan, ltvPercent }
}

// ─── XIRR via Newton-Raphson ────────────────────────────────────────────────

export interface XIRRResult {
  xirr: number // annualized return as %
  absoluteReturn: number
  totalInvested: number
  finalValue: number
}

/** Calculate XIRR using Newton-Raphson iteration.
 *  cashflows: array of {amount (negative = outflow), date (JS Date)}
 *  The last cashflow should be positive (redemption value).
 */
export function calculateXIRR(
  cashflows: { amount: number; date: Date }[],
): number {
  if (cashflows.length < 2) return 0
  const guess = 0.1
  const maxIter = 100
  const tol = 1e-7
  const dates = cashflows.map((cf) => cf.date.getTime())
  const amounts = cashflows.map((cf) => cf.amount)
  const d0 = dates[0]

  function npv(rate: number): number {
    return amounts.reduce((sum, amount, i) => {
      const t = (dates[i] - d0) / (365.25 * 24 * 3600 * 1000)
      return sum + amount / (1 + rate) ** t
    }, 0)
  }

  function dnpv(rate: number): number {
    return amounts.reduce((sum, amount, i) => {
      const t = (dates[i] - d0) / (365.25 * 24 * 3600 * 1000)
      return sum - (t * amount) / (1 + rate) ** (t + 1)
    }, 0)
  }

  let rate = guess
  for (let i = 0; i < maxIter; i++) {
    const f = npv(rate)
    const df = dnpv(rate)
    if (Math.abs(df) < 1e-10) break
    const newRate = rate - f / df
    if (Math.abs(newRate - rate) < tol) return newRate
    rate = newRate
  }
  return rate
}

/** Build XIRR cashflows from regular SIP + current value */
export function calculateSIPXIRR(
  monthlyAmount: number,
  months: number,
  currentValue: number,
  startDate: Date,
): XIRRResult {
  const cashflows: { amount: number; date: Date }[] = []
  for (let i = 0; i < months; i++) {
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + i)
    cashflows.push({ amount: -monthlyAmount, date: d })
  }
  // Final redemption
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)
  cashflows.push({ amount: currentValue, date: endDate })

  const rate = calculateXIRR(cashflows)
  const totalInvested = monthlyAmount * months
  return {
    xirr: Math.round(rate * 10000) / 100, // as %
    absoluteReturn: Math.round(((currentValue - totalInvested) / totalInvested) * 10000) / 100,
    totalInvested,
    finalValue: currentValue,
  }
}
