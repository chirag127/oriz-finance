/*
 * The full catalogue — 28 calculators across 4 ledgers. The slug is the URL
 * path under /calculators/<slug>/. `live` flips to true when the calculator
 * page is wired up. Today only `sip` is live; the rest hit the stub page.
 *
 * The brief structure is tight on purpose so the leader-dotted TOC reads
 * like a printed index: name on the left, brief on the right, dotted leader
 * filling the gap.
 */
export interface Calculator {
  slug: string
  name: string
  brief: string
  ledger: 'investments' | 'loans' | 'banking' | 'tax'
  live: boolean
}

export const LEDGERS = [
  { key: 'investments', label: 'Investments' },
  { key: 'loans', label: 'Loans & EMI' },
  { key: 'banking', label: 'Banking & savings' },
  { key: 'tax', label: 'Tax & salary' },
] as const

export const CALCULATORS: Calculator[] = [
  // Investments — 7
  {
    slug: 'sip',
    name: 'SIP',
    brief: 'Future value of a monthly SIP',
    ledger: 'investments',
    live: true,
  },
  {
    slug: 'lumpsum',
    name: 'Lumpsum',
    brief: 'One-time investment compounded',
    ledger: 'investments',
    live: false,
  },
  {
    slug: 'step-up-sip',
    name: 'Step-up SIP',
    brief: 'SIP with annual % escalation',
    ledger: 'investments',
    live: false,
  },
  {
    slug: 'swp',
    name: 'SWP',
    brief: 'Systematic withdrawal — corpus depletion',
    ledger: 'investments',
    live: false,
  },
  {
    slug: 'cagr',
    name: 'CAGR / XIRR',
    brief: 'Annualised return on irregular flows',
    ledger: 'investments',
    live: false,
  },
  {
    slug: 'goal-planner',
    name: 'Goal planner',
    brief: 'Monthly SIP needed to reach a target',
    ledger: 'investments',
    live: false,
  },
  {
    slug: 'fire',
    name: 'FIRE',
    brief: 'Years to financial independence',
    ledger: 'investments',
    live: false,
  },

  // Loans & EMI — 6
  {
    slug: 'home-loan-emi',
    name: 'Home loan EMI',
    brief: 'Amortising EMI + total interest',
    ledger: 'loans',
    live: false,
  },
  {
    slug: 'car-loan',
    name: 'Car loan',
    brief: 'EMI on auto financing',
    ledger: 'loans',
    live: false,
  },
  {
    slug: 'personal-loan',
    name: 'Personal loan',
    brief: 'EMI on unsecured borrowing',
    ledger: 'loans',
    live: false,
  },
  {
    slug: 'prepayment-impact',
    name: 'Prepayment impact',
    brief: 'Interest saved by part-payments',
    ledger: 'loans',
    live: false,
  },
  {
    slug: 'loan-comparison',
    name: 'Loan comparison',
    brief: 'Two loans, side-by-side cost',
    ledger: 'loans',
    live: false,
  },
  {
    slug: 'eligibility-foir',
    name: 'Eligibility / FOIR',
    brief: 'Max loan from income + obligations',
    ledger: 'loans',
    live: false,
  },

  // Banking & savings — 8
  {
    slug: 'fd',
    name: 'FD',
    brief: 'Fixed deposit maturity + interest',
    ledger: 'banking',
    live: false,
  },
  { slug: 'rd', name: 'RD', brief: 'Recurring deposit maturity', ledger: 'banking', live: false },
  {
    slug: 'ppf',
    name: 'PPF',
    brief: '15-year PPF corpus + interest',
    ledger: 'banking',
    live: false,
  },
  {
    slug: 'nps',
    name: 'NPS',
    brief: 'Tier-I corpus, annuity, lump-sum',
    ledger: 'banking',
    live: false,
  },
  {
    slug: 'nsc',
    name: 'NSC',
    brief: 'National Savings Certificate maturity',
    ledger: 'banking',
    live: false,
  },
  {
    slug: 'ssy',
    name: 'SSY',
    brief: 'Sukanya Samriddhi Yojana corpus',
    ledger: 'banking',
    live: false,
  },
  {
    slug: 'compound-interest',
    name: 'Compound interest',
    brief: 'Generic compounding at any cadence',
    ledger: 'banking',
    live: false,
  },
  {
    slug: 'savings-goal',
    name: 'Savings goal',
    brief: 'Months to save a target amount',
    ledger: 'banking',
    live: false,
  },

  // Tax & salary — 7
  {
    slug: 'take-home',
    name: 'Take-home (CTC → in-hand)',
    brief: 'Annual CTC to monthly take-home',
    ledger: 'tax',
    live: false,
  },
  { slug: 'tds', name: 'TDS', brief: 'TDS on salary by regime + slab', ledger: 'tax', live: false },
  {
    slug: 'hra',
    name: 'HRA exemption',
    brief: 'Section 10(13A) exempt portion',
    ledger: 'tax',
    live: false,
  },
  {
    slug: 'gratuity',
    name: 'Gratuity',
    brief: 'Payable on 5+ years of service',
    ledger: 'tax',
    live: false,
  },
  {
    slug: 'leave-encashment',
    name: 'Leave encashment',
    brief: 'On retirement / resignation',
    ledger: 'tax',
    live: false,
  },
  {
    slug: 'gst',
    name: 'GST',
    brief: 'Inclusive / exclusive GST split',
    ledger: 'tax',
    live: false,
  },
  {
    slug: 'income-tax',
    name: 'Income tax',
    brief: 'Old regime vs new regime liability',
    ledger: 'tax',
    live: false,
  },
]

export function calculatorsByLedger(ledger: Calculator['ledger']): Calculator[] {
  return CALCULATORS.filter((c) => c.ledger === ledger)
}

export function getCalculator(slug: string): Calculator | undefined {
  return CALCULATORS.find((c) => c.slug === slug)
}
