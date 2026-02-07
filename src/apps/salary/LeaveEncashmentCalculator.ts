/**
 * FinSuite OS - Leave Encashment Calculator
 * Calculate payment for unused leaves
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

function calculateLeaveEncashment(basic: number, da: number, leaveDays: number, isRetirement: boolean): {
  encashmentAmount: number;
  perDayRate: number;
  taxExempt: number;
  taxable: number;
  formula: string;
} {
  // Per day rate = (Basic + DA) / 30
  const perDayRate = (basic + da) / 30;
  const encashmentAmount = perDayRate * leaveDays;

  // Tax exemption (on retirement only)
  let taxExempt = 0;
  let taxable = encashmentAmount;

  if (isRetirement) {
    // Exempt: Least of:
    // 1. Actual amount received
    // 2. 30 days salary × years of service
    // 3. 10 months average salary
    // 4. ₹25,00,000 (current limit)
    const limit1 = encashmentAmount;
    const limit2 = 2500000; // Government limit
    taxExempt = Math.min(limit1, limit2);
    taxable = Math.max(0, encashmentAmount - taxExempt);
  }

  return {
    encashmentAmount,
    perDayRate,
    taxExempt,
    taxable,
    formula: '(Basic + DA) ÷ 30 × Leave Days'
  };
}

export function render(): HTMLElement {
  const state = { basic: 50000, da: 10000, leaveDays: 60, isRetirement: true };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">🏖️ Leave Encashment</h1><p class="page-subtitle">Calculate payment for unused leaves</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;

  function update(): void {
    const result = calculateLeaveEncashment(state.basic, state.da, state.leaveDays, state.isRetirement);
    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Encashment Amount', value: formatCurrency(result.encashmentAmount), accent: true }));
    stats.appendChild(createResultCard({ label: 'Per Day Rate', value: formatCurrency(result.perDayRate) }));
    stats.appendChild(createResultCard({ label: 'Tax Exempt', value: formatCurrency(result.taxExempt), subtext: state.isRetirement ? 'On retirement' : 'Not applicable' }));
    stats.appendChild(createResultCard({ label: 'Taxable Amount', value: formatCurrency(result.taxable) }));
    results.appendChild(stats);

    // Calculation breakdown
    const breakdown = document.createElement('div');
    breakdown.className = 'glass-card mb-6';
    breakdown.style.padding = 'var(--space-6)';
    breakdown.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📝 Calculation</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">Basic Salary</td>
          <td style="text-align: right; padding: var(--space-2);">${formatCurrency(state.basic)}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">Dearness Allowance</td>
          <td style="text-align: right; padding: var(--space-2);">${formatCurrency(state.da)}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">Total (Basic + DA)</td>
          <td style="text-align: right; padding: var(--space-2); font-weight: bold;">${formatCurrency(state.basic + state.da)}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">Per Day Rate (÷ 30)</td>
          <td style="text-align: right; padding: var(--space-2);">${formatCurrency(result.perDayRate)}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--glass-border);">
          <td style="padding: var(--space-2);">Leave Days</td>
          <td style="text-align: right; padding: var(--space-2);">${state.leaveDays} days</td>
        </tr>
        <tr style="font-weight: bold; color: var(--accent-gain);">
          <td style="padding: var(--space-2);">Total Encashment</td>
          <td style="text-align: right; padding: var(--space-2);">${formatCurrency(result.encashmentAmount)}</td>
        </tr>
      </table>
    `;
    results.appendChild(breakdown);

    // Tax info
    const taxInfo = document.createElement('div');
    taxInfo.className = 'glass-card mb-6';
    taxInfo.style.padding = 'var(--space-4)';
    taxInfo.style.borderLeft = state.isRetirement ? '4px solid var(--accent-gain)' : '4px solid var(--accent-cost)';
    taxInfo.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">💰 Tax Treatment</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        ${state.isRetirement
          ? `<strong style="color: var(--accent-gain);">On Retirement:</strong> Exempt up to ₹25 lakh. Any excess is taxable as salary income.`
          : `<strong style="color: var(--accent-cost);">During Service:</strong> Fully taxable as salary income in the year of receipt.`
        }
      </p>
    `;
    results.appendChild(taxInfo);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`Leave encashment: Basic ₹${formatIndianNumber(state.basic)}, DA ₹${formatIndianNumber(state.da)}, ${state.leaveDays} days. Total: ₹${formatIndianNumber(result.encashmentAmount)}. ${state.isRetirement ? 'On retirement' : 'During service'}. Explain tax implications and planning strategies.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Leave Details</h3>';

  // Retirement toggle
  const retDiv = document.createElement('div');
  retDiv.style.marginBottom = 'var(--space-6)';
  retDiv.style.display = 'flex';
  retDiv.style.alignItems = 'center';
  retDiv.style.gap = 'var(--space-3)';
  const retCheck = document.createElement('input');
  retCheck.type = 'checkbox';
  retCheck.id = 'isRetirement';
  retCheck.checked = state.isRetirement;
  retCheck.onchange = (e) => { state.isRetirement = (e.target as HTMLInputElement).checked; update(); };
  const retLabel = document.createElement('label');
  retLabel.htmlFor = 'isRetirement';
  retLabel.textContent = 'Encashment on Retirement/Resignation';
  retLabel.style.color = 'var(--text-primary)';
  retDiv.appendChild(retCheck);
  retDiv.appendChild(retLabel);
  inputs.appendChild(retDiv);

  inputs.appendChild(createSmartInput({ id: 'basic', label: 'Basic Salary (Monthly)', min: 5000, max: 1000000, value: state.basic, step: 1000, prefix: '₹', currency: true, onChange: (v) => { state.basic = v; update(); } }));

  const da = document.createElement('div'); da.style.marginTop = 'var(--space-6)';
  da.appendChild(createSmartInput({ id: 'da', label: 'Dearness Allowance', min: 0, max: 500000, value: state.da, step: 500, prefix: '₹', currency: true, onChange: (v) => { state.da = v; update(); } }));
  inputs.appendChild(da);

  const l = document.createElement('div'); l.style.marginTop = 'var(--space-6)';
  l.appendChild(createSmartInput({ id: 'leave', label: 'Leave Days to Encash', min: 1, max: 300, value: state.leaveDays, step: 1, suffix: ' days', onChange: (v) => { state.leaveDays = v; update(); } }));
  inputs.appendChild(l);

  update();
  return container;
}
