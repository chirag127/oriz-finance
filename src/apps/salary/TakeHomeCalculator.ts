/**
 * FinSuite OS - Take-Home Salary Calculator
 * CTC to Bank Transfer breakdown
 */
import { formatCurrency, formatIndianNumber } from '@/core/math';
import { askAI } from '@/core/puter';
import { SmartChart } from '@/components/charts/SmartChart';
import { createSmartInput, createResultCard, createAIInsight, updateAIInsight } from '@/components/ui/SmartInput';

interface SalaryBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  pf: number; // Employee contribution
  employerPF: number;
  gratuity: number;
  professionalTax: number;
  incomeTax: number;
  grossSalary: number;
  totalDeductions: number;
  takeHome: number;
}

function calculateTakeHome(ctc: number, basicPercent: number = 40, hraPercent: number = 50, pfPercent: number = 12): SalaryBreakdown {
  // Yearly calculations
  const basic = (ctc * basicPercent) / 100;
  const hra = (basic * hraPercent) / 100;

  // PF on basic (capped at 15000/month = 180000/year)
  const pfBasicCap = Math.min(basic, 180000);
  const pf = (pfBasicCap * pfPercent) / 100;
  const employerPF = pf;

  // Gratuity: 4.81% of basic
  const gratuity = (basic * 4.81) / 100;

  // Special allowance = remaining after other components
  const specialAllowance = ctc - basic - hra - employerPF - gratuity;

  const grossSalary = basic + hra + specialAllowance;

  // Professional Tax (varies by state, using Karnataka rate)
  const professionalTax = 2400; // Max per year

  // Simplified tax calculation (New Regime FY 2024-25)
  let taxableIncome = grossSalary - 75000; // Standard deduction
  let incomeTax = 0;
  if (taxableIncome > 300000) incomeTax += Math.min(taxableIncome - 300000, 400000) * 0.05;
  if (taxableIncome > 700000) incomeTax += Math.min(taxableIncome - 700000, 300000) * 0.10;
  if (taxableIncome > 1000000) incomeTax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
  if (taxableIncome > 1200000) incomeTax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
  if (taxableIncome > 1500000) incomeTax += (taxableIncome - 1500000) * 0.30;
  incomeTax += incomeTax * 0.04; // Health & Education Cess

  // Rebate u/s 87A
  if (taxableIncome <= 700000) incomeTax = 0;

  const totalDeductions = pf + professionalTax + incomeTax;
  const takeHome = grossSalary - totalDeductions;

  return {
    basic,
    hra,
    specialAllowance,
    pf,
    employerPF,
    gratuity,
    professionalTax,
    incomeTax,
    grossSalary,
    totalDeductions,
    takeHome
  };
}

