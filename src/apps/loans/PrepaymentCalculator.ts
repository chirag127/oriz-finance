/**
 * FinSuite OS - Prepayment Calculator
 * Impact of extra payments on loan
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateWithPrepayment(principal: number, annualRate: number, months: number, monthlyPrepay: number): {
  emi: number;
  originalTenure: number;
  newTenure: number;
  originalInterest: number;
  newInterest: number;
  interestSaved: number;
  monthsSaved: number;
} {
  const monthlyRate = annualRate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);

  // Original scenario
  const originalInterest = (emi * months) - principal;

  // With prepayment - simulate month by month
  let balance = principal;
  let newMonths = 0;
  let totalPaidWithPrepay = 0;

  while (balance > 0 && newMonths < months * 2) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(emi - interest + monthlyPrepay, balance);
    balance -= principalPaid;
    totalPaidWithPrepay += emi + monthlyPrepay;
    newMonths++;
    if (balance <= 0) break;
  }

  const newInterest = totalPaidWithPrepay - principal;

  return {
    emi,
    originalTenure: months,
    newTenure: newMonths,
    originalInterest,
    newInterest: Math.max(0, newInterest),
    interestSaved: Math.max(0, originalInterest - newInterest),
    monthsSaved: Math.max(0, months - newMonths)
  };
}

export function render(): HTMLElement {
  const state = { principal: 5000000, rate: 8.5, tenure: 240, prepay: 10000 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">💸 Prepayment Calculator</h1><p class="page-subtitle">See impact of extra payments on your loan</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateWithPrepayment(state.principal, state.rate, state.tenure, state.prepay);
    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Interest Saved', value: formatCurrency(result.interestSaved), accent: true }));
    stats.appendChild(createResultCard({ label: 'Months Saved', value: `${result.monthsSaved}`, subtext: `${(result.monthsSaved / 12).toFixed(1)} years` }));
    stats.appendChild(createResultCard({ label: 'Original Interest', value: formatCurrency(result.originalInterest) }));
    stats.appendChild(createResultCard({ label: 'New Interest', value: formatCurrency(result.newInterest) }));
    results.appendChild(stats);

    // Comparison
    const comparison = document.createElement('div');
    comparison.className = 'glass-card mb-6';
    comparison.style.padding = 'var(--space-6)';
    comparison.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📊 Timeline Comparison</h3>
      <div style="display: flex; justify-content: space-between; gap: var(--space-4);">
        <div style="flex: 1; text-align: center;">
          <div style="color: var(--text-secondary);">Without Prepayment</div>
          <div style="font-size: var(--text-xl); font-weight: bold;">${result.originalTenure} months</div>
          <div style="color: var(--text-secondary);">${(result.originalTenure / 12).toFixed(1)} years</div>
        </div>
        <div style="flex: 1; text-align: center; color: var(--accent-gain);">
          <div>With Prepayment</div>
          <div style="font-size: var(--text-xl); font-weight: bold;">${result.newTenure} months</div>
          <div>${(result.newTenure / 12).toFixed(1)} years</div>
        </div>
      </div>
    `;
    results.appendChild(comparison);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'bar',
      labels: ['Without Prepayment', 'With Prepayment'],
      datasets: [
        { label: 'Principal', data: [state.principal, state.principal] },
        { label: 'Interest', data: [result.originalInterest, result.newInterest] }
      ],
      title: 'Interest Comparison',
    });

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Loan ₹${formatIndianNumber(state.principal)} at ${state.rate}% for ${state.tenure} months. With ₹${formatIndianNumber(state.prepay)} monthly prepayment, saves ₹${formatIndianNumber(result.interestSaved)} and ${result.monthsSaved} months. Is this prepayment strategy optimal?`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Loan Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'prin', label: 'Loan Amount', min: 100000, max: 100000000, value: state.principal, step: 100000, prefix: '₹', currency: true, onChange: (v) => { state.principal = v; update(); } }));
  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate', min: 1, max: 30, value: state.rate, step: 0.1, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);
  const t = document.createElement('div'); t.style.marginTop = 'var(--space-6)';
  t.appendChild(createSmartInput({ id: 'tenure', label: 'Tenure (Months)', min: 12, max: 360, value: state.tenure, step: 12, onChange: (v) => { state.tenure = v; update(); } }));
  inputs.appendChild(t);
  const p = document.createElement('div'); p.style.marginTop = 'var(--space-6)';
  p.appendChild(createSmartInput({ id: 'prepay', label: 'Monthly Prepayment', min: 0, max: 500000, value: state.prepay, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.prepay = v; update(); } }));
  inputs.appendChild(p);
  update();
  return container;
}
