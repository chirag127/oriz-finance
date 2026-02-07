/**
 * FinSuite OS - Router
 * Virtual router for 40+ app routes with SEO
 */

import { updateSEO, type SEOConfig } from './seo';

export interface Route {
  path: string;
  title: string;
  icon: string;
  component: () => Promise<HTMLElement>;
  drive: 'wealth' | 'banking' | 'market' | 'news' | 'util' | 'system' | 'loans' | 'invest' | 'tax' | 'salary' | 'gen';
  seo: SEOConfig;
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
}

// Route definitions for all 40+ apps with SEO
export const routes: Route[] = [
  // ========== DRIVE A: WEALTH (10 Apps) ==========
  {
    path: '/apps/wealth/sip', title: 'SIP Calculator', icon: '📈',
    component: () => import('@/apps/wealth/SIPCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'SIP Calculator - Calculate Mutual Fund Returns', description: 'Free SIP calculator to plan your systematic investment plan. Calculate expected returns, wealth gained, and visualize growth with interactive charts. Best SIP calculator India 2024.', keywords: ['SIP calculator', 'mutual fund calculator', 'SIP returns', 'systematic investment plan', 'India', 'free'] }
  },
  {
    path: '/apps/wealth/lumpsum', title: 'Lumpsum Calculator', icon: '💰',
    component: () => import('@/apps/wealth/LumpsumCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'Lumpsum Investment Calculator', description: 'Calculate returns on one-time lumpsum investments. Compare with SIP and visualize compound growth over time.', keywords: ['lumpsum calculator', 'one-time investment', 'compound interest', 'mutual fund'] }
  },
  {
    path: '/apps/wealth/step-up', title: 'Step-Up SIP', icon: '📊',
    component: () => import('@/apps/wealth/StepUpCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'Step-Up SIP Calculator - Annual Increment SIP', description: 'Plan your step-up SIP with annual increments. See how increasing your SIP every year can significantly boost your corpus.', keywords: ['step-up SIP', 'annual increment SIP', 'SIP with increase', 'top-up SIP'] }
  },
  {
    path: '/apps/wealth/fire', title: 'FIRE Calculator', icon: '🔥',
    component: () => import('@/apps/wealth/FIRECalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'FIRE Calculator - Financial Independence Retire Early', description: 'Calculate your FIRE number. Find out how much you need to retire early and achieve financial independence.', keywords: ['FIRE calculator', 'financial independence', 'retire early', 'early retirement', 'FIRE number'] }
  },
  {
    path: '/apps/wealth/cagr', title: 'CAGR Calculator', icon: '📉',
    component: () => import('@/apps/wealth/CAGRCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'CAGR Calculator - Compound Annual Growth Rate', description: 'Calculate CAGR to measure the annual growth rate of your investments. Compare performance of stocks, mutual funds.', keywords: ['CAGR calculator', 'compound annual growth rate', 'investment growth', 'returns'] }
  },
  {
    path: '/apps/wealth/swp', title: 'SWP Planner', icon: '💸',
    component: () => import('@/apps/wealth/SWPCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'SWP Calculator - Systematic Withdrawal Plan', description: 'Plan your systematic withdrawal plan for retirement income. Calculate monthly withdrawals from your mutual fund corpus.', keywords: ['SWP calculator', 'systematic withdrawal plan', 'retirement income', 'mutual fund withdrawal'] }
  },
  {
    path: '/apps/wealth/goal', title: 'Goal Planner', icon: '🎯',
    component: () => import('@/apps/wealth/GoalCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'Financial Goal Planner', description: 'Plan for your financial goals - home, car, education, wedding. Calculate how much you need to invest monthly.', keywords: ['goal planner', 'financial goals', 'investment planning', 'savings calculator'] }
  },
  {
    path: '/apps/wealth/tax', title: 'Income Tax', icon: '🧾',
    component: () => import('@/apps/wealth/TaxCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'Income Tax Calculator India 2024-25 - Old vs New Regime', description: 'Calculate your income tax under old and new tax regime. Compare which regime saves more tax based on your deductions.', keywords: ['income tax calculator', 'India', 'old vs new regime', 'tax calculator 2024', 'ITR'] }
  },
  {
    path: '/apps/wealth/hra', title: 'HRA Calculator', icon: '🏠',
    component: () => import('@/apps/wealth/HRACalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'HRA Exemption Calculator', description: 'Calculate HRA exemption for income tax. Find out the maximum HRA you can claim based on rent, salary and city.', keywords: ['HRA calculator', 'HRA exemption', 'house rent allowance', 'tax saving'] }
  },
  {
    path: '/apps/wealth/gst', title: 'GST Calculator', icon: '🏛️',
    component: () => import('@/apps/wealth/GSTCalculator').then(m => m.render()), drive: 'wealth',
    seo: { title: 'GST Calculator - Add or Remove GST', description: 'Calculate GST on any amount. Add GST to base price or extract GST from inclusive price. Supports all GST slabs.', keywords: ['GST calculator', 'goods and services tax', 'GST India', 'tax calculator'] }
  },

  // ========== DRIVE B: BANKING (8 Apps) ==========
  {
    path: '/apps/banking/emi-home', title: 'Home Loan EMI', icon: '🏠',
    component: () => import('@/apps/banking/HomeLoanCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'Home Loan EMI Calculator India', description: 'Calculate home loan EMI with amortization schedule. Compare different loan amounts, tenures and interest rates.', keywords: ['home loan EMI', 'housing loan calculator', 'mortgage calculator', 'India'] }
  },
  {
    path: '/apps/banking/emi-car', title: 'Car Loan EMI', icon: '🚗',
    component: () => import('@/apps/banking/CarLoanCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'Car Loan EMI Calculator', description: 'Calculate car loan EMI instantly. Plan your auto loan with detailed payment breakup and amortization.', keywords: ['car loan EMI', 'auto loan calculator', 'vehicle loan', 'EMI calculator'] }
  },
  {
    path: '/apps/banking/fd', title: 'FD Calculator', icon: '🏦',
    component: () => import('@/apps/banking/FDCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'FD Calculator - Fixed Deposit Maturity', description: 'Calculate fixed deposit maturity amount and interest earned. Compare simple and compound interest.', keywords: ['FD calculator', 'fixed deposit', 'maturity calculator', 'bank FD'] }
  },
  {
    path: '/apps/banking/rd', title: 'RD Calculator', icon: '📅',
    component: () => import('@/apps/banking/RDCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'RD Calculator - Recurring Deposit', description: 'Calculate recurring deposit maturity amount. Plan your monthly savings with RD interest calculation.', keywords: ['RD calculator', 'recurring deposit', 'monthly savings', 'RD interest'] }
  },
  {
    path: '/apps/banking/ppf', title: 'PPF Calculator', icon: '🏛️',
    component: () => import('@/apps/banking/PPFCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'PPF Calculator - Public Provident Fund', description: 'Calculate PPF maturity with year-wise breakdown. Plan your 15-year PPF investment and tax savings.', keywords: ['PPF calculator', 'public provident fund', 'PPF interest rate', 'tax saving'] }
  },
  {
    path: '/apps/banking/ssy', title: 'SSY Calculator', icon: '👧',
    component: () => import('@/apps/banking/SSYCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'Sukanya Samriddhi Yojana Calculator', description: 'Calculate SSY maturity for girl child. Plan education and marriage with SSY returns and tax benefits.', keywords: ['SSY calculator', 'Sukanya Samriddhi', 'girl child scheme', 'tax saving'] }
  },
  {
    path: '/apps/banking/nps', title: 'NPS Calculator', icon: '👴',
    component: () => import('@/apps/banking/NPSCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'NPS Calculator - National Pension System', description: 'Calculate NPS pension and lump sum. Plan your retirement with NPS contributions and expected returns.', keywords: ['NPS calculator', 'national pension system', 'retirement planning', 'pension'] }
  },
  {
    path: '/apps/banking/inflation', title: 'Inflation Calculator', icon: '📈',
    component: () => import('@/apps/banking/InflationCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'Inflation Calculator - Future Value of Money', description: 'Calculate the impact of inflation on your money. Find future value and purchasing power over time.', keywords: ['inflation calculator', 'future value', 'purchasing power', 'cost of living'] }
  },
  {
    path: '/apps/banking/p2p', title: 'P2P Lending Calculator', icon: '🤝',
    component: () => import('@/apps/banking/P2PLendingCalculator').then(m => m.render()), drive: 'banking',
    seo: { title: 'P2P Lending Calculator - Peer to Peer Investment Returns', description: 'Calculate P2P lending returns with simple interest. Includes RBI caps, platform fees, TDS deductions for peer-to-peer investments.', keywords: ['P2P lending', 'peer to peer lending', 'P2P calculator', 'simple interest', 'RBI P2P'] }
  },

  // ========== DRIVE: LOANS (6 Apps) ==========
  {
    path: '/apps/loans/personal', title: 'Personal Loan Calculator', icon: '💳',
    component: () => import('@/apps/loans/PersonalLoanCalculator').then(m => m.render()), drive: 'loans',
    seo: { title: 'Personal Loan Calculator - Flat vs Reducing Rate', description: 'Compare flat rate and reducing balance personal loans. Calculate EMI, total interest, and find the better option.', keywords: ['personal loan calculator', 'flat vs reducing', 'EMI calculator', 'loan comparison'] }
  },
  {
    path: '/apps/loans/education', title: 'Education Loan Calculator', icon: '🎓',
    component: () => import('@/apps/loans/EducationLoanCalculator').then(m => m.render()), drive: 'loans',
    seo: { title: 'Education Loan Calculator with Moratorium', description: 'Calculate education loan EMI with moratorium period. See how interest accrues during course and repayment options.', keywords: ['education loan', 'student loan', 'moratorium', 'study loan India'] }
  },
  {
    path: '/apps/loans/compare', title: 'Loan Comparison', icon: '⚖️',
    component: () => import('@/apps/loans/LoanComparisonTool').then(m => m.render()), drive: 'loans',
    seo: { title: 'Loan Comparison Tool - Compare Two Loans', description: 'Compare two loan offers side by side. Find the cheaper option based on EMI, total interest, and tenure.', keywords: ['loan comparison', 'compare loans', 'best loan offer', 'EMI comparison'] }
  },
  {
    path: '/apps/loans/prepayment', title: 'Prepayment Calculator', icon: '💸',
    component: () => import('@/apps/loans/PrepaymentCalculator').then(m => m.render()), drive: 'loans',
    seo: { title: 'Loan Prepayment Calculator - Save Interest', description: 'Calculate savings from prepaying your loan. See how extra payments reduce tenure and interest.', keywords: ['prepayment calculator', 'part payment', 'loan foreclosure', 'save interest'] }
  },
  {
    path: '/apps/loans/eligibility', title: 'Loan Eligibility', icon: '✅',
    component: () => import('@/apps/loans/LoanEligibilityCalculator').then(m => m.render()), drive: 'loans',
    seo: { title: 'Loan Eligibility Calculator - FOIR Based', description: 'Check your loan eligibility based on income and existing EMIs. Calculate maximum loan amount.', keywords: ['loan eligibility', 'FOIR', 'income to EMI ratio', 'maximum loan'] }
  },
  {
    path: '/apps/loans/moratorium', title: 'Moratorium Calculator', icon: '⏸️',
    component: () => import('@/apps/loans/MoratoriumCalculator').then(m => m.render()), drive: 'loans',
    seo: { title: 'Loan Moratorium Calculator - EMI Deferral Cost', description: 'Calculate the true cost of EMI moratorium. See how deferring payments increases your total loan burden.', keywords: ['moratorium calculator', 'EMI deferral', 'COVID moratorium', 'loan extension'] }
  },

  // ========== DRIVE: INVEST (2 Apps) ==========
  {
    path: '/apps/invest/nsc', title: 'NSC Calculator', icon: '🏛️',
    component: () => import('@/apps/invest/NSCCalculator').then(m => m.render()), drive: 'invest',
    seo: { title: 'NSC Calculator - National Savings Certificate', description: 'Calculate NSC maturity value with year-wise breakdown. 5-year tax saving investment with compounding interest.', keywords: ['NSC calculator', 'national savings certificate', 'tax saving', 'Section 80C'] }
  },
  {
    path: '/apps/invest/xirr', title: 'XIRR Calculator', icon: '📊',
    component: () => import('@/apps/invest/XIRRCalculator').then(m => m.render()), drive: 'invest',
    seo: { title: 'XIRR Calculator - Returns on Irregular Cash Flows', description: 'Calculate XIRR for investments with irregular cash flows. Better than CAGR for SIP and multiple investments.', keywords: ['XIRR calculator', 'irregular returns', 'SIP returns', 'mutual fund XIRR'] }
  },

  // ========== DRIVE: TAX (1 App) ==========
  {
    path: '/apps/tax/tds', title: 'TDS Calculator', icon: '📋',
    component: () => import('@/apps/tax/TDSCalculator').then(m => m.render()), drive: 'tax',
    seo: { title: 'TDS Calculator - Tax Deducted at Source', description: 'Calculate TDS on salary, interest, rent, and professional fees. Know applicable TDS rates by section.', keywords: ['TDS calculator', 'tax deducted at source', 'TDS rates', 'Section 194'] }
  },

  // ========== DRIVE: SALARY (3 Apps) ==========
  {
    path: '/apps/salary/take-home', title: 'Take-Home Calculator', icon: '💼',
    component: () => import('@/apps/salary/TakeHomeCalculator').then(m => m.render()), drive: 'salary',
    seo: { title: 'Take-Home Salary Calculator - CTC to In-Hand', description: 'Calculate in-hand salary from CTC. See full breakdown of Basic, HRA, PF, Tax, and net take-home pay.', keywords: ['take home calculator', 'CTC to in-hand', 'salary calculator', 'net salary'] }
  },
  {
    path: '/apps/salary/gratuity', title: 'Gratuity Calculator', icon: '🎁',
    component: () => import('@/apps/salary/GratuityCalculator').then(m => m.render()), drive: 'salary',
    seo: { title: 'Gratuity Calculator - End of Service Benefit', description: 'Calculate gratuity amount based on last salary and years of service. Know tax exemption limits.', keywords: ['gratuity calculator', 'end of service', 'retirement benefit', 'gratuity tax'] }
  },
  {
    path: '/apps/salary/leave-encashment', title: 'Leave Encashment', icon: '🏖️',
    component: () => import('@/apps/salary/LeaveEncashmentCalculator').then(m => m.render()), drive: 'salary',
    seo: { title: 'Leave Encashment Calculator', description: 'Calculate payment for unused leaves. Know tax treatment on retirement vs during service.', keywords: ['leave encashment', 'unused leave payment', 'leave salary', 'leave tax'] }
  },

  // ========== DRIVE: GENERAL (4 Apps) ==========
  {
    path: '/apps/gen/purchasing-power', title: 'Purchasing Power', icon: '📉',
    component: () => import('@/apps/gen/PurchasingPowerCalculator').then(m => m.render()), drive: 'gen',
    seo: { title: 'Purchasing Power Calculator - Inflation Impact', description: 'See how inflation erodes your money. Calculate future and past value adjusted for inflation.', keywords: ['purchasing power', 'inflation calculator', 'future value', 'money value'] }
  },
  {
    path: '/apps/gen/rule-of-72', title: 'Rule of 72', icon: '📐',
    component: () => import('@/apps/gen/RuleOf72Calculator').then(m => m.render()), drive: 'gen',
    seo: { title: 'Rule of 72 Calculator - Money Doubling Time', description: 'Quick mental math to find how long it takes to double your money. See wealth multiplication timeline.', keywords: ['rule of 72', 'doubling time', 'compound interest', 'investment growth'] }
  },
  {
    path: '/apps/gen/simple-interest', title: 'Simple Interest', icon: '📊',
    component: () => import('@/apps/gen/SimpleInterestCalculator').then(m => m.render()), drive: 'gen',
    seo: { title: 'Simple Interest Calculator', description: 'Calculate simple interest on any principal amount. Compare with compound interest.', keywords: ['simple interest', 'SI calculator', 'interest calculation', 'loan interest'] }
  },
  {
    path: '/apps/gen/compound-interest', title: 'Compound Interest', icon: '📈',
    component: () => import('@/apps/gen/CompoundInterestCalculator').then(m => m.render()), drive: 'gen',
    seo: { title: 'Compound Interest Calculator - Multiple Frequencies', description: 'Calculate compound interest with different compounding frequencies. See the power of compounding.', keywords: ['compound interest', 'CI calculator', 'compounding frequency', 'interest on interest'] }
  },

  // ========== DRIVE C: MARKETS (6 Apps) ==========
  {
    path: '/apps/market/crypto', title: 'Crypto Dashboard', icon: '₿',
    component: () => import('@/apps/market/CryptoDashboard').then(m => m.render()), drive: 'market',
    seo: { title: 'Crypto Dashboard - Live Cryptocurrency Prices', description: 'Track live cryptocurrency prices. View top 50 cryptocurrencies with real-time data from CoinGecko.', keywords: ['crypto dashboard', 'cryptocurrency prices', 'Bitcoin', 'live crypto'] }
  },
  {
    path: '/apps/market/converter', title: 'Currency Converter', icon: '💱',
    component: () => import('@/apps/market/CurrencyConverter').then(m => m.render()), drive: 'market',
    seo: { title: 'Currency Converter - Live Exchange Rates', description: 'Convert currencies with live exchange rates. Support for USD, EUR, INR, GBP and 30+ currencies.', keywords: ['currency converter', 'exchange rate', 'forex', 'USD to INR'] }
  },
  {
    path: '/apps/market/sentiment', title: 'Market Sentiment', icon: '📊',
    component: () => import('@/apps/market/SentimentDashboard').then(m => m.render()), drive: 'market',
    seo: { title: 'Market Sentiment - Reddit WSB Tracker', description: 'Track stock sentiment from WallStreetBets and Reddit. See trending stocks and investor sentiment.', keywords: ['market sentiment', 'WSB', 'WallStreetBets', 'stock sentiment', 'Reddit'] }
  },
  {
    path: '/apps/market/bitcoin', title: 'Satoshi Converter', icon: '⚡',
    component: () => import('@/apps/market/SatoshiConverter').then(m => m.render()), drive: 'market',
    seo: { title: 'Satoshi to INR Converter', description: 'Convert Satoshis to Indian Rupees. Calculate Bitcoin fractions with live BTC price.', keywords: ['Satoshi converter', 'Bitcoin calculator', 'Sats to INR', 'crypto'] }
  },
  {
    path: '/apps/market/gold', title: 'Gold Tracker', icon: '🥇',
    component: () => import('@/apps/market/GoldTracker').then(m => m.render()), drive: 'market',
    seo: { title: 'Gold Price Today - Live Gold Rate', description: 'Track live gold prices in India. View 22K/24K gold rates per gram and calculate gold value.', keywords: ['gold price', 'gold rate today', 'gold price India', '24 karat gold'] }
  },
  {
    path: '/apps/market/watchlist', title: 'Watchlist', icon: '👀',
    component: () => import('@/apps/market/Watchlist').then(m => m.render()), drive: 'market',
    seo: { title: 'Crypto Watchlist - Track Your Favorites', description: 'Create your crypto watchlist. Track favorite cryptocurrencies synced to your cloud account.', keywords: ['crypto watchlist', 'track crypto', 'favorites', 'portfolio'] }
  },

  // ========== DRIVE D: NEWS (5 Apps) ==========
  {
    path: '/apps/news/tech', title: 'Tech News', icon: '💻',
    component: () => import('@/apps/news/TechNews').then(m => m.render()), drive: 'news',
    seo: { title: 'Tech News - HackerNews Top Stories', description: 'Latest tech news from HackerNews. Read top stories with AI-powered summaries.', keywords: ['tech news', 'HackerNews', 'technology', 'startup news'] }
  },
  {
    path: '/apps/news/crypto', title: 'Crypto News', icon: '🪙',
    component: () => import('@/apps/news/CryptoNews').then(m => m.render()), drive: 'news',
    seo: { title: 'Crypto News - Latest Cryptocurrency Updates', description: 'Stay updated with latest cryptocurrency news. Bitcoin, Ethereum, and altcoin updates.', keywords: ['crypto news', 'Bitcoin news', 'cryptocurrency', 'blockchain'] }
  },
  {
    path: '/apps/news/dev', title: 'Dev Articles', icon: '👨‍💻',
    component: () => import('@/apps/news/DevArticles').then(m => m.render()), drive: 'news',
    seo: { title: 'Dev Articles - Developer Blog Posts', description: 'Latest developer articles from Dev.to. Programming tutorials, tips, and community posts.', keywords: ['dev articles', 'programming', 'developer blog', 'tutorials'] }
  },
  {
    path: '/apps/news/ai', title: 'AI News', icon: '🤖',
    component: () => import('@/apps/news/AINews').then(m => m.render()), drive: 'news',
    seo: { title: 'AI News - Artificial Intelligence Updates', description: 'Latest AI and machine learning news. Stay informed about ChatGPT, LLMs, and AI breakthroughs.', keywords: ['AI news', 'artificial intelligence', 'machine learning', 'ChatGPT'] }
  },
  {
    path: '/apps/news/search', title: 'News Search', icon: '🔍',
    component: () => import('@/apps/news/NewsSearch').then(m => m.render()), drive: 'news',
    seo: { title: 'News Search - Search Dev.to & Wikipedia', description: 'Search across Dev.to articles and Wikipedia. Find technical documentation and knowledge.', keywords: ['news search', 'Dev.to search', 'Wikipedia', 'documentation'] }
  },

  // ========== DRIVE E: UTILITY (6 Apps) ==========
  {
    path: '/apps/util/weather', title: 'Weather', icon: '🌤️',
    component: () => import('@/apps/util/Weather').then(m => m.render()), drive: 'util',
    seo: { title: 'Weather Forecast - Current Weather', description: 'Check current weather and forecast. Get temperature, humidity, and conditions for any city.', keywords: ['weather', 'forecast', 'temperature', 'weather today'] }
  },
  {
    path: '/apps/util/ip', title: 'IP Lookup', icon: '🌐',
    component: () => import('@/apps/util/IPLookup').then(m => m.render()), drive: 'util',
    seo: { title: 'IP Address Lookup - What is My IP', description: 'Find your public IP address and location. Lookup any IP for geolocation details.', keywords: ['IP lookup', 'what is my IP', 'IP address', 'geolocation'] }
  },
  {
    path: '/apps/util/writer', title: 'Word Finder', icon: '✍️',
    component: () => import('@/apps/util/WordFinder').then(m => m.render()), drive: 'util',
    seo: { title: 'Word Finder - Rhymes & Synonyms', description: 'Find rhymes, synonyms, and related words. Perfect for writers, poets, and lyricists.', keywords: ['word finder', 'rhymes', 'synonyms', 'thesaurus'] }
  },
  {
    path: '/apps/util/password', title: 'Password Generator', icon: '🔐',
    component: () => import('@/apps/util/PasswordGenerator').then(m => m.render()), drive: 'util',
    seo: { title: 'Password Generator - Secure Random Passwords', description: 'Generate secure random passwords. Customize length, symbols, numbers for strong passwords.', keywords: ['password generator', 'secure password', 'random password', 'strong password'] }
  },
  {
    path: '/apps/util/qr', title: 'QR Code', icon: '📱',
    component: () => import('@/apps/util/QRCode').then(m => m.render()), drive: 'util',
    seo: { title: 'QR Code Generator - Create QR Codes', description: 'Generate QR codes for URLs, text, contacts. Free QR code creator with download option.', keywords: ['QR code generator', 'create QR code', 'QR code maker', 'free'] }
  },
  {
    path: '/apps/util/internet', title: 'Speed Test', icon: '⚡',
    component: () => import('@/apps/util/SpeedTest').then(m => m.render()), drive: 'util',
    seo: { title: 'Internet Speed Test', description: 'Test your internet connection speed. Measure download, upload speeds and latency.', keywords: ['speed test', 'internet speed', 'bandwidth test', 'ping test'] }
  },

  // ========== DRIVE F: SYSTEM (5 Apps) ==========
  {
    path: '/system/dashboard', title: 'Dashboard', icon: '🏠',
    component: () => import('@/apps/system/Dashboard').then(m => m.render()), drive: 'system',
    seo: { title: 'Dashboard - FinSuite OS Home', description: 'Welcome to FinSuite OS. Access 40+ financial calculators, market trackers, and utilities.', keywords: ['FinSuite', 'dashboard', 'financial tools', 'calculators'] }
  },
  {
    path: '/system/settings', title: 'Settings', icon: '⚙️',
    component: () => import('@/apps/system/Settings').then(m => m.render()), drive: 'system',
    seo: { title: 'Settings - Customize FinSuite', description: 'Customize your FinSuite experience. Change theme, currency, and manage cloud sync.', keywords: ['settings', 'preferences', 'theme', 'customize'] }
  },
  {
    path: '/system/files', title: 'Files', icon: '📁',
    component: () => import('@/apps/system/Files').then(m => m.render()), drive: 'system',
    seo: { title: 'Files - Your Saved Calculations', description: 'View and manage your saved financial plans and calculations synced to the cloud.', keywords: ['files', 'saved calculations', 'cloud sync', 'backup'] }
  },
  {
    path: '/system/chat', title: 'Ask FinSuite', icon: '💬',
    component: () => import('@/apps/system/AIAssistant').then(m => m.render()), drive: 'system',
    seo: { title: 'Ask FinSuite - AI Financial Advisor', description: 'Get AI-powered financial advice. Ask questions about investments, taxes, and wealth planning.', keywords: ['AI advisor', 'financial advice', 'chatbot', 'investment help'] }
  },
  {
    path: '/system/profile', title: 'Profile', icon: '👤',
    component: () => import('@/apps/system/Profile').then(m => m.render()), drive: 'system',
    seo: { title: 'Profile - Your Account', description: 'Manage your FinSuite profile and cloud sync settings.', keywords: ['profile', 'account', 'user', 'settings'] }
  },
  {
    path: '/privacy-policy', title: 'Privacy Policy', icon: '🔒',
    component: () => import('@/apps/system/PrivacyPolicy').then(m => m.render()), drive: 'system',
    seo: { title: 'Privacy Policy - FinSuite OS', description: 'Privacy Policy for FinSuite OS financial calculators. Learn how we protect your data and use cookies.', keywords: ['privacy policy', 'data protection', 'cookies', 'GDPR'] }
  },
  {
    path: '/terms', title: 'Terms of Service', icon: '📜',
    component: () => import('@/apps/system/TermsOfService').then(m => m.render()), drive: 'system',
    seo: { title: 'Terms of Service - FinSuite OS', description: 'Terms of Service for FinSuite OS. Read our disclaimer and usage terms for financial calculators.', keywords: ['terms of service', 'disclaimer', 'legal', 'usage terms'] }
  },
  {
    path: '/about', title: 'About', icon: 'ℹ️',
    component: () => import('@/apps/system/About').then(m => m.render()), drive: 'system',
    seo: { title: 'About FinSuite OS - Free Financial Calculators', description: 'About FinSuite OS - 40+ free financial calculators, market data, and AI insights. Contact information and features.', keywords: ['about', 'contact', 'financial calculators', 'India'] }
  },
];

// Default route
const DEFAULT_ROUTE = '/system/dashboard';

class Router {
  private currentPath: string = '';
  private contentContainer: HTMLElement | null = null;
  private listeners: Array<(path: string) => void> = [];

  /**
   * Initialize the router
   */
  init(container: HTMLElement): void {
    this.contentContainer = container;

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });

    // Handle initial route
    const path = window.location.pathname || DEFAULT_ROUTE;
    this.navigate(path, false);
  }

  /**
   * Navigate to a path
   */
  async navigate(path: string, pushState = true): Promise<void> {
    // Normalize path
    const normalizedPath = path === '/' ? DEFAULT_ROUTE : path;

    // Find matching route
    const route = this.findRoute(normalizedPath);

    if (!route) {
      console.warn(`Route not found: ${normalizedPath}`);
      await this.navigate(DEFAULT_ROUTE, false);
      return;
    }

    // Update browser history
    if (pushState && this.currentPath !== normalizedPath) {
      window.history.pushState({}, '', normalizedPath);
    }

    this.currentPath = normalizedPath;

    // Update SEO meta tags
    updateSEO(route.seo);

    // Notify listeners
    this.listeners.forEach((fn) => fn(normalizedPath));

    // Load and render component
    if (this.contentContainer) {
      this.contentContainer.innerHTML = '<div class="flex items-center justify-center" style="min-height: 400px;"><div class="spinner"></div></div>';

      try {
        const element = await route.component();
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(element);
      } catch (error) {
        console.error('Route load error:', error);
        this.contentContainer.innerHTML = `
          <div class="glass-card" style="padding: var(--space-8); text-align: center;">
            <h2 style="color: var(--accent-cost); margin-bottom: var(--space-4);">Failed to load</h2>
            <p style="color: var(--text-secondary);">Unable to load this app. Please try again.</p>
            <button class="btn btn--primary mt-6" onclick="window.router.navigate('/system/dashboard')">
              Go to Dashboard
            </button>
          </div>
        `;
      }
    }
  }

  /**
   * Find a route by path
   */
  findRoute(path: string): Route | undefined {
    return routes.find((r) => r.path === path);
  }

  /**
   * Get routes by drive
   */
  getRoutesByDrive(drive: Route['drive']): Route[] {
    return routes.filter((r) => r.drive === drive);
  }

  /**
   * Get current path
   */
  getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Subscribe to route changes
   */
  onNavigate(callback: (path: string) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }
}

// Singleton instance
export const router = new Router();

// Make router globally available for onclick handlers
declare global {
  interface Window {
    router: Router;
  }
}
window.router = router;
