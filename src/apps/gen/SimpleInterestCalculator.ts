/**
 * FinSuite OS - Simple Interest Calculator
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateSimpleInterest(principal: number, rate: number, time: number, timeUnit: 'years' | 'months'): {
  interest: number;
  totalAmount: number;
  effectiveRate: number;
} {
  const timeInYears = timeUnit === 'months' ? time / 12 : time;
  const interest = (principal * rate * timeInYears) / 100;
  const totalAmount = principal + interest;
  const effectiveRate = (interest / principal) * 100;

  return { interest, totalAmount, effectiveRate };
}

export function render(): HTMLElement {
  const state = { principal: 100000, rate: 8, time: 2, timeUnit: 'years' as 'years' | 'months' };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">📊 Simple Interest</h1><p class="page-subtitle">Calculate interest on principal amount</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateSimpleInterest(state.principal, state.rate, state.time, state.timeUnit);
    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Total Amount', value: formatCurrency(result.totalAmount), accent: true }));
    stats.appendChild(createResultCard({ label: 'Simple Interest', value: formatCurrency(result.interest) }));
    stats.appendChild(createResultCard({ label: 'Principal', value: formatCurrency(state.principal) }));
    stats.appendChild(createResultCard({ label: 'Total Return', value: `${result.effectiveRate.toFixed(1)}%` }));
    results.appendChild(stats);

    // Formula display
    const formula = document.createElement('div');
    formula.className = 'glass-card mb-6';
    formula.style.padding = 'var(--space-6)';
    formula.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📝 Calculation</h3>
      <p style="color: var(--text-secondary); margin-bottom: var(--space-3);">
        <strong>Formula:</strong> SI = (P × R × T) / 100
      </p>
      <p style="color: var(--text-secondary); margin: 0;">
        SI = (${formatCurrency(state.principal)} × ${state.rate}% × ${state.time} ${state.timeUnit}) / 100<br>
        SI = <strong style="color: var(--accent-primary);">${formatCurrency(result.interest)}</strong>
      </p>
    `;
    results.appendChild(formula);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'doughnut',
      labels: ['Principal', 'Interest'],
      datasets: [{ label: 'Amount', data: [state.principal, result.interest] }],
      title: 'Principal vs Interest',
    });

    // Comparison note
    const note = document.createElement('div');
    note.className = 'glass-card mb-6';
    note.style.padding = 'var(--space-4)';
    note.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">💡 Simple vs Compound Interest</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        Simple interest is calculated only on the principal amount, while compound interest is calculated on principal plus accumulated interest.
        For longer time periods, compound interest yields significantly higher returns.
      </p>
    `;
    results.appendChild(note);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Simple interest on ₹${formatIndianNumber(state.principal)} at ${state.rate}% for ${state.time} ${state.timeUnit}. Interest: ₹${formatIndianNumber(result.interest)}. Compare with compound interest and suggest which investments use simple interest.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Loan/Investment Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'principal', label: 'Principal Amount', min: 100, max: 100000000, value: state.principal, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.principal = v; update(); } }));

  const r = document.createElement('div'); r.style.marginTop = 'var(--space-6)';
  r.appendChild(createSmartInput({ id: 'rate', label: 'Interest Rate (Annual)', min: 0.1, max: 50, value: state.rate, step: 0.5, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));
  inputs.appendChild(r);

  // Time unit toggle
  const timeDiv = document.createElement('div');
  timeDiv.style.marginTop = 'var(--space-6)';
  const timeLabel = document.createElement('label');
  timeLabel.textContent = 'Time Period';
  timeLabel.style.cssText = 'display: block; margin-bottom: var(--space-2); color: var(--text-secondary);';
  timeDiv.appendChild(timeLabel);

  const timeRow = document.createElement('div');
  timeRow.style.display = 'flex';
  timeRow.style.gap = 'var(--space-2)';

  const timeInput = document.createElement('input');
  timeInput.type = 'number';
  timeInput.value = state.time.toString();
  timeInput.min = '1';
  timeInput.max = '100';
  timeInput.style.cssText = 'flex: 1; padding: var(--space-3); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary);';
  timeInput.onchange = (e) => { state.time = parseFloat((e.target as HTMLInputElement).value) || 1; update(); };

  const unitSelect = document.createElement('select');
  unitSelect.style.cssText = 'padding: var(--space-3); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary);';
  ['years', 'months'].forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u.charAt(0).toUpperCase() + u.slice(1);
    if (u === state.timeUnit) opt.selected = true;
    unitSelect.appendChild(opt);
  });
  unitSelect.onchange = (e) => { state.timeUnit = (e.target as HTMLSelectElement).value as 'years' | 'months'; update(); };

  timeRow.appendChild(timeInput);
  timeRow.appendChild(unitSelect);
  timeDiv.appendChild(timeRow);
  inputs.appendChild(timeDiv);

  update();
  return container;
}
