/**
 * FinSuite OS - TDS Calculator
 * Tax Deducted at Source estimator
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

interface TDSRate {
  type: string;
  section: string;
  rate: number;
  threshold: number;
}

const TDS_RATES: TDSRate[] = [
  { type: 'Salary', section: '192', rate: 0, threshold: 0 }, // As per slab
  { type: 'Interest - Banks', section: '194A', rate: 10, threshold: 40000 },
  { type: 'Interest - Others', section: '194A', rate: 10, threshold: 5000 },
  { type: 'Professional Fees', section: '194J', rate: 10, threshold: 30000 },
  { type: 'Commission/Brokerage', section: '194H', rate: 5, threshold: 15000 },
  { type: 'Rent - Property', section: '194I', rate: 10, threshold: 240000 },
  { type: 'Rent - P&M/Equipment', section: '194I', rate: 2, threshold: 240000 },
  { type: 'Contractor', section: '194C', rate: 2, threshold: 30000 },
  { type: 'Dividends', section: '194', rate: 10, threshold: 5000 },
];

function calculateTDS(amount: number, typeIndex: number, hasPAN: boolean): {
  tdsAmount: number;
  effectiveRate: number;
  netAmount: number;
  applicable: boolean;
} {
  const rate = TDS_RATES[typeIndex];
  const rateMultiplier = hasPAN ? 1 : 2; // Higher rate if no PAN
  let effectiveRate = rate.rate * rateMultiplier;

  // Check if amount exceeds threshold
  if (amount < rate.threshold) {
    return { tdsAmount: 0, effectiveRate: 0, netAmount: amount, applicable: false };
  }

  // Cap at 20% for non-PAN
  if (!hasPAN && effectiveRate > 20) effectiveRate = 20;

  const tdsAmount = (amount * effectiveRate) / 100;

  return {
    tdsAmount,
    effectiveRate,
    netAmount: amount - tdsAmount,
    applicable: true
  };
}

export function render(): HTMLElement {
  const state = { amount: 100000, typeIndex: 1, hasPAN: true };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">📋 TDS Calculator</h1><p class="page-subtitle">Tax Deducted at Source Estimator</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;

  function update(): void {
    const result = calculateTDS(state.amount, state.typeIndex, state.hasPAN);
    const rate = TDS_RATES[state.typeIndex];
    results.innerHTML = '';

    // TDS status
    const status = document.createElement('div');
    status.className = 'glass-card mb-6';
    status.style.padding = 'var(--space-6)';
    status.style.borderLeft = result.applicable ? '4px solid var(--accent-cost)' : '4px solid var(--accent-gain)';
    status.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-4);">
        <span style="font-size: 2rem;">${result.applicable ? '📋' : '✅'}</span>
        <div>
          <h3 style="margin: 0;">${result.applicable ? 'TDS Applicable' : 'No TDS'}</h3>
          <p style="margin: 0; color: var(--text-secondary);">
            ${result.applicable
              ? `Section ${rate.section} - ${rate.type}`
              : `Amount below threshold of ${formatCurrency(rate.threshold)}`}
          </p>
        </div>
      </div>
    `;
    results.appendChild(status);

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'TDS Amount', value: formatCurrency(result.tdsAmount), accent: true }));
    stats.appendChild(createResultCard({ label: 'Net Amount', value: formatCurrency(result.netAmount) }));
    stats.appendChild(createResultCard({ label: 'TDS Rate', value: `${result.effectiveRate}%`, subtext: state.hasPAN ? 'With PAN' : 'Without PAN (2x)' }));
    stats.appendChild(createResultCard({ label: 'Threshold', value: formatCurrency(rate.threshold) }));
    results.appendChild(stats);

    // TDS rates table
    const table = document.createElement('div');
    table.className = 'glass-card mb-6';
    table.style.padding = 'var(--space-6)';
    table.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📊 Common TDS Rates</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Type</th>
            <th style="text-align: center; padding: var(--space-2);">Section</th>
            <th style="text-align: right; padding: var(--space-2);">Rate</th>
            <th style="text-align: right; padding: var(--space-2);">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${TDS_RATES.slice(1).map((r, i) => `
            <tr style="border-bottom: 1px solid var(--glass-border); ${i + 1 === state.typeIndex ? 'background: var(--accent-primary-alpha);' : ''}">
              <td style="padding: var(--space-2);">${r.type}</td>
              <td style="text-align: center; padding: var(--space-2);">${r.section}</td>
              <td style="text-align: right; padding: var(--space-2);">${r.rate}%</td>
              <td style="text-align: right; padding: var(--space-2);">${formatCurrency(r.threshold)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    results.appendChild(table);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`TDS on ₹${formatIndianNumber(state.amount)} for ${rate.type}. Section ${rate.section}. TDS: ₹${formatIndianNumber(result.tdsAmount)} (${result.effectiveRate}%). ${state.hasPAN ? 'With PAN' : 'Without PAN'}. Explain how to claim TDS refund if applicable.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Payment Details</h3>';

  // Type selector
  const typeDiv = document.createElement('div');
  typeDiv.style.marginBottom = 'var(--space-6)';
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'TDS Type';
  typeLabel.style.cssText = 'display: block; margin-bottom: var(--space-2); color: var(--text-secondary);';
  const typeSelect = document.createElement('select');
  typeSelect.style.cssText = 'width: 100%; padding: var(--space-3); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); color: var(--text-primary);';
  TDS_RATES.slice(1).forEach((r, i) => {
    const opt = document.createElement('option');
    opt.value = (i + 1).toString();
    opt.textContent = `${r.type} (Section ${r.section})`;
    typeSelect.appendChild(opt);
  });
  typeSelect.value = state.typeIndex.toString();
  typeSelect.onchange = (e) => { state.typeIndex = parseInt((e.target as HTMLSelectElement).value); update(); };
  typeDiv.appendChild(typeLabel);
  typeDiv.appendChild(typeSelect);
  inputs.appendChild(typeDiv);

  inputs.appendChild(createSmartInput({ id: 'amount', label: 'Payment Amount', min: 1000, max: 100000000, value: state.amount, step: 5000, prefix: '₹', currency: true, onChange: (v) => { state.amount = v; update(); } }));

  // PAN checkbox
  const panDiv = document.createElement('div');
  panDiv.style.marginTop = 'var(--space-6)';
  panDiv.style.display = 'flex';
  panDiv.style.alignItems = 'center';
  panDiv.style.gap = 'var(--space-3)';
  const panCheck = document.createElement('input');
  panCheck.type = 'checkbox';
  panCheck.id = 'hasPAN';
  panCheck.checked = state.hasPAN;
  panCheck.onchange = (e) => { state.hasPAN = (e.target as HTMLInputElement).checked; update(); };
  const panLabel = document.createElement('label');
  panLabel.htmlFor = 'hasPAN';
  panLabel.textContent = 'PAN provided to deductor';
  panLabel.style.color = 'var(--text-primary)';
  panDiv.appendChild(panCheck);
  panDiv.appendChild(panLabel);
  inputs.appendChild(panDiv);

  update();
  return container;
}
