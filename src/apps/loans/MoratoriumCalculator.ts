/**
 * FinSuite OS - Moratorium Calculator
 * Cost of deferring EMI
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateMoratoriumCost(emi: number, annualRate: number, moratoriumMonths: number, remainingMonths: number): {
  normalTotalPayment: number;
  moratoriumTotalPayment: number;
  additionalCost: number;
  newEMI: number;
  interestAccrued: number;
} {
  const monthlyRate = annualRate / 12 / 100;

  // Normal scenario
  const normalTotalPayment = emi * remainingMonths;

  // Calculate outstanding principal from EMI
  const outstandingPrincipal = emi * (Math.pow(1 + monthlyRate, remainingMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths));

  // Interest accrued during moratorium (compounded)
  let accruedBalance = outstandingPrincipal;
  for (let i = 0; i < moratoriumMonths; i++) {
    accruedBalance += accruedBalance * monthlyRate;
  }
  const interestAccrued = accruedBalance - outstandingPrincipal;

  // New EMI for remaining tenure
  const newEMI = accruedBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
  const moratoriumTotalPayment = newEMI * remainingMonths;

  return {
    normalTotalPayment,
    moratoriumTotalPayment,
    additionalCost: moratoriumTotalPayment - normalTotalPayment,
    newEMI,
    interestAccrued
  };
}

export function render(): HTMLElement {
  const state = { emi: 45000, rate: 8.5, moratorium: 6, remaining: 180 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">⏸️ Moratorium Calculator</h1><p class="page-subtitle">Calculate the cost of deferring your EMI</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateMoratoriumCost(state.emi, state.rate, state.moratorium, state.remaining);
    results.innerHTML = '';

    // Warning banner
    const warning = document.createElement('div');
    warning.className = 'glass-card mb-6';
    warning.style.padding = 'var(--space-4)';
    warning.style.background = 'rgba(234, 179, 8, 0.1)';
    warning.style.borderLeft = '4px solid var(--accent-cost)';
    warning.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-3);">
        <span style="font-size: 1.5rem;">⚠️</span>
        <div>
          <strong style="color: var(--accent-cost);">Moratorium Costs Extra</strong>
          <p style="margin: 0; color: var(--text-secondary);">Interest continues to accrue during moratorium and is added to your principal.</p>
        </div>
      </div>
    `;
    results.appendChild(warning);

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Additional Cost', value: formatCurrency(result.additionalCost), accent: true, subtext: 'Due to moratorium' }));
    stats.appendChild(createResultCard({ label: 'Interest Accrued', value: formatCurrency(result.interestAccrued), subtext: `During ${state.moratorium} months` }));
    stats.appendChild(createResultCard({ label: 'New EMI', value: formatCurrency(result.newEMI), subtext: `Was ${formatCurrency(state.emi)}` }));
    stats.appendChild(createResultCard({ label: 'EMI Increase', value: formatCurrency(result.newEMI - state.emi) }));
    results.appendChild(stats);

    // Comparison
    const comparison = document.createElement('div');
    comparison.className = 'glass-card mb-6';
    comparison.style.padding = 'var(--space-6)';
    comparison.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📊 Total Payment Comparison</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">Without Moratorium</td>
          <td style="text-align: right; padding: var(--space-2); color: var(--accent-gain);">${formatCurrency(result.normalTotalPayment)}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">With ${state.moratorium}-Month Moratorium</td>
          <td style="text-align: right; padding: var(--space-2); color: var(--accent-cost);">${formatCurrency(result.moratoriumTotalPayment)}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: var(--space-2);">Extra Cost</td>
          <td style="text-align: right; padding: var(--space-2); color: var(--accent-cost);">+${formatCurrency(result.additionalCost)}</td>
        </tr>
      </table>
    `;
    results.appendChild(comparison);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'bar',
      labels: ['Normal', 'With Moratorium'],
      datasets: [{ label: 'Total Payment', data: [result.normalTotalPayment, result.moratoriumTotalPayment] }],
      title: 'Total Payment Comparison',
    });

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`EMI ₹${formatIndianNumber(state.emi)} at ${state.rate}%. Taking ${state.moratorium} month moratorium costs extra ₹${formatIndianNumber(result.additionalCost)}. New EMI: ₹${formatIndianNumber(result.newEMI)}. Should I opt for moratorium or continue paying?`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Current Loan</h3>';
  inputs.appendChild(createSmartInput({ id: 'emi', label: 'Current EMI', min: 1000, max: 1000000, value: state.emi, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.emi = v; update(); } }));
  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate', min: 1, max: 30, value: state.rate, step: 0.25, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);
  const m = document.createElement('div'); m.style.marginTop = 'var(--space-6)';
  m.appendChild(createSmartInput({ id: 'mora', label: 'Moratorium Period', min: 1, max: 24, value: state.moratorium, step: 1, suffix: ' months', onChange: (v) => { state.moratorium = v; update(); } }));
  inputs.appendChild(m);
  const t = document.createElement('div'); t.style.marginTop = 'var(--space-6)';
  t.appendChild(createSmartInput({ id: 'remaining', label: 'Remaining Tenure', min: 12, max: 360, value: state.remaining, step: 12, suffix: ' months', onChange: (v) => { state.remaining = v; update(); } }));
  inputs.appendChild(t);
  update();
  return container;
}
