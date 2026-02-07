/**
 * FinSuite OS - Personal Loan Calculator
 * Flat vs Reducing rate comparison
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

// Calculate EMI for reducing balance method
function calculateReducingEMI(principal: number, annualRate: number, months: number): { emi: number; totalInterest: number; totalPayment: number } {
  const monthlyRate = annualRate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalInterest, totalPayment };
}

// Calculate EMI for flat rate method
function calculateFlatEMI(principal: number, annualRate: number, months: number): { emi: number; totalInterest: number; totalPayment: number } {
  const totalInterest = (principal * annualRate * (months / 12)) / 100;
  const totalPayment = principal + totalInterest;
  const emi = totalPayment / months;
  return { emi, totalInterest, totalPayment };
}

export function render(): HTMLElement {
  const state = { principal: 500000, rate: 12, tenure: 36 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">💳 Personal Loan Calculator</h1><p class="page-subtitle">Compare Flat vs Reducing Balance Rate</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const reducing = calculateReducingEMI(state.principal, state.rate, state.tenure);
    const flat = calculateFlatEMI(state.principal, state.rate, state.tenure);
    const savings = flat.totalInterest - reducing.totalInterest;

    results.innerHTML = '';

    // Comparison Header
    const header = document.createElement('div');
    header.className = 'glass-card mb-6';
    header.style.padding = 'var(--space-6)';
    header.innerHTML = `
      <h3 style="margin-bottom: var(--space-4); color: var(--text-primary);">📊 Comparison</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Method</th>
            <th style="text-align: right; padding: var(--space-2);">EMI</th>
            <th style="text-align: right; padding: var(--space-2);">Total Interest</th>
            <th style="text-align: right; padding: var(--space-2);">Total Payment</th>
          </tr>
        </thead>
        <tbody>
          <tr style="color: var(--accent-gain);">
            <td style="padding: var(--space-2);">Reducing Balance</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(reducing.emi)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(reducing.totalInterest)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(reducing.totalPayment)}</td>
          </tr>
          <tr style="color: var(--accent-cost);">
            <td style="padding: var(--space-2);">Flat Rate</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(flat.emi)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(flat.totalInterest)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(flat.totalPayment)}</td>
          </tr>
        </tbody>
      </table>
    `;
    results.appendChild(header);

    // Savings card
    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'You Save with Reducing', value: formatCurrency(savings), accent: true, subtext: 'vs Flat Rate' }));
    stats.appendChild(createResultCard({ label: 'Reducing EMI', value: formatCurrency(reducing.emi) }));
    stats.appendChild(createResultCard({ label: 'Flat EMI', value: formatCurrency(flat.emi) }));
    results.appendChild(stats);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'bar',
      labels: ['Reducing Balance', 'Flat Rate'],
      datasets: [
        { label: 'Principal', data: [state.principal, state.principal] },
        { label: 'Interest', data: [reducing.totalInterest, flat.totalInterest] }
      ],
      title: 'Interest Comparison',
    });

    // AI Insight
    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Personal loan ₹${formatIndianNumber(state.principal)} at ${state.rate}% for ${state.tenure} months. Reducing EMI: ₹${formatIndianNumber(reducing.emi)}, Flat EMI: ₹${formatIndianNumber(flat.emi)}. Savings with reducing: ₹${formatIndianNumber(savings)}. Explain which is better and why.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Loan Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'prin', label: 'Loan Amount', min: 10000, max: 10000000, value: state.principal, step: 10000, prefix: '₹', currency: true, onChange: (v) => { state.principal = v; update(); } }));
  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate (Annual)', min: 1, max: 50, value: state.rate, step: 0.5, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);
  const t = document.createElement('div'); t.style.marginTop = 'var(--space-6)';
  t.appendChild(createSmartInput({ id: 'tenure', label: 'Tenure (Months)', min: 6, max: 84, value: state.tenure, step: 6, suffix: ' months', onChange: (v) => { state.tenure = v; update(); } }));
  inputs.appendChild(t);
  update();
  return container;
}
