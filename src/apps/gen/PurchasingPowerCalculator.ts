/**
 * FinSuite OS - Purchasing Power Calculator
 * Historical value comparison
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculatePurchasingPower(amount: number, inflationRate: number, years: number, direction: 'past' | 'future'): {
  adjustedValue: number;
  percentChange: number;
  yearlyValues: { year: number; value: number }[];
} {
  const yearlyValues: { year: number; value: number }[] = [];
  const currentYear = new Date().getFullYear();
  let value = amount;

  if (direction === 'future') {
    for (let y = 0; y <= years; y++) {
      yearlyValues.push({ year: currentYear + y, value });
      value = value / (1 + inflationRate / 100);
    }
  } else {
    for (let y = 0; y <= years; y++) {
      yearlyValues.push({ year: currentYear - y, value });
      value = value * (1 + inflationRate / 100);
    }
    yearlyValues.reverse();
  }

  const adjustedValue = direction === 'future'
    ? amount / Math.pow(1 + inflationRate / 100, years)
    : amount * Math.pow(1 + inflationRate / 100, years);

  const percentChange = ((adjustedValue - amount) / amount) * 100;

  return { adjustedValue, percentChange, yearlyValues };
}

export function render(): HTMLElement {
  const state = { amount: 100000, inflation: 6, years: 10, direction: 'future' as 'past' | 'future' };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">📉 Purchasing Power</h1><p class="page-subtitle">See how inflation erodes your money's value</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculatePurchasingPower(state.amount, state.inflation, state.years, state.direction);
    const currentYear = new Date().getFullYear();
    results.innerHTML = '';

    // Main result
    const mainResult = document.createElement('div');
    mainResult.className = 'glass-card mb-6';
    mainResult.style.padding = 'var(--space-6)';
    mainResult.style.textAlign = 'center';

    if (state.direction === 'future') {
      mainResult.innerHTML = `
        <h3 style="color: var(--text-secondary); margin-bottom: var(--space-2);">${formatCurrency(state.amount)} today will be worth only</h3>
        <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-cost); margin-bottom: var(--space-2);">${formatCurrency(result.adjustedValue)}</div>
        <p style="color: var(--text-secondary);">in ${state.years} years (${currentYear + state.years}) at ${state.inflation}% inflation</p>
      `;
    } else {
      mainResult.innerHTML = `
        <h3 style="color: var(--text-secondary); margin-bottom: var(--space-2);">${formatCurrency(state.amount)} today was equivalent to</h3>
        <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-gain); margin-bottom: var(--space-2);">${formatCurrency(result.adjustedValue)}</div>
        <p style="color: var(--text-secondary);">${state.years} years ago (${currentYear - state.years}) at ${state.inflation}% inflation</p>
      `;
    }
    results.appendChild(mainResult);

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Original Amount', value: formatCurrency(state.amount) }));
    stats.appendChild(createResultCard({ label: 'Adjusted Value', value: formatCurrency(result.adjustedValue), accent: true }));
    stats.appendChild(createResultCard({ label: 'Value Change', value: `${result.percentChange > 0 ? '+' : ''}${result.percentChange.toFixed(1)}%` }));
    stats.appendChild(createResultCard({ label: 'Annual Inflation', value: `${state.inflation}%` }));
    results.appendChild(stats);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'line',
      labels: result.yearlyValues.map(y => y.year.toString()),
      datasets: [{ label: 'Purchasing Power', data: result.yearlyValues.map(y => y.value) }],
      title: `Purchasing Power Over ${state.years} Years`,
    });

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`₹${formatIndianNumber(state.amount)} today ${state.direction === 'future' ? 'will be worth' : 'was worth'} ₹${formatIndianNumber(result.adjustedValue)} ${state.direction === 'future' ? 'in' : ''} ${state.years} years ${state.direction === 'past' ? 'ago' : ''} at ${state.inflation}% inflation. Explain and suggest inflation-beating investments.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Calculate</h3>';

  // Direction toggle
  const dirDiv = document.createElement('div');
  dirDiv.style.marginBottom = 'var(--space-6)';
  dirDiv.style.display = 'flex';
  dirDiv.style.gap = 'var(--space-2)';
  ['future', 'past'].forEach(dir => {
    const btn = document.createElement('button');
    btn.textContent = dir === 'future' ? '📅 Future Value' : '⏮️ Past Value';
    btn.className = `btn ${state.direction === dir ? 'btn--primary' : 'btn--secondary'}`;
    btn.style.flex = '1';
    btn.onclick = () => { state.direction = dir as 'past' | 'future'; update(); renderInputs(); };
    dirDiv.appendChild(btn);
  });
  inputs.appendChild(dirDiv);

  function renderInputs(): void {
    const existing = inputs.querySelectorAll('.input-group');
    existing.forEach(e => e.remove());

    const a = document.createElement('div'); a.className = 'input-group';
    a.appendChild(createSmartInput({ id: 'amount', label: 'Amount Today', min: 100, max: 100000000, value: state.amount, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.amount = v; update(); } }));
    inputs.appendChild(a);

    const i = document.createElement('div'); i.className = 'input-group'; i.style.marginTop = 'var(--space-6)';
    i.appendChild(createSmartInput({ id: 'inflation', label: 'Annual Inflation Rate', min: 1, max: 20, value: state.inflation, step: 0.5, suffix: '%', onChange: (v) => { state.inflation = v; update(); } }));
    inputs.appendChild(i);

    const y = document.createElement('div'); y.className = 'input-group'; y.style.marginTop = 'var(--space-6)';
    y.appendChild(createSmartInput({ id: 'years', label: `Years ${state.direction === 'future' ? 'Ahead' : 'Ago'}`, min: 1, max: 50, value: state.years, step: 1, suffix: ' years', onChange: (v) => { state.years = v; update(); } }));
    inputs.appendChild(y);
  }

  renderInputs();
  update();
  return container;
}
