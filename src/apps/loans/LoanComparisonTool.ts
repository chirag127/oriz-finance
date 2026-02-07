/**
 * FinSuite OS - Loan Comparison Tool
 * Compare two loan offers side by side
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateEMI(principal: number, annualRate: number, months: number): { emi: number; totalInterest: number; totalPayment: number } {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return { emi: principal / months, totalInterest: 0, totalPayment: principal };
  }
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalInterest, totalPayment };
}

export function render(): HTMLElement {
  const state = {
    loan1: { principal: 5000000, rate: 8.5, tenure: 240 },
    loan2: { principal: 5000000, rate: 9.0, tenure: 180 }
  };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">⚖️ Loan Comparison</h1><p class="page-subtitle">Compare two loan offers side by side</p></header>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);" id="inputs-grid"></div>
    <div class="calculator-results" id="results" style="margin-top: var(--space-6);"></div>
  `;
  const inputsGrid = container.querySelector('#inputs-grid') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const r1 = calculateEMI(state.loan1.principal, state.loan1.rate, state.loan1.tenure);
    const r2 = calculateEMI(state.loan2.principal, state.loan2.rate, state.loan2.tenure);
    const diff = r1.totalPayment - r2.totalPayment;
    const better = diff > 0 ? 'Loan B' : diff < 0 ? 'Loan A' : 'Both Equal';

    results.innerHTML = '';

    // Comparison table
    const table = document.createElement('div');
    table.className = 'glass-card mb-6';
    table.style.padding = 'var(--space-6)';
    table.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📊 Comparison Results</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Metric</th>
            <th style="text-align: right; padding: var(--space-2); color: var(--accent-primary);">Loan A</th>
            <th style="text-align: right; padding: var(--space-2); color: var(--accent-secondary);">Loan B</th>
            <th style="text-align: right; padding: var(--space-2);">Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: var(--space-2);">Monthly EMI</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r1.emi)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r2.emi)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(Math.abs(r1.emi - r2.emi))}</td>
          </tr>
          <tr>
            <td style="padding: var(--space-2);">Total Interest</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r1.totalInterest)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r2.totalInterest)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(Math.abs(r1.totalInterest - r2.totalInterest))}</td>
          </tr>
          <tr style="font-weight: bold;">
            <td style="padding: var(--space-2);">Total Payment</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r1.totalPayment)}</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r2.totalPayment)}</td>
            <td style="text-align: right; padding: var(--space-2); color: ${diff > 0 ? 'var(--accent-gain)' : 'var(--accent-cost)'};">${formatCurrency(Math.abs(diff))}</td>
          </tr>
        </tbody>
      </table>
    `;
    results.appendChild(table);

    // Winner card
    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Better Option', value: better, accent: true, subtext: `Saves ${formatCurrency(Math.abs(diff))}` }));
    results.appendChild(stats);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'bar',
      labels: ['Loan A', 'Loan B'],
      datasets: [
        { label: 'Principal', data: [state.loan1.principal, state.loan2.principal] },
        { label: 'Interest', data: [r1.totalInterest, r2.totalInterest] }
      ],
      title: 'Total Cost Comparison',
    });

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Comparing 2 loans. Loan A: ₹${formatIndianNumber(state.loan1.principal)} at ${state.loan1.rate}% for ${state.loan1.tenure} months, EMI ₹${formatIndianNumber(r1.emi)}, Total ₹${formatIndianNumber(r1.totalPayment)}. Loan B: ₹${formatIndianNumber(state.loan2.principal)} at ${state.loan2.rate}% for ${state.loan2.tenure} months, EMI ₹${formatIndianNumber(r2.emi)}, Total ₹${formatIndianNumber(r2.totalPayment)}. Which is better and why?`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  // Loan A inputs
  const loanA = document.createElement('div');
  loanA.className = 'glass-card';
  loanA.style.padding = 'var(--space-6)';
  loanA.innerHTML = '<h3 style="margin-bottom: var(--space-4); color: var(--accent-primary);">🅰️ Loan A</h3>';
  loanA.appendChild(createSmartInput({ id: 'a-prin', label: 'Principal', min: 100000, max: 100000000, value: state.loan1.principal, step: 100000, prefix: '₹', currency: true, onChange: (v) => { state.loan1.principal = v; update(); } }));
  const ar = document.createElement('div'); ar.style.marginTop = 'var(--space-4)';
  ar.appendChild(createSmartInput({ id: 'a-rate', label: 'Rate', min: 1, max: 30, value: state.loan1.rate, step: 0.1, suffix: '%', onChange: (v) => { state.loan1.rate = v; update(); } }));
  loanA.appendChild(ar);
  const at = document.createElement('div'); at.style.marginTop = 'var(--space-4)';
  at.appendChild(createSmartInput({ id: 'a-tenure', label: 'Tenure (Months)', min: 12, max: 360, value: state.loan1.tenure, step: 12, onChange: (v) => { state.loan1.tenure = v; update(); } }));
  loanA.appendChild(at);
  inputsGrid.appendChild(loanA);

  // Loan B inputs
  const loanB = document.createElement('div');
  loanB.className = 'glass-card';
  loanB.style.padding = 'var(--space-6)';
  loanB.innerHTML = '<h3 style="margin-bottom: var(--space-4); color: var(--accent-secondary);">🅱️ Loan B</h3>';
  loanB.appendChild(createSmartInput({ id: 'b-prin', label: 'Principal', min: 100000, max: 100000000, value: state.loan2.principal, step: 100000, prefix: '₹', currency: true, onChange: (v) => { state.loan2.principal = v; update(); } }));
  const br = document.createElement('div'); br.style.marginTop = 'var(--space-4)';
  br.appendChild(createSmartInput({ id: 'b-rate', label: 'Rate', min: 1, max: 30, value: state.loan2.rate, step: 0.1, suffix: '%', onChange: (v) => { state.loan2.rate = v; update(); } }));
  loanB.appendChild(br);
  const bt = document.createElement('div'); bt.style.marginTop = 'var(--space-4)';
  bt.appendChild(createSmartInput({ id: 'b-tenure', label: 'Tenure (Months)', min: 12, max: 360, value: state.loan2.tenure, step: 12, onChange: (v) => { state.loan2.tenure = v; update(); } }));
  loanB.appendChild(bt);
  inputsGrid.appendChild(loanB);

  update();
  return container;
}
