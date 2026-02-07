/**
 * FinSuite OS - Compound Interest Calculator
 * Advanced frequency settings
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

type CompoundFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily' | 'continuous';

const FREQUENCY_MAP: Record<CompoundFrequency, number> = {
  'annually': 1,
  'semi-annually': 2,
  'quarterly': 4,
  'monthly': 12,
  'daily': 365,
  'continuous': Infinity
};

function calculateCompoundInterest(principal: number, rate: number, years: number, frequency: CompoundFrequency): {
  totalAmount: number;
  interest: number;
  effectiveRate: number;
  yearlyGrowth: { year: number; amount: number; interest: number }[];
} {
  const n = FREQUENCY_MAP[frequency];
  const r = rate / 100;

  let totalAmount: number;
  if (frequency === 'continuous') {
    totalAmount = principal * Math.exp(r * years);
  } else {
    totalAmount = principal * Math.pow(1 + r / n, n * years);
  }

  const interest = totalAmount - principal;
  const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;

  // Year-by-year growth
  const yearlyGrowth: { year: number; amount: number; interest: number }[] = [];
  for (let y = 1; y <= years; y++) {
    let amt: number;
    if (frequency === 'continuous') {
      amt = principal * Math.exp(r * y);
    } else {
      amt = principal * Math.pow(1 + r / n, n * y);
    }
    yearlyGrowth.push({ year: y, amount: amt, interest: amt - principal });
  }

  return { totalAmount, interest, effectiveRate, yearlyGrowth };
}

export function render(): HTMLElement {
  const state = { principal: 100000, rate: 10, years: 5, frequency: 'annually' as CompoundFrequency };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">📈 Compound Interest</h1><p class="page-subtitle">See the power of compounding with different frequencies</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateCompoundInterest(state.principal, state.rate, state.years, state.frequency);

    // Compare all frequencies
    const comparison = Object.keys(FREQUENCY_MAP).map(freq => ({
      frequency: freq,
      ...calculateCompoundInterest(state.principal, state.rate, state.years, freq as CompoundFrequency)
    }));

    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Total Amount', value: formatCurrency(result.totalAmount), accent: true }));
    stats.appendChild(createResultCard({ label: 'Interest Earned', value: formatCurrency(result.interest) }));
    stats.appendChild(createResultCard({ label: 'Effective Rate', value: `${result.effectiveRate.toFixed(2)}%` }));
    stats.appendChild(createResultCard({ label: 'Growth Multiple', value: `${(result.totalAmount / state.principal).toFixed(2)}x` }));
    results.appendChild(stats);

    // Frequency comparison
    const freqTable = document.createElement('div');
    freqTable.className = 'glass-card mb-6';
    freqTable.style.padding = 'var(--space-6)';
    freqTable.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📊 Compounding Frequency Comparison</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Frequency</th>
            <th style="text-align: right; padding: var(--space-2);">Final Amount</th>
            <th style="text-align: right; padding: var(--space-2);">Interest</th>
            <th style="text-align: right; padding: var(--space-2);">Effective Rate</th>
          </tr>
        </thead>
        <tbody>
          ${comparison.map(c => `
            <tr style="border-bottom: 1px solid var(--glass-border); ${c.frequency === state.frequency ? 'background: var(--accent-primary-alpha);' : ''}">
              <td style="padding: var(--space-2); text-transform: capitalize;">${c.frequency}</td>
              <td style="text-align: right; padding: var(--space-2);">${formatCurrency(c.totalAmount)}</td>
              <td style="text-align: right; padding: var(--space-2); color: var(--accent-gain);">${formatCurrency(c.interest)}</td>
              <td style="text-align: right; padding: var(--space-2);">${c.effectiveRate.toFixed(2)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    results.appendChild(freqTable);

    // Growth chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'line',
      labels: ['0', ...result.yearlyGrowth.map(y => `Year ${y.year}`)],
      datasets: [{ label: 'Amount', data: [state.principal, ...result.yearlyGrowth.map(y => y.amount)] }],
      title: 'Compound Growth Over Time',
    });

    // Formula
    const formula = document.createElement('div');
    formula.className = 'glass-card mb-6';
    formula.style.padding = 'var(--space-4)';
    formula.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">📝 Formula</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        ${state.frequency === 'continuous'
          ? '<strong>Continuous:</strong> A = P × e^(rt)'
          : '<strong>Periodic:</strong> A = P × (1 + r/n)^(nt)'}<br>
        Where P = Principal, r = rate, n = compounding frequency, t = time
      </p>
    `;
    results.appendChild(formula);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Compound interest on ₹${formatIndianNumber(state.principal)} at ${state.rate}% for ${state.years} years with ${state.frequency} compounding. Final: ₹${formatIndianNumber(result.totalAmount)}. Interest: ₹${formatIndianNumber(result.interest)}. Explain the power of compounding and compare frequencies.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Investment Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'principal', label: 'Principal Amount', min: 100, max: 100000000, value: state.principal, step: 10000, prefix: '₹', currency: true, onChange: (v) => { state.principal = v; update(); } }));

  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate (Annual)', min: 0.1, max: 50, value: state.rate, step: 0.5, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);

  const y = document.createElement('div'); y.style.marginTop = 'var(--space-6)';
  y.appendChild(createSmartInput({ id: 'years', label: 'Time Period', min: 1, max: 50, value: state.years, step: 1, suffix: ' years', onChange: (v) => { state.years = v; update(); } }));
  inputs.appendChild(y);

  // Frequency selector
  const freqDiv = document.createElement('div');
  freqDiv.style.marginTop = 'var(--space-6)';
  const freqLabel = document.createElement('label');
  freqLabel.textContent = 'Compounding Frequency';
  freqLabel.style.cssText = 'display: block; margin-bottom: var(--space-2); color: var(--text-secondary);';
  const freqSelect = document.createElement('select');
  freqSelect.style.cssText = 'width: 100%; padding: var(--space-3); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary);';
  Object.keys(FREQUENCY_MAP).forEach(freq => {
    const opt = document.createElement('option');
    opt.value = freq;
    opt.textContent = freq.charAt(0).toUpperCase() + freq.slice(1);
    if (freq === state.frequency) opt.selected = true;
    freqSelect.appendChild(opt);
  });
  freqSelect.onchange = (e) => { state.frequency = (e.target as HTMLSelectElement).value as CompoundFrequency; update(); };
  freqDiv.appendChild(freqLabel);
  freqDiv.appendChild(freqSelect);
  inputs.appendChild(freqDiv);

  update();
  return container;
}
