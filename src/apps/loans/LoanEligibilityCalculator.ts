/**
 * FinSuite OS - Loan Eligibility Calculator
 * Income to Debt ratio check
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateEligibility(monthlyIncome: number, existingEMI: number, interestRate: number, tenure: number, maxFOIR: number = 50): {
  maxEMI: number;
  maxLoan: number;
  foir: number;
  eligible: boolean;
} {
  const maxEMI = (monthlyIncome * maxFOIR / 100) - existingEMI;
  const monthlyRate = interestRate / 12 / 100;

  // Reverse EMI formula to get max loan
  let maxLoan = 0;
  if (maxEMI > 0 && monthlyRate > 0) {
    maxLoan = maxEMI * (Math.pow(1 + monthlyRate, tenure) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, tenure));
  }

  const currentFOIR = existingEMI > 0 ? (existingEMI / monthlyIncome) * 100 : 0;

  return {
    maxEMI: Math.max(0, maxEMI),
    maxLoan: Math.max(0, maxLoan),
    foir: currentFOIR,
    eligible: maxEMI > 0
  };
}

export function render(): HTMLElement {
  const state = { income: 100000, existingEMI: 15000, rate: 8.5, tenure: 240, foir: 50 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">✅ Loan Eligibility</h1><p class="page-subtitle">Check how much loan you can get</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateEligibility(state.income, state.existingEMI, state.rate, state.tenure, state.foir);
    results.innerHTML = '';

    // Eligibility status
    const status = document.createElement('div');
    status.className = 'glass-card mb-6';
    status.style.padding = 'var(--space-6)';
    status.style.borderLeft = result.eligible ? '4px solid var(--accent-gain)' : '4px solid var(--accent-cost)';
    status.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-4);">
        <span style="font-size: 2rem;">${result.eligible ? '✅' : '❌'}</span>
        <div>
          <h3 style="margin: 0; color: ${result.eligible ? 'var(--accent-gain)' : 'var(--accent-cost)'};">${result.eligible ? 'Eligible for Loan' : 'Not Eligible'}</h3>
          <p style="margin: 0; color: var(--text-secondary);">Based on ${state.foir}% FOIR limit</p>
        </div>
      </div>
    `;
    results.appendChild(status);

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Maximum Loan', value: formatCurrency(result.maxLoan), accent: true }));
    stats.appendChild(createResultCard({ label: 'Maximum EMI', value: formatCurrency(result.maxEMI), subtext: 'Available capacity' }));
    stats.appendChild(createResultCard({ label: 'Current FOIR', value: `${result.foir.toFixed(1)}%`, subtext: `${state.foir}% allowed` }));
    stats.appendChild(createResultCard({ label: 'Available FOIR', value: `${(state.foir - result.foir).toFixed(1)}%` }));
    results.appendChild(stats);

    // FOIR breakdown
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'doughnut',
      labels: ['Existing EMI', 'Available for New EMI', 'Reserved (Non-FOIR)'],
      datasets: [{
        label: 'Income Allocation',
        data: [
          state.existingEMI,
          result.maxEMI,
          state.income - state.existingEMI - result.maxEMI
        ]
      }],
      title: 'Income Allocation (FOIR)',
    });

    // Info box
    const info = document.createElement('div');
    info.className = 'glass-card mb-6';
    info.style.padding = 'var(--space-4)';
    info.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">ℹ️ What is FOIR?</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        <strong>Fixed Obligations to Income Ratio (FOIR)</strong> is the percentage of your income that goes towards EMIs.
        Banks typically allow up to 40-60% FOIR. A lower FOIR means higher loan eligibility.
      </p>
    `;
    results.appendChild(info);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Income ₹${formatIndianNumber(state.income)}/month. Existing EMI: ₹${formatIndianNumber(state.existingEMI)}. FOIR: ${result.foir.toFixed(1)}%. Max eligible loan: ₹${formatIndianNumber(result.maxLoan)} at ${state.rate}% for ${state.tenure} months. Suggest ways to increase eligibility.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Your Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'income', label: 'Monthly Income', min: 10000, max: 10000000, value: state.income, step: 5000, prefix: '₹', currency: true, onChange: (v) => { state.income = v; update(); } }));
  const e = document.createElement('div'); e.style.marginTop = 'var(--space-6)';
  e.appendChild(createSmartInput({ id: 'emi', label: 'Existing EMIs', min: 0, max: 5000000, value: state.existingEMI, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.existingEMI = v; update(); } }));
  inputs.appendChild(e);
  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Expected Interest Rate', min: 1, max: 30, value: state.rate, step: 0.25, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);
  const t = document.createElement('div'); t.style.marginTop = 'var(--space-6)';
  t.appendChild(createSmartInput({ id: 'tenure', label: 'Tenure (Months)', min: 12, max: 360, value: state.tenure, step: 12, onChange: (v) => { state.tenure = v; update(); } }));
  inputs.appendChild(t);
  const f = document.createElement('div'); f.style.marginTop = 'var(--space-6)';
  f.appendChild(createSmartInput({ id: 'foir', label: 'Max FOIR Allowed', min: 30, max: 70, value: state.foir, step: 5, suffix: '%', onChange: (v) => { state.foir = v; update(); } }));
  inputs.appendChild(f);
  update();
  return container;
}
