/*
 * Local vendored copy of @chirag127/oriz-family FAMILY_SITES.
 *
 * Why local: the @chirag127/oriz-family package is workspace-only (a
 * file:../oriz-family dep of the @chirag127/oriz-ui v2.0.0 shim) and can't
 * be resolved when oriz-ui is consumed via a GitHub tarball. Until
 * oriz-family ships to npm, every site keeps its own copy. Replace with:
 *   export { FAMILY_SITES, FAMILY, type FamilySite } from '@chirag127/oriz-family'
 *
 * Last synced: 2026-06-19 from chirag127/oriz-family@e90446e.
 */

export const FAMILY = {
  brand: 'oriz',
  rootOrigin: 'https://oriz.in',
  authDomain: 'auth.oriz.in',
  firebaseProjectId: 'oriz-app',
  operator: {
    name: 'Chirag Singhal',
    email: 'whyiswhen@gmail.com',
    address: 'Bhubaneswar, Odisha, India 751001',
    githubHandle: 'chirag127',
  },
  jurisdiction: { country: 'India', state: 'Odisha', city: 'Bhubaneswar' },
  legalUpdated: '2026-06-19',
} as const

export interface FamilySite {
  slug: string
  name: string
  url: string
  tagline: string
  emoji: string
  category: 'reading' | 'tools' | 'finance' | 'personal'
}

export const FAMILY_SITES: FamilySite[] = [
  {
    slug: 'home',
    name: 'oriz',
    url: 'https://oriz.in',
    tagline: 'The hub for the oriz family',
    emoji: '🏠',
    category: 'personal',
  },
  {
    slug: 'me',
    name: 'Me',
    url: 'https://me.oriz.in',
    tagline: 'Chirag Singhal — daily-rebuilt digital identity datasheet',
    emoji: '👤',
    category: 'personal',
  },
  {
    slug: 'blog',
    name: 'Blog',
    url: 'https://blog.oriz.in',
    tagline: 'Long-form writing on engineering, finance, and books',
    emoji: '✍️',
    category: 'reading',
  },
  {
    slug: 'books',
    name: 'Books',
    url: 'https://books.oriz.in',
    tagline: 'NCERT textbook directory + client-side PDF merger',
    emoji: '📚',
    category: 'reading',
  },
  {
    slug: 'book-lore',
    name: 'Book Lore',
    url: 'https://book-lore.oriz.in',
    tagline: '461 book summaries — overview, content, analysis, narration',
    emoji: '📖',
    category: 'reading',
  },
  {
    slug: 'cards',
    name: 'Cards',
    url: 'https://cards.oriz.in',
    tagline: '750 India card profiles — credit, debit, prepaid',
    emoji: '💳',
    category: 'finance',
  },
  {
    slug: 'finance',
    name: 'Finance',
    url: 'https://finance.oriz.in',
    tagline: 'SIP, EMI, FIRE, tax — calculators that show the math',
    emoji: '📊',
    category: 'finance',
  },
  {
    slug: 'journal',
    name: 'Journal',
    url: 'https://journal.oriz.in',
    tagline: 'Encrypted private journaling — the seal stays sealed',
    emoji: '📓',
    category: 'personal',
  },
  {
    slug: 'image-tools',
    name: 'Image tools',
    url: 'https://image-tools.oriz.in',
    tagline: 'Browser-only image conversion, compression, and metadata tools',
    emoji: '🖼️',
    category: 'tools',
  },
  {
    slug: 'pdf-tools',
    name: 'PDF tools',
    url: 'https://pdf-tools.oriz.in',
    tagline: 'Browser-only PDF merge, split, compress, redact',
    emoji: '📄',
    category: 'tools',
  },
  {
    slug: 'urls-to-md',
    name: 'URLs → Markdown',
    url: 'https://urls-to-md.oriz.in',
    tagline: 'The site is a .md file — extract any URL to Markdown',
    emoji: '🔗',
    category: 'tools',
  },
]
