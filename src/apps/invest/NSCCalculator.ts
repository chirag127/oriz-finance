/**
 * FinSuite OS - NSC Calculator
 * National Savings Certificate (5-year maturity)
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

// NSC compounds annually, interest added back to principal
function calculateNSC(investment: number, annualRate: number, years: number = 5): {
  maturityValue: number;
  totalInterest: number;
  yearWise: { year: number; opening: number; interest: number; closing: number }[];
} {
  const yearWise: { year: number; opening: number; interest: number; closing: number }[] = [];
  let balance = investment;

  for (let y = 1; y <= years; y++) {
    const opening = balance;
    const interest = opening * (annualRate / 100);
    balance = opening + interest;
    yearWise.push({ year: y, opening, interest, closing: balance });
  }

  return {
    maturityValue: balance,
    totalInterest: balance - investment,
    yearWise
  };
}

export function render(): HTMLElement {
  const state = { investment: 100000, rate: 7.7 }; // Current NSC rate
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">🏛️ NSC Calculator</h1><p class="page-subtitle">National Savings Certificate - 5 Year Maturity</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateNSC(state.investment, state.rate, 5);
    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Maturity Value', value: formatCurrency(result.maturityValue), accent: true }));
    stats.appendChild(createResultCard({ label: 'Total Interest', value: formatCurrency(result.totalInterest) }));
    stats.appendChild(createResultCard({ label: 'Investment', value: formatCurrency(state.investment) }));
    stats.appendChild(createResultCard({ label: 'Effective Return', value: `${((result.maturityValue / state.investment - 1) * 100).toFixed(1)}%`, subtext: 'Over 5 years' }));
    results.appendChild(stats);

    // Year-wise breakdown
    const table = document.createElement('div');
    table.className = 'glass-card mb-6';
    table.style.padding = 'var(--space-6)';
    table.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📅 Year-wise Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Year</th>
            <th style="text-align: right; padding: var(--space-2);">Opening</th>
            <th style="text-align: right; padding: var(--space-2);">Interest</th>
            <th style="text-align: right; padding: var(--space-2);">Closing</th>
          </tr>
        </thead>
        <tbody>
          ${result.yearWise.map(y => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
              <td style="padding: var(--space-2);">Year ${y.year}</td>
              <td style="text-align: right; padding: var(--space-2);">${formatCurrency(y.opening)}</td>
              <td style="text-align: right; padding: var(--space-2); color: var(--accent-gain);">+${formatCurrency(y.interest)}</td>
              <td style="text-align: right; padding: var(--space-2);">${formatCurrency(y.closing)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    results.appendChild(table);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'line',
      labels: result.yearWise.map(y => `Year ${y.year}`),
      datasets: [{ label: 'Value', data: result.yearWise.map(y => y.closing) }],
      title: 'Growth Over 5 Years',
    });

    // Tax info
    const info = document.createElement('div');
    info.className = 'glass-card mb-6';
    info.style.padding = 'var(--space-4)';
    info.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">💡 Tax Benefits</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        • Investment qualifies for Section 80C deduction (up to ₹1.5 lakh)<br>
        • Interest is taxable but deemed reinvested (no TDS)<br>
        • Interest for first 4 years can be claimed as 80C deduction
      </p>
    `;
    results.appendChild(info);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`NSC Investment: ₹${formatIndianNumber(state.investment)} at ${state.rate}%. Maturity: ₹${formatIndianNumber(result.maturityValue)} after 5 years. Total interest: ₹${formatIndianNumber(result.totalInterest)}. Compare NSC vs PPF vs FD for tax saving.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Investment Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'invest', label: 'Investment Amount', min: 1000, max: 10000000, value: state.investment, step: 5000, prefix: '₹', currency: true, onChange: (v) => { state.investment = v; update(); } }));
  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate', min: 5, max: 12, value: state.rate, step: 0.1, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);

  // Current rate info
  const rateInfo = document.createElement('div');
  rateInfo.style.marginTop = 'var(--space-4)';
  rateInfo.style.padding = 'var(--space-3)';
  rateInfo.style.background = 'var(--glass-bg)';
  rateInfo.style.borderRadius = 'var(--radius-md)';
  rateInfo.innerHTML = '<p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">ℹ️ Current NSC rate (2024): 7.7% p.a.</p>';
  inputs.appendChild(rateInfo);

  update();
  return container;
}
