/**
 * FinSuite OS - Gratuity Calculator
 * End of service benefit
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateGratuity(lastBasic: number, lastDA: number, years: number, months: number, isGovernment: boolean): {
  gratuity: number;
  formula: string;
  eligible: boolean;
  taxExempt: number;
  taxable: number;
} {
  const totalYears = years + (months >= 6 ? 1 : months / 12); // Round up if >= 6 months
  const eligible = totalYears >= 5;

  let gratuity = 0;
  let formula = '';

  if (isGovernment) {
    // Government: (Basic + DA) × 15 / 26 × Years
    gratuity = ((lastBasic + lastDA) * 15 * Math.floor(totalYears)) / 26;
    formula = '(Basic + DA) × 15 ÷ 26 × Years';
  } else {
    // Private: Basic × 15 / 26 × Years
    gratuity = (lastBasic * 15 * Math.floor(totalYears)) / 26;
    formula = 'Basic × 15 ÷ 26 × Years';
  }

  // Tax exemption limit: ₹20 lakh
  const taxExemptLimit = 2000000;
  const taxExempt = Math.min(gratuity, taxExemptLimit);
  const taxable = Math.max(0, gratuity - taxExemptLimit);

  return { gratuity, formula, eligible, taxExempt, taxable };
}

export function render(): HTMLElement {
  const state = { basic: 50000, da: 10000, years: 10, months: 6, isGovernment: false };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">🎁 Gratuity Calculator</h1><p class="page-subtitle">Calculate your end-of-service gratuity</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;

  function update(): void {
    const result = calculateGratuity(state.basic, state.da, state.years, state.months, state.isGovernment);
    results.innerHTML = '';

    // Eligibility status
    const status = document.createElement('div');
    status.className = 'glass-card mb-6';
    status.style.padding = 'var(--space-6)';
    status.style.borderLeft = result.eligible ? '4px solid var(--accent-gain)' : '4px solid var(--accent-cost)';
    status.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-4);">
        <span style="font-size: 2rem;">${result.eligible ? '✅' : '⚠️'}</span>
        <div>
          <h3 style="margin: 0; color: ${result.eligible ? 'var(--accent-gain)' : 'var(--accent-cost)'};">
            ${result.eligible ? 'Eligible for Gratuity' : 'Not Yet Eligible'}
          </h3>
          <p style="margin: 0; color: var(--text-secondary);">
            ${result.eligible ? `${state.years} years ${state.months} months of service` : 'Minimum 5 years of continuous service required'}
          </p>
        </div>
      </div>
    `;
    results.appendChild(status);

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Gratuity Amount', value: formatCurrency(result.gratuity), accent: true }));
    stats.appendChild(createResultCard({ label: 'Tax Exempt', value: formatCurrency(result.taxExempt), subtext: 'Up to ₹20 lakh' }));
    stats.appendChild(createResultCard({ label: 'Taxable Amount', value: formatCurrency(result.taxable) }));
    stats.appendChild(createResultCard({ label: 'Service Period', value: `${state.years}y ${state.months}m` }));
    results.appendChild(stats);

    // Formula explanation
    const formula = document.createElement('div');
    formula.className = 'glass-card mb-6';
    formula.style.padding = 'var(--space-6)';
    formula.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📝 Calculation Formula</h3>
      <p style="color: var(--text-secondary); margin-bottom: var(--space-3);">
        <strong>${state.isGovernment ? 'Government Employees' : 'Private Sector'}:</strong> ${result.formula}
      </p>
      <p style="margin: 0; color: var(--text-secondary);">
        = ${formatCurrency(state.isGovernment ? state.basic + state.da : state.basic)} × 15 ÷ 26 × ${Math.floor(state.years + (state.months >= 6 ? 1 : 0))}<br>
        = <strong style="color: var(--accent-primary);">${formatCurrency(result.gratuity)}</strong>
      </p>
    `;
    results.appendChild(formula);

    // Info box
    const info = document.createElement('div');
    info.className = 'glass-card mb-6';
    info.style.padding = 'var(--space-4)';
    info.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">💡 Key Points</h4>
      <ul style="margin: 0; padding-left: var(--space-4); color: var(--text-secondary);">
        <li>Minimum 5 years of continuous service required</li>
        <li>15 days' wages for each completed year</li>
        <li>26 days = monthly working days (excludes Sundays)</li>
        <li>Tax exempt up to ₹20 lakh as per current rules</li>
        <li>Service of 6+ months in final year is rounded up</li>
      </ul>
    `;
    results.appendChild(info);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Gratuity calculation: Basic ₹${formatIndianNumber(state.basic)}, DA ₹${formatIndianNumber(state.da)}, ${state.years} years ${state.months} months service. Gratuity: ₹${formatIndianNumber(result.gratuity)}. ${state.isGovernment ? 'Government' : 'Private'} sector. Explain tax implications and eligibility rules.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Employment Details</h3>';

  // Sector toggle
  const sectorDiv = document.createElement('div');
  sectorDiv.style.marginBottom = 'var(--space-6)';
  sectorDiv.style.display = 'flex';
  sectorDiv.style.alignItems = 'center';
  sectorDiv.style.gap = 'var(--space-3)';
  const sectorCheck = document.createElement('input');
  sectorCheck.type = 'checkbox';
  sectorCheck.id = 'isGovt';
  sectorCheck.checked = state.isGovernment;
  sectorCheck.onchange = (e) => { state.isGovernment = (e.target as HTMLInputElement).checked; update(); };
  const sectorLabel = document.createElement('label');
  sectorLabel.htmlFor = 'isGovt';
  sectorLabel.textContent = 'Government Employee';
  sectorLabel.style.color = 'var(--text-primary)';
  sectorDiv.appendChild(sectorCheck);
  sectorDiv.appendChild(sectorLabel);
  inputs.appendChild(sectorDiv);

  inputs.appendChild(createSmartInput({ id: 'basic', label: 'Last Drawn Basic (Monthly)', min: 5000, max: 1000000, value: state.basic, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.basic = v; update(); } }));

  const da = document.createElement('div'); da.style.marginTop = 'var(--space-6)';
  da.appendChild(createSmartInput({ id: 'da', label: 'Dearness Allowance (Monthly)', min: 0, max: 500000, value: state.da, step: 500, prefix: '₹', currency: true, onChange: (v) => { state.da = v; update(); } }));
  inputs.appendChild(da);

  const y = document.createElement('div'); y.style.marginTop = 'var(--space-6)';
  y.appendChild(createSmartInput({ id: 'years', label: 'Years of Service', min: 0, max: 50, value: state.years, step: 1, suffix: ' years', onChange: (v) => { state.years = v; update(); } }));
  inputs.appendChild(y);

  const m = document.createElement('div'); m.style.marginTop = 'var(--space-6)';
  m.appendChild(createSmartInput({ id: 'months', label: 'Additional Months', min: 0, max: 11, value: state.months, step: 1, suffix: ' months', onChange: (v) => { state.months = v; update(); } }));
  inputs.appendChild(m);

  update();
  return container;
}
