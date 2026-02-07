/**
 * FinSuite OS - Shell (Dock + Sidebar + Window Manager)
 * macOS-like UI with glassmorphism
 */

import { router, routes, type Route } from './router';

const DRIVE_LABELS: Record<Route['drive'], { label: string; icon: string }> = {
  wealth: { label: 'Wealth', icon: '💎' },
  banking: { label: 'Banking', icon: '🏦' },
  loans: { label: 'Loans & EMI', icon: '💳' },
  invest: { label: 'Investments', icon: '📈' },
  tax: { label: 'Tax', icon: '📋' },
  salary: { label: 'Salary', icon: '💼' },
  gen: { label: 'General', icon: '🔢' },
  market: { label: 'Markets', icon: '📊' },
  news: { label: 'News', icon: '📰' },
  util: { label: 'Utilities', icon: '🛠️' },
  system: { label: 'System', icon: '⚙️' },
};

class Shell {
  private sidebarOpen = true;
  private mainContent: HTMLElement | null = null;

  /**
   * Initialize the shell
   */
  init(container: HTMLElement): void {
    container.innerHTML = this.render();

    // Get main content container
    this.mainContent = document.getElementById('main-content');

    // Initialize router with content container
    if (this.mainContent) {
      router.init(this.mainContent);
    }

    // Setup event listeners
    this.setupEventListeners();

    // Update active states on navigation
    router.onNavigate((path) => this.updateActiveStates(path));
  }

  /**
   * Render the shell layout
   */
  private render(): string {
    return `
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-btn" id="sidebar-toggle" aria-label="Toggle menu">
        ☰
      </button>

      <!-- Sidebar Overlay -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>

      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-logo">💎</div>
          <span class="sidebar-title">FinSuite OS</span>
        </div>

        ${this.renderSidebarNav()}
      </aside>

      <!-- Main Content -->
      <main class="main" id="main-content">
        <!-- Content loaded by router -->
      </main>

      <!-- Dock -->
      <nav class="dock" id="dock">
        ${this.renderDock()}
      </nav>

      <!-- Toast Container -->
      <div class="toast-container" id="toast-container"></div>
    `;
  }

  /**
   * Render sidebar navigation grouped by drive
   */
  private renderSidebarNav(): string {
    const drives: Route['drive'][] = ['system', 'wealth', 'banking', 'loans', 'invest', 'tax', 'salary', 'gen', 'market', 'news', 'util'];

    return drives
      .map((drive) => {
        const { label, icon } = DRIVE_LABELS[drive];
        const driveRoutes = router.getRoutesByDrive(drive);

        return `
          <section class="sidebar-section">
            <h3 class="sidebar-section-title">${icon} ${label}</h3>
            <nav class="sidebar-nav">
              ${driveRoutes
                .map(
                  (route) => `
                <a href="${route.path}"
                   class="sidebar-link"
                   data-path="${route.path}"
                   onclick="event.preventDefault(); window.router.navigate('${route.path}')">
                  <span class="sidebar-link-icon">${route.icon}</span>
                  <span>${route.title}</span>
                </a>
              `
                )
                .join('')}
            </nav>
          </section>
        `;
      })
      .join('');
  }

  /**
   * Render the dock with quick access apps
   */
  private renderDock(): string {
    // Quick access items for dock
    const dockItems: Route[] = [
      routes.find((r) => r.path === '/system/dashboard')!,
      routes.find((r) => r.path === '/apps/wealth/sip')!,
      routes.find((r) => r.path === '/apps/banking/emi-home')!,
      routes.find((r) => r.path === '/apps/market/crypto')!,
      routes.find((r) => r.path === '/apps/news/tech')!,
      routes.find((r) => r.path === '/system/chat')!,
    ].filter(Boolean);

    return dockItems
      .map(
        (route) => `
        <button class="dock-item"
                data-path="${route.path}"
                title="${route.title}"
                onclick="window.router.navigate('${route.path}')">
          <span class="dock-icon">${route.icon}</span>
        </button>
      `
      )
      .join('');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Sidebar toggle for mobile
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const closeSidebar = () => {
      this.sidebarOpen = false;
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    };

    const openSidebar = () => {
      this.sidebarOpen = true;
      sidebar?.classList.add('open');
      overlay?.classList.add('active');
    };

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        if (this.sidebarOpen) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    // Close sidebar when clicking overlay
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (
        sidebar &&
        toggleBtn &&
        this.sidebarOpen &&
        !sidebar.contains(target) &&
        !toggleBtn.contains(target) &&
        !overlay?.contains(target) &&
        window.innerWidth < 1024
      ) {
        closeSidebar();
      }
    });
  }

  /**
   * Update active states in sidebar and dock
   */
  private updateActiveStates(path: string): void {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      const linkPath = link.getAttribute('data-path');
      link.classList.toggle('active', linkPath === path);
    });

    // Update dock items
    document.querySelectorAll('.dock-item').forEach((item) => {
      const itemPath = item.getAttribute('data-path');
      item.classList.toggle('active', itemPath === path);
    });

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar) {
        sidebar.classList.remove('open');
        this.sidebarOpen = false;
      }
      if (overlay) {
        overlay.classList.remove('active');
      }
    }
  }
}

// Singleton instance
export const shell = new Shell();

// Global toast function
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="btn btn--ghost btn--sm" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => toast.remove(), 5000);
}

// Make toast globally available
declare global {
  interface Window {
    showToast: typeof showToast;
  }
}
window.showToast = showToast;
