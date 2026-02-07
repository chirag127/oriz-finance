/**
 * FinSuite OS - XIRR Calculator
 * Calculate returns on irregular cash flows
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

// XIRR calculation using Newton-Raphson method
function calculateXIRR(cashFlows: { date: Date; amount: number }[]): number {
  const daysPerYear = 365;
  const firstDate = cashFlows[0].date;

  // Convert dates to years from first date
  const flows = cashFlows.map(cf => ({
    amount: cf.amount,
    years: (cf.date.getTime() - firstDate.getTime()) / (daysPerYear * 24 * 60 * 60 * 1000)
  }));

  // Newton-Raphson iteration
  let rate = 0.1; // Initial guess 10%
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivativeNpv = 0;

    for (const flow of flows) {
      const factor = Math.pow(1 + rate, flow.years);
      npv += flow.amount / factor;
      derivativeNpv -= (flow.years * flow.amount) / (factor * (1 + rate));
    }

    const newRate = rate - npv / derivativeNpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }
    rate = newRate;
  }

  return rate * 100;
}

export function render(): HTMLElement {
  const today = new Date();
  const state = {
    cashFlows: [
      { date: new Date(today.getFullYear() - 2, 0, 15), amount: -100000 },
      { date: new Date(today.getFullYear() - 1, 6, 20), amount: -50000 },
      { date: new Date(today.getFullYear(), 0, 1), amount: -25000 },
      { date: today, amount: 200000 }
    ]
  };

  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">📊 XIRR Calculator</h1><p class="page-subtitle">Calculate returns on irregular investments</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function update(): void {
    const xirr = calculateXIRR(state.cashFlows);
    const totalInvested = state.cashFlows.filter(cf => cf.amount < 0).reduce((sum, cf) => sum + Math.abs(cf.amount), 0);
    const totalReturns = state.cashFlows.filter(cf => cf.amount > 0).reduce((sum, cf) => sum + cf.amount, 0);
    const absoluteReturn = ((totalReturns / totalInvested) - 1) * 100;

    results.innerHTML = '';

    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'XIRR', value: `${xirr.toFixed(2)}%`, accent: true, subtext: 'Annualized Return' }));
    stats.appendChild(createResultCard({ label: 'Total Invested', value: formatCurrency(totalInvested) }));
    stats.appendChild(createResultCard({ label: 'Current Value', value: formatCurrency(totalReturns) }));
    stats.appendChild(createResultCard({ label: 'Absolute Return', value: `${absoluteReturn.toFixed(1)}%` }));
    results.appendChild(stats);

    // Cash flow timeline
    const timeline = document.createElement('div');
    timeline.className = 'glass-card mb-6';
    timeline.style.padding = 'var(--space-6)';
    timeline.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📅 Cash Flow Timeline</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Date</th>
            <th style="text-align: right; padding: var(--space-2);">Amount</th>
            <th style="text-align: left; padding: var(--space-2);">Type</th>
          </tr>
        </thead>
        <tbody>
          ${state.cashFlows.map(cf => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
              <td style="padding: var(--space-2);">${formatDate(cf.date)}</td>
              <td style="text-align: right; padding: var(--space-2); color: ${cf.amount < 0 ? 'var(--accent-cost)' : 'var(--accent-gain)'};">
                ${cf.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(cf.amount))}
              </td>
              <td style="padding: var(--space-2);">${cf.amount < 0 ? 'Investment' : 'Redemption'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    results.appendChild(timeline);

    // Info box
    const info = document.createElement('div');
    info.className = 'glass-card mb-6';
    info.style.padding = 'var(--space-4)';
    info.innerHTML = `
      <h4 style="margin-bottom: var(--space-2);">💡 What is XIRR?</h4>
      <p style="color: var(--text-secondary); margin: 0;">
        <strong>Extended Internal Rate of Return (XIRR)</strong> calculates the annualized return on investments made at irregular intervals.
        Unlike CAGR which assumes a single lumpsum, XIRR accounts for multiple investments and withdrawals on different dates.
      </p>
    `;
    results.appendChild(info);

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`XIRR: ${xirr.toFixed(2)}%. Total invested: ₹${formatIndianNumber(totalInvested)} over multiple dates. Current value: ₹${formatIndianNumber(totalReturns)}. Is this a good return? Compare with benchmarks.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  function renderInputs(): void {
    inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Cash Flows</h3>';
    inputs.innerHTML += '<p style="color: var(--text-secondary); margin-bottom: var(--space-4);">Negative = Investment, Positive = Withdrawal/Current Value</p>';

    state.cashFlows.forEach((cf, index) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = 'var(--space-2)';
      row.style.marginBottom = 'var(--space-3)';
      row.style.alignItems = 'center';

      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = formatDate(cf.date);
      dateInput.style.cssText = 'flex: 1; padding: var(--space-2); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-primary);';
      dateInput.onchange = (e) => {
        state.cashFlows[index].date = new Date((e.target as HTMLInputElement).value);
        update();
      };

      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.value = cf.amount.toString();
      amountInput.style.cssText = 'flex: 1; padding: var(--space-2); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); color: var(--text-primary);';
      amountInput.onchange = (e) => {
        state.cashFlows[index].amount = parseFloat((e.target as HTMLInputElement).value) || 0;
        update();
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.style.cssText = 'padding: var(--space-2); background: var(--accent-cost); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer;';
      deleteBtn.onclick = () => {
        if (state.cashFlows.length > 2) {
          state.cashFlows.splice(index, 1);
          renderInputs();
          update();
        }
      };

      row.appendChild(dateInput);
      row.appendChild(amountInput);
      row.appendChild(deleteBtn);
      inputs.appendChild(row);
    });

    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add Cash Flow';
    addBtn.className = 'btn btn--secondary';
    addBtn.style.marginTop = 'var(--space-4)';
    addBtn.onclick = () => {
      state.cashFlows.push({ date: new Date(), amount: -10000 });
      renderInputs();
      update();
    };
    inputs.appendChild(addBtn);
  }

  renderInputs();
  update();
  return container;
}