export function render(): HTMLElement {
  const state = { ctc: 1500000, basicPercent: 40 };
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header"><h1 class="page-title">💼 Take-Home Calculator</h1><p class="page-subtitle">CTC to In-Hand Salary Breakdown</p></header>
    <div class="calculator-layout">
      <div class="calculator-inputs glass-card" style="padding: var(--space-6);" id="inputs"></div>
      <div class="calculator-results" id="results"></div>
    </div>
  `;
  const inputs = container.querySelector('#inputs') as HTMLElement;
  const results = container.querySelector('#results') as HTMLElement;
  let chart: SmartChart | null = null;

  function update(): void {
    const result = calculateTakeHome(state.ctc, state.basicPercent);
    results.innerHTML = '';

    // Monthly and yearly summary
    const stats = document.createElement('div'); stats.className = 'stats-grid mb-6';
    stats.appendChild(createResultCard({ label: 'Monthly Take-Home', value: formatCurrency(result.takeHome / 12), accent: true }));
    stats.appendChild(createResultCard({ label: 'Yearly Take-Home', value: formatCurrency(result.takeHome) }));
    stats.appendChild(createResultCard({ label: 'Monthly Deductions', value: formatCurrency(result.totalDeductions / 12) }));
    stats.appendChild(createResultCard({ label: 'Take-Home %', value: `${((result.takeHome / state.ctc) * 100).toFixed(1)}%`, subtext: 'of CTC' }));
    results.appendChild(stats);

    // Detailed breakdown
    const breakdown = document.createElement('div');
    breakdown.className = 'glass-card mb-6';
    breakdown.style.padding = 'var(--space-6)';
    breakdown.innerHTML = `
      <h3 style="margin-bottom: var(--space-4);">📊 Salary Breakdown (Yearly)</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--glass-border);">
            <th style="text-align: left; padding: var(--space-2);">Component</th>
            <th style="text-align: right; padding: var(--space-2);">Yearly</th>
            <th style="text-align: right; padding: var(--space-2);">Monthly</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--glass-border);"><td style="padding: var(--space-2);">Basic Salary</td><td style="text-align: right;">${formatCurrency(result.basic)}</td><td style="text-align: right;">${formatCurrency(result.basic / 12)}</td></tr>
          <tr style="border-bottom: 1px solid var(--glass-border);"><td style="padding: var(--space-2);">HRA</td><td style="text-align: right;">${formatCurrency(result.hra)}</td><td style="text-align: right;">${formatCurrency(result.hra / 12)}</td></tr>
          <tr style="border-bottom: 1px solid var(--glass-border);"><td style="padding: var(--space-2);">Special Allowance</td><td style="text-align: right;">${formatCurrency(result.specialAllowance)}</td><td style="text-align: right;">${formatCurrency(result.specialAllowance / 12)}</td></tr>
          <tr style="border-bottom: 1px solid var(--glass-border); font-weight: bold;"><td style="padding: var(--space-2);">Gross Salary</td><td style="text-align: right;">${formatCurrency(result.grossSalary)}</td><td style="text-align: right;">${formatCurrency(result.grossSalary / 12)}</td></tr>
          <tr style="border-bottom: 1px solid var(--glass-border); color: var(--accent-cost);"><td style="padding: var(--space-2);">(-) PF (Employee)</td><td style="text-align: right;">${formatCurrency(result.pf)}</td><td style="text-align: right;">${formatCurrency(result.pf / 12)}</td></tr>
          <tr style="border-bottom: 1px solid var(--glass-border); color: var(--accent-cost);"><td style="padding: var(--space-2);">(-) Professional Tax</td><td style="text-align: right;">${formatCurrency(result.professionalTax)}</td><td style="text-align: right;">${formatCurrency(result.professionalTax / 12)}</td></tr>
          <tr style="border-bottom: 1px solid var(--glass-border); color: var(--accent-cost);"><td style="padding: var(--space-2);">(-) Income Tax</td><td style="text-align: right;">${formatCurrency(result.incomeTax)}</td><td style="text-align: right;">${formatCurrency(result.incomeTax / 12)}</td></tr>
          <tr style="font-weight: bold; color: var(--accent-gain);"><td style="padding: var(--space-2);">Net Take-Home</td><td style="text-align: right;">${formatCurrency(result.takeHome)}</td><td style="text-align: right;">${formatCurrency(result.takeHome / 12)}</td></tr>
        </tbody>
      </table>
    `;
    results.appendChild(breakdown);

    // Chart
    const chartBox = document.createElement('div'); chartBox.className = 'chart-container mb-6';
    const canvas = document.createElement('canvas'); chartBox.appendChild(canvas); results.appendChild(chartBox);
    if (chart) chart.destroy();
    chart = new SmartChart(canvas);
    chart.render({
      type: 'doughnut',
      labels: ['Take-Home', 'PF', 'Income Tax', 'Professional Tax', 'Employer PF', 'Gratuity'],
      datasets: [{ label: 'Amount', data: [result.takeHome, result.pf, result.incomeTax, result.professionalTax, result.employerPF, result.gratuity] }],
      title: 'CTC Distribution',
    });

    const aiBox = createAIInsight('', true);
    results.appendChild(aiBox);
    askAI(`CTC: ₹${formatIndianNumber(state.ctc)}. Monthly take-home: ₹${formatIndianNumber(result.takeHome / 12)}. Tax: ₹${formatIndianNumber(result.incomeTax)}. PF: ₹${formatIndianNumber(result.pf)}. Suggest ways to optimize take-home.`, 'advisor')
      .then((i) => updateAIInsight(aiBox, i)).catch(() => updateAIInsight(aiBox, 'AI unavailable'));
  }

  inputs.innerHTML = '<h3 style="margin-bottom: var(--space-4);">Salary Details</h3>';
  inputs.appendChild(createSmartInput({ id: 'ctc', label: 'Annual CTC', min: 300000, max: 100000000, value: state.ctc, step: 50000, prefix: '₹', currency: true, onChange: (v) => { state.ctc = v; update(); } }));
  const b = document.createElement('div'); b.style.marginTop = 'var(--space-6)';
  b.appendChild(createSmartInput({ id: 'basic', label: 'Basic % of CTC', min: 20, max: 60, value: state.basicPercent, step: 5, suffix: '%', onChange: (v) => { state.basicPercent = v; update(); } }));
  inputs.appendChild(b);

  // Info note
  const note = document.createElement('div');
  note.style.marginTop = 'var(--space-4)';
  note.style.padding = 'var(--space-3)';
  note.style.background = 'var(--glass-bg)';
  note.style.borderRadius = 'var(--radius-md)';
  note.innerHTML = '<p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">ℹ️ Tax calculated using New Regime FY 2024-25. Actual may vary based on deductions.</p>';
  inputs.appendChild(note);

  update();
  return container;
}
