/**
 * FinSuite OS - Rule of 72 Calculator
 * Quick estimation for doubling money
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateRuleOf72(rate: number, amount: number): {
  yearsToDouble: number;
  exactYears: number;
  futureValues: { years: number; value: number; multiple: string }[];
} {
  // Rule of 72 approximation
  const yearsToDouble = 72 / rate;

  // Exact calculation using compound interest
  const exactYears = Math.log(2) / Math.log(1 + rate / 100);

  // Project future values
  const futureValues: { years: number; value: number; multiple: string }[] = [];
  for (let m = 1; m <= 5; m++) {
    const years = yearsToDouble * m;
    const value = amount * Math.pow(2, m);
    futureValues.push({ years, value, multiple: `${m}x → ${Math.pow(2, m)}x` });
  }

  return { yearsToDouble, exactYears, futureValues };
}

export function render(): HTMLElement {
  const state = { rate: 12, amount: 100000 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">📐 Rule of 72</h1><p class="page-subtitle">Quick mental math for doubling your money</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateRuleOf72(state.rate, state.amount);
    results.innerHTML = '';

    // Main result
    const mainResult = document.createElement('div');
    mainResult.className = 'glass-card mb-6';
    mainResult.style.padding = 'var(--space-6)';
    mainResult.style.textAlign = 'center';
    mainResult.innerHTML = `
      <h3 style="color: var(--text-secondary); margin-bottom: var(--space-2);">Your money will double in approximately</h3>
      <div style="font-size: 3rem; font-weight: bold; color: var(--accent-primary); margin-bottom: var(--space-2);">${result.yearsToDouble.toFixed(1)} years</div>
      <p style="color: var(--text-secondary);">at ${state.rate}% annual return</p>
      <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-2);">
        (Exact: ${result.exactYears.toFixed(2)} years)
      </p>
    `;
    results.appendChild(mainResult);

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Initial Amount', value: formatCurrency(state.amount) }));
    stats.appendChild(createResultCard({ label: 'After Doubling', value: formatCurrency(state.amount * 2), accent: true }));
    stats.appendChild(createResultCard({ label: 'Rule of 72 Years', value: `${result.yearsToDouble.toFixed(1)}`, subtext: '72 ÷ Rate' }));
    stats.appendChild(createResultCard({ label: 'Exact Years', value: `${result.exactYears.toFixed(2)}` }));
    results.appendChild(stats);

    // Doubling timeline
    const timeline = document.createElement('div');
    timeline.className = 'glass-card mb-6';
    timeline.style.padding = 'var(--space-6)';
    timeline.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📈 Wealth Multiplication Timeline</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Doubling</th>
            <th style="text-align: right; padding: var(--space-2);">Years</th>
            <th style="text-align: right; padding: var(--space-2);">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <td style="padding: var(--space-2);">Start (1x)</td>
            <td style="text-align: right; padding: var(--space-2);">0</td>
            <td style="text-align: right; padding: var(--space-2);">${formatCurrency(state.amount)}</td>
          </tr>
          ${result.futureValues.map((fv) => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
              <td style="padding: var(--space-2);">${fv.multiple}</td>
              <td style="text-align: right; padding: var(--space-2);">${fv.years.toFixed(1)}</td>
              <td style="text-align: right; padding: var(--space-2); color: var(--accent-gain);">${formatCurrency(fv.value)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    results.appendChild(timeline);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'line',
      labels: ['0', ...result.futureValues.map(fv => fv.years.toFixed(0))],
      datasets: [{ label: 'Value', data: [state.amount, ...result.futureValues.map(fv => fv.value)] }],
      title: 'Exponential Growth',
    });

    // Formula explanation
    const formula = document.createElement('div');
    formula.className = 'glass-card mb-6';
    formula.style.padding = 'var(--space-4)';
    formula.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">💡 The Rule of 72</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        <strong>Formula:</strong> Years to Double = 72 ÷ Interest Rate<br><br>
        This mental math shortcut works because 72 is divisible by many common interest rates (2, 3, 4, 6, 8, 9, 12).
        It's most accurate for rates between 6-10%.
      </p>
    `;
    results.appendChild(formula);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Rule of 72: At ${state.rate}% return, ₹${formatIndianNumber(state.amount)} doubles in ${result.yearsToDouble.toFixed(1)} years. Compare with inflation and suggest best investment options for this return.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Calculate</h3>';
  inputs.appendChild(createSmartInput({ id: 'rate', label: 'Expected Annual Return', min: 1, max: 50, value: state.rate, step: 0.5, suffix: '%', onChange: (v) => { state.rate = v; update(); } }));

  const a = document.createElement('div'); a.style.marginTop = 'var(--space-6)';
  a.appendChild(createSmartInput({ id: 'amount', label: 'Initial Investment', min: 100, max: 100000000, value: state.amount, step: 10000, prefix: '₹', currency: true, onChange: (v) => { state.amount = v; update(); } }));
  inputs.appendChild(a);

  // Quick rates
  const quickRates = document.createElement('div');
  quickRates.style.marginTop = 'var(--space-6)';
  quickRates.innerHTML = '<label style="display: block; margin-bottom: var(--space-2); color: var(--text-secondary);">Quick Select Rate</label>';
  const rateButtons = document.createElement('div');
  rateButtons.style.display = 'flex';
  rateButtons.style.flexWrap = 'wrap';
  rateButtons.style.gap = 'var(--space-2)';
  [6, 8, 10, 12, 15, 20].forEach(r => {
    const btn = document.createElement('button');
    btn.textContent = `${r}%`;
    btn.className = `btn btn--${state.rate === r ? 'primary' : 'secondary'}`;
    btn.style.padding = 'var(--space-2) var(--space-3)';
    btn.onclick = () => { state.rate = r; update(); };
    rateButtons.appendChild(btn);
  });
  quickRates.appendChild(rateButtons);
  inputs.appendChild(quickRates);

  update();
  return container;
}
