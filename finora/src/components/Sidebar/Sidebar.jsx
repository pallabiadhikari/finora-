/* =====================================================
   Finora — Sidebar
   Desktop-only left navigation. Shows the brand mark
   and a vertical list of page links. The Admin entry
   only appears for admin users.

   Props:
     activePage → current page key (e.g. 'overview')
     onNavigate → called with the target page key
     isAdmin    → if true, shows the Admin link
   ===================================================== */

import Logo from '../Logo/Logo';

// Defined once at module scope so the array isn't rebuilt on
// every render. `adminOnly` items are filtered out for non-admins.
const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: 'fa-house' },
  { key: 'transactions', label: 'Transactions', icon: 'fa-receipt' },
  { key: 'income', label: 'Income', icon: 'fa-sack-dollar' },
  { key: 'insights', label: 'Insights', icon: 'fa-chart-simple' },
  { key: 'budgets', label: 'Budgets', icon: 'fa-bullseye' },
  { key: 'goals', label: 'Goals', icon: 'fa-flag' },
  { key: 'settings', label: 'Settings', icon: 'fa-gear' },
  { key: 'admin', label: 'Admin', icon: 'fa-shield-halved', adminOnly: true },
];

function Sidebar({ activePage, onNavigate, isAdmin }) {
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside className="sidebar">
      {/* Brand — clicking it returns to the dashboard */}
      <button
        type="button"
        className="sidebar-brand"
        onClick={() => onNavigate('overview')}
        aria-label="Go to dashboard"
      >
        <Logo size={36} decorative />
        <span className="sidebar-name">Finora</span>
      </button>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {visibleItems.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`sidebar-nav-item${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(item.key)}
              aria-current={isActive ? 'page' : undefined}
            >
              <i
                className={`fas ${item.icon}`}
                aria-hidden="true"
              ></i>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;