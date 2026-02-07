/**
 * FinSuite OS - Dashboard (System Home)
 * Main desktop with quick access to all apps
 */

import { routes, type Route } from '@/core/router';

const DRIVE_LABELS: Record<Route['drive'], { label: string; icon: string; color: string }> = {
  wealth: { label: 'Wealth', icon: '💎', color: 'var(--accent-growth)' },
  banking: { label: 'Banking', icon: '🏦', color: 'var(--accent-primary)' },
  loans: { label: 'Loans & EMI', icon: '💳', color: 'var(--accent-cost)' },
  invest: { label: 'Investments', icon: '📈', color: 'var(--accent-gain)' },
  tax: { label: 'Tax', icon: '📋', color: 'var(--accent-warning)' },
  salary: { label: 'Salary', icon: '💼', color: 'var(--accent-secondary)' },
  gen: { label: 'General', icon: '🔢', color: 'var(--accent-neutral)' },
  market: { label: 'Markets', icon: '📊', color: 'var(--accent-secondary)' },
  news: { label: 'News', icon: '📰', color: 'var(--accent-warning)' },
  util: { label: 'Utilities', icon: '🛠️', color: 'var(--accent-neutral)' },
  system: { label: 'System', icon: '⚙️', color: 'var(--text-tertiary)' },
};

export function render(): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = `
    <header class="page-header">
      <h1 class="page-title">Welcome to FinSuite OS</h1>
      <p class="page-subtitle">Your premium financial planning operating system with 40+ apps</p>
    </header>

    <!-- Quick Stats -->
    <section class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--gradient-success);">💎</div>
        <div class="stat-value">40+</div>
        <div class="stat-label">Financial Apps</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--gradient-accent);">🤖</div>
        <div class="stat-value">AI</div>
        <div class="stat-label">Powered Insights</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #7c3aed, #6d28d9);">☁️</div>
        <div class="stat-value">Cloud</div>
        <div class="stat-label">Sync Enabled</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">📊</div>
        <div class="stat-value">Real-time</div>
        <div class="stat-label">Market Data</div>
      </div>
    </section>

    <!-- App Grid by Drive -->
    ${renderDriveSection('wealth')}
    ${renderDriveSection('banking')}
    ${renderDriveSection('loans')}
    ${renderDriveSection('invest')}
    ${renderDriveSection('tax')}
    ${renderDriveSection('salary')}
    ${renderDriveSection('gen')}
    ${renderDriveSection('market')}
    ${renderDriveSection('news')}
    ${renderDriveSection('util')}

    <!-- Footer -->
    <footer style="margin-top: var(--space-12); padding: var(--space-6); text-align: center; color: var(--text-tertiary); font-size: var(--text-sm);">
      <p>FinSuite OS v1.0 • Powered by <a href="https://developer.puter.com" target="_blank" style="color: var(--accent-primary); text-decoration: none;">Puter</a></p>
    </footer>
  `;

  return container;
}

function renderDriveSection(drive: Route['drive']): string {
  const { label, icon, color } = DRIVE_LABELS[drive];
  const driveRoutes = routes.filter((r) => r.drive === drive);

  return `
    <section class="mb-6">
      <h2 style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4); font-size: var(--text-xl); color: var(--text-primary);">
        <span style="color: ${color};">${icon}</span>
        ${label}
      </h2>
      <div class="grid grid--auto">
        ${driveRoutes
          .map(
            (route) => `
          <button
            class="glass-card"
            style="
              padding: var(--space-5);
              text-align: left;
              cursor: pointer;
              border: 1px solid var(--glass-border);
            "
            onclick="window.router.navigate('${route.path}')"
          >
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <span style="font-size: 24px;">${route.icon}</span>
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${route.title}</div>
                <div style="font-size: var(--text-xs); color: var(--text-tertiary);">Open app</div>
              </div>
            </div>
          </button>
        `
          )
          .join('')}
      </div>
    </section>
  `;
}
