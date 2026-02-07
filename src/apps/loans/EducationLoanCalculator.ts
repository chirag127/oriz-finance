/**
 * FinSuite OS - Education Loan Calculator
 * With moratorium period logic
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateEducationLoan(principal: number, annualRate: number, moratoriumMonths: number, repaymentMonths: number): {
  principalAfterMoratorium: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  moratoriumInterest: number;
} {
  const monthlyRate = annualRate / 12 / 100;

  // Interest accrued during moratorium (simple interest added to principal)
  const moratoriumInterest = principal * monthlyRate * moratoriumMonths;
  const principalAfterMoratorium = principal + moratoriumInterest;

  // EMI calculation on inflated principal
  const emi = principalAfterMoratorium * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths) / (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
  const totalPayment = emi * repaymentMonths;
  const totalInterest = totalPayment - principal;

  return { principalAfterMoratorium, emi, totalInterest, totalPayment, moratoriumInterest };
}

export function render(): HTMLElement {
  const state = { principal: 1000000, rate: 9, moratorium: 48, repayment: 120 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">🎓 Education Loan Calculator</h1><p class="page-subtitle">Plan your education loan with moratorium period</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateEducationLoan(state.principal, state.rate, state.moratorium, state.repayment);
    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Monthly EMI', value: formatCurrency(result.emi), accent: true }));
    stats.appendChild(createResultCard({ label: 'Moratorium Interest', value: formatCurrency(result.moratoriumInterest), subtext: `Added to principal` }));
    stats.appendChild(createResultCard({ label: 'Effective Principal', value: formatCurrency(result.principalAfterMoratorium) }));
    stats.appendChild(createResultCard({ label: 'Total Interest', value: formatCurrency(result.totalInterest) }));
    results.appendChild(stats);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'doughnut',
      labels: ['Original Principal', 'Moratorium Interest', 'Repayment Interest'],
      datasets: [{ label: 'Amount', data: [state.principal, result.moratoriumInterest, result.totalInterest - result.moratoriumInterest] }],
      title: 'Loan Breakdown',
    });

    // Timeline info
    const timeline = document.createElement('div');
    timeline.className = 'glass-card mb-6';
    timeline.style.padding = 'var(--space-4)';
    timeline.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">📅 Timeline</h4>
      <p style="color: var(--text-secondary);">
        <strong>Moratorium:</strong> ${state.moratorium} months (${(state.moratorium / 12).toFixed(1)} years) - No EMI, interest accrues<br>
        <strong>Repayment:</strong> ${state.repayment} months (${(state.repayment / 12).toFixed(1)} years) - EMI of ${formatCurrency(result.emi)}/month
      </p>
    `;
    results.appendChild(timeline);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Education loan: ₹${formatIndianNumber(state.principal)} at ${state.rate}%. Moratorium: ${state.moratorium} months. Repayment: ${state.repayment} months. EMI: ₹${formatIndianNumber(result.emi)}. Moratorium interest: ₹${formatIndianNumber(result.moratoriumInterest)}. Suggest whether to pay interest during moratorium.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Loan Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'prin', label: 'Loan Amount', min: 100000, max: 50000000, value: state.principal, step: 50000, prefix: '₹', currency: true, onChange: (v) => { state.principal = v; update(); } }));

  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate', min: 4, max: 20, value: state.rate, step: 0.25, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);

  const m = document.createElement('div'); m.style.marginTop = 'var(--space-6)';
  m.appendChild(createSmartInput({ id: 'mora', label: 'Moratorium Period', min: 0, max: 72, value: state.moratorium, step: 6, suffix: ' months', onChange: (v) => { state.moratorium = v; update(); } }));
  inputs.appendChild(m);

  const t = document.createElement('div'); t.style.marginTop = 'var(--space-6)';
  t.appendChild(createSmartInput({ id: 'repay', label: 'Repayment Period', min: 12, max: 180, value: state.repayment, step: 12, suffix: ' months', onChange: (v) => { state.repayment = v; update(); } }));
  inputs.appendChild(t);

  update();
  return container;
}
